// frontend/src/pages/Templates.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  AutoAwesome,
  Article,
  Email,
  Code,
  Campaign,
  Description,
  Translate,
  Science,
  Newspaper,
  ShoppingCart,
  Favorite,
  ContentCopy,
  Star,
  Bookmark,
  Visibility,
  Edit,
  Delete,
  Refresh,
  Sort,
  Category,
  CalendarToday,
  Person,
  TrendingUp,
  ThumbUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { templateService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Templates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery(
    ['templates', { search: searchTerm, category: categoryFilter, sort_by: sortBy }],
    () => templateService.getTemplates({
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      sort_by: sortBy,
    }),
    {
      select: (data) => data.data,
    }
  );

  const useTemplateMutation = useMutation(
    (templateId) => templateService.useTemplate(templateId),
    {
      onSuccess: (data) => {
        toast.success('Template applied successfully!');
        navigate('/generate', { state: { template: data } });
      },
      onError: (error) => {
        toast.error('Failed to apply template');
      },
    }
  );

  const favoriteTemplateMutation = useMutation(
    (templateId) => templateService.favoriteTemplate(templateId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates');
        toast.success('Template favorited!');
      },
      onError: (error) => {
        toast.error('Failed to favorite template');
      },
    }
  );

  const getContentIcon = (type) => {
    switch (type) {
      case 'blog_post':
        return <Article />;
      case 'email':
        return <Email />;
      case 'code':
        return <Code />;
      case 'marketing_copy':
        return <Campaign />;
      case 'summary':
        return <Description />;
      case 'translation':
        return <Translate />;
      case 'technical_docs':
        return <Science />;
      case 'news_article':
        return <Newspaper />;
      case 'product_description':
        return <ShoppingCart />;
      case 'creative_writing':
        return <Favorite />;
      default:
        return <AutoAwesome />;
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'blog_post':
        return '#2196F3';
      case 'email':
        return '#4CAF50';
      case 'code':
        return '#9C27B0';
      case 'marketing_copy':
        return '#FF9800';
      case 'summary':
        return '#607D8B';
      case 'translation':
        return '#795548';
      case 'technical_docs':
        return '#3F51B5';
      case 'news_article':
        return '#FF5722';
      case 'product_description':
        return '#009688';
      case 'creative_writing':
        return '#E91E63';
      default:
        return '#757575';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'technical', label: 'Technical' },
    { value: 'creative', label: 'Creative' },
    { value: 'academic', label: 'Academic' },
    { value: 'personal', label: 'Personal' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'created_at', label: 'Newest' },
    { value: 'name', label: 'Name' },
    { value: 'usage_count', label: 'Most Used' },
  ];

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleUseTemplate = (template) => {
    useTemplateMutation.mutate(template.id);
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
  };

  const handleFavoriteTemplate = (template) => {
    favoriteTemplateMutation.mutate(template.id);
  };

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template.prompt);
    toast.success('Template prompt copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Content Templates
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Pre-built prompts to jumpstart your content creation
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Create Template
            </Button>
          </Box>

          {/* Filters */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              mb: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => queryClient.invalidateQueries('templates')}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </motion.div>

      {/* Templates Grid */}
      <Box sx={{ px: 3, pb: 3 }}>
        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Failed to load templates. Please try again.
          </Alert>
        ) : templates && templates.length > 0 ? (
          <Grid container spacing={3}>
            <AnimatePresence>
              {templates.map((template, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: getContentColor(template.content_type),
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getContentIcon(template.content_type)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {template.name}
                            </Typography>
                            <Chip
                              label={template.content_type.replace('_', ' ')}
                              size="small"
                              sx={{
                                bgcolor: `${getContentColor(template.content_type)}20`,
                                color: getContentColor(template.content_type),
                                textTransform: 'capitalize',
                              }}
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleFavoriteTemplate(template)}
                          >
                            <Star
                              sx={{
                                color: template.is_favorited ? '#FFD700' : 'text.secondary',
                              }}
                            />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {truncateText(template.description)}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={<TrendingUp />}
                              label={`${template.usage_count || 0} uses`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<Star />}
                              label={`${template.rating || 0}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(template.created_at)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AutoAwesome />}
                            onClick={() => handleUseTemplate(template)}
                            sx={{ flex: 1, borderRadius: 2 }}
                          >
                            Use Template
                          </Button>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => handleViewTemplate(template)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyTemplate(template)}
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No templates found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first template to get started'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Create Template
            </Button>
          </Box>
        )}
      </Box>

      {/* Template Preview Dialog */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedTemplate?.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Copy">
                <IconButton onClick={() => selectedTemplate && handleCopyTemplate(selectedTemplate)}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Favorite">
                <IconButton onClick={() => selectedTemplate && handleFavoriteTemplate(selectedTemplate)}>
                  <Star
                    sx={{
                      color: selectedTemplate?.is_favorited ? '#FFD700' : 'text.secondary',
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: getContentColor(selectedTemplate.content_type),
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  {getContentIcon(selectedTemplate.content_type)}
                </Avatar>
                <Box>
                  <Chip
                    label={selectedTemplate.content_type.replace('_', ' ')}
                    sx={{
                      bgcolor: `${getContentColor(selectedTemplate.content_type)}20`,
                      color: getContentColor(selectedTemplate.content_type),
                      textTransform: 'capitalize',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created {formatDate(selectedTemplate.created_at)} • {selectedTemplate.usage_count || 0} uses
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedTemplate.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Template Prompt
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedTemplate.prompt}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => {
              if (selectedTemplate) {
                handleUseTemplate(selectedTemplate);
                setShowTemplateDialog(false);
              }
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create New Template
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Template Name"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Content Type</InputLabel>
              <Select label="Content Type">
                <MenuItem value="blog_post">Blog Post</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="marketing_copy">Marketing Copy</MenuItem>
                <MenuItem value="code">Code</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="translation">Translation</MenuItem>
                <MenuItem value="technical_docs">Technical Docs</MenuItem>
                <MenuItem value="news_article">News Article</MenuItem>
                <MenuItem value="product_description">Product Description</MenuItem>
                <MenuItem value="creative_writing">Creative Writing</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Template Prompt"
              multiline
              rows={6}
              placeholder="Enter your template prompt here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Template</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        }}
        onClick={() => setShowCreateDialog(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Templates;
