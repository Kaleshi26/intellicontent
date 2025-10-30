// frontend/src/pages/History.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Pagination,
  Skeleton,
  Alert,
  Fab,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  ContentCopy,
  Download,
  Share,
  Delete,
  Edit,
  Visibility,
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
  Refresh,
  Add,
  Sort,
  CalendarToday,
  AccessTime,
  Person,
  Tag,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { contentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  const pageSize = 12;

  // Fetch content with filters
  const { data: contentData, isLoading, error } = useQuery(
    ['content', { search: searchTerm, content_type: contentTypeFilter, sort_by: sortBy, sort_order: sortOrder, page, limit: pageSize }],
    () => contentService.getContents({
      search: searchTerm || undefined,
      content_type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit: pageSize,
    }),
    {
      select: (data) => data.data,
    }
  );

  const deleteContentMutation = useMutation(
    (id) => contentService.deleteContent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('content');
        toast.success('Content deleted successfully');
        setShowDeleteDialog(false);
        setContentToDelete(null);
      },
      onError: (error) => {
        toast.error('Failed to delete content');
      },
    }
  );

  const shareContentMutation = useMutation(
    (id) => contentService.shareContent(id),
    {
      onSuccess: (data) => {
        navigator.clipboard.writeText(data.share_url);
        toast.success('Share link copied to clipboard');
      },
      onError: (error) => {
        toast.error('Failed to share content');
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

  const contentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'blog_post', label: 'Blog Post' },
    { value: 'email', label: 'Email' },
    { value: 'code', label: 'Code' },
    { value: 'marketing_copy', label: 'Marketing Copy' },
    { value: 'summary', label: 'Summary' },
    { value: 'translation', label: 'Translation' },
    { value: 'technical_docs', label: 'Technical Docs' },
    { value: 'news_article', label: 'News Article' },
    { value: 'product_description', label: 'Product Description' },
    { value: 'creative_writing', label: 'Creative Writing' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Modified' },
    { value: 'title', label: 'Title' },
    { value: 'content_type', label: 'Type' },
  ];

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (event) => {
    setContentTypeFilter(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setShowContentDialog(true);
  };

  const handleDeleteContent = (content) => {
    setContentToDelete(content);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (contentToDelete) {
      deleteContentMutation.mutate(contentToDelete.id);
    }
  };

  const handleShareContent = (content) => {
    shareContentMutation.mutate(content.id);
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content.content);
    toast.success('Content copied to clipboard');
  };

  const handleDownloadContent = (content) => {
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title || 'content'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 150) => {
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
                Content History
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Browse and manage your generated content
      </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/generate')}
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
              Generate New
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
                  placeholder="Search content..."
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
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={contentTypeFilter}
                    onChange={handleFilterChange}
                    label="Content Type"
                  >
                    {contentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
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
                  startIcon={<Sort />}
                  onClick={handleSortOrderToggle}
                  sx={{ borderRadius: 2 }}
                >
                  {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </motion.div>

      {/* Content Grid */}
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
            Failed to load content. Please try again.
          </Alert>
        ) : contentData && contentData.length > 0 ? (
          <>
            <Grid container spacing={3}>
              <AnimatePresence>
                {contentData.map((content, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={content.id}>
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
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
                          },
                        }}
                        onClick={() => handleViewContent(content)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: getContentColor(content.content_type),
                                mr: 2,
                                width: 40,
                                height: 40,
                              }}
                            >
                              {getContentIcon(content.content_type)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {content.title || 'Untitled Content'}
                              </Typography>
                  <Chip 
                                label={content.content_type.replace('_', ' ')}
                    size="small"
                                sx={{
                                  bgcolor: `${getContentColor(content.content_type)}20`,
                                  color: getContentColor(content.content_type),
                                  textTransform: 'capitalize',
                                }}
                              />
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle more options
                              }}
                            >
                              <MoreVert />
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
                            {truncateText(content.content)}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(content.created_at)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewContent(content);
                                  }}
                                >
                    <Visibility />
                  </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyContent(content);
                                  }}
                                >
                                  <ContentCopy />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Share">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareContent(content);
                                  }}
                                >
                                  <Share />
                  </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil((contentData.total || 0) / pageSize)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No content found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || contentTypeFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Start generating amazing content with AI'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/generate')}
              sx={{ borderRadius: 2 }}
            >
              Generate Your First Content
            </Button>
          </Box>
        )}
      </Box>

      {/* Content View Dialog */}
      <Dialog
        open={showContentDialog}
        onClose={() => setShowContentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedContent?.title || 'Content Details'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Copy">
                <IconButton onClick={() => selectedContent && handleCopyContent(selectedContent)}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton onClick={() => selectedContent && handleDownloadContent(selectedContent)}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={() => selectedContent && handleShareContent(selectedContent)}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
        {selectedContent && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: getContentColor(selectedContent.content_type),
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  {getContentIcon(selectedContent.content_type)}
                </Avatar>
                <Box>
                  <Chip
                    label={selectedContent.content_type.replace('_', ' ')}
                    sx={{
                      bgcolor: `${getContentColor(selectedContent.content_type)}20`,
                      color: getContentColor(selectedContent.content_type),
                      textTransform: 'capitalize',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created {formatDate(selectedContent.created_at)}
              </Typography>
                </Box>
              </Box>
              
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {selectedContent.content}
              </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this content? This action cannot be undone.
          </Typography>
            </DialogContent>
            <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteContentMutation.isLoading}
          >
            {deleteContentMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
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
        onClick={() => navigate('/generate')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default History;