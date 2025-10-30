// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  List, 
  ListItem, 
  ListItemText,
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  Paper,
  ListItemAvatar,
  ListItemButton,
  Divider,
  Fab,
  Tooltip,
  Badge,
  Skeleton,
} from '@mui/material';
import {
  Add,
  History,
  TrendingUp,
  AutoAwesome,
  Article,
  Email,
  Code,
  Campaign,
  MoreVert,
  PlayArrow,
  Star,
  Share,
  Download,
  Refresh,
  Analytics,
  Template,
  Speed,
  Security,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { contentService, analyticsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState(null);

  // Fetch recent content
  const { data: recentContent, isLoading: contentLoading } = useQuery(
    'recentContent',
    () => contentService.getContents({ limit: 5 }),
    {
      select: (data) => data.data,
    }
  );

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'userAnalytics',
    () => analyticsService.getUserAnalytics(),
    {
      select: (data) => data.data,
    }
  );

  // Fetch system analytics
  const { data: systemAnalytics, isLoading: systemLoading } = useQuery(
    'systemAnalytics',
    () => analyticsService.getSystemAnalytics(),
    {
      select: (data) => data.data,
    }
  );

  const deleteContentMutation = useMutation(
    (id) => contentService.deleteContent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recentContent');
        toast.success('Content deleted successfully');
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
      default:
        return '#757575';
    }
  };

  const stats = [
    {
      label: 'Total Generations',
      value: analytics?.total_generations || 0,
      icon: <AutoAwesome />,
      color: 'primary',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'This Month',
      value: analytics?.monthly_generations || 0,
      icon: <TrendingUp />,
      color: 'success',
      change: '+8%',
      trend: 'up',
    },
    {
      label: 'Templates Used',
      value: analytics?.templates_used || 0,
      icon: <Template />,
      color: 'info',
      change: '+3',
      trend: 'up',
    },
    {
      label: 'Success Rate',
      value: `${analytics?.success_rate || 0}%`,
      icon: <CheckCircle />,
      color: 'warning',
      change: '+2%',
      trend: 'up',
    },
  ];

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create new AI-powered content',
      icon: <AutoAwesome />,
      color: 'primary',
      onClick: () => navigate('/generate'),
    },
    {
      title: 'View History',
      description: 'Browse your content library',
      icon: <History />,
      color: 'secondary',
      onClick: () => navigate('/history'),
    },
    {
      title: 'Templates',
      description: 'Use pre-built templates',
      icon: <Template />,
      color: 'info',
      onClick: () => navigate('/templates'),
    },
    {
      title: 'Analytics',
      description: 'View detailed insights',
      icon: <Analytics />,
      color: 'success',
      onClick: () => navigate('/analytics'),
    },
  ];

  const recentTemplates = [
    { name: 'Blog Post', type: 'blog_post', usage: 12 },
    { name: 'Email Campaign', type: 'email', usage: 8 },
    { name: 'Social Media', type: 'social_media', usage: 15 },
    { name: 'Product Description', type: 'product_description', usage: 6 },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
    <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {user?.first_name || 'User'}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Here's what's happening with your content today
      </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/generate')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Generate Content
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
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
                        bgcolor: `${stat.color}.main`,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {analyticsLoading ? <Skeleton width={60} /> : stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
              </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      vs last month
              </Typography>
                  </Box>
            </CardContent>
          </Card>
            </motion.div>
          </Grid>
        ))}
        </Grid>
        
      <Grid container spacing={3}>
        {/* Recent Content */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Recent Content
                  </Typography>
                  <Button
                    variant="text"
                    endIcon={<History />}
                    onClick={() => navigate('/history')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>

                {contentLoading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                      </Box>
                    ))}
                  </Box>
                ) : recentContent && recentContent.length > 0 ? (
                  <List>
                    <AnimatePresence>
                      {recentContent.map((content, index) => (
                        <motion.div
                          key={content.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <ListItem
                            sx={{
                              borderRadius: 2,
                              mb: 1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: getContentColor(content.content_type),
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {getContentIcon(content.content_type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {content.title || 'Untitled Content'}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Chip
                                    label={content.content_type.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                      bgcolor: `${getContentColor(content.content_type)}20`,
                                      color: getContentColor(content.content_type),
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(content.created_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Share">
                                <IconButton
                                  size="small"
                                  onClick={() => shareContentMutation.mutate(content.id)}
                                >
                                  <Share />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/contents/${content.id}/export`)}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More">
                                <IconButton size="small">
                                  <MoreVert />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No content generated yet
              </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start creating amazing content with AI
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
            </CardContent>
          </Card>
          </motion.div>
        </Grid>
        
        {/* Quick Actions & Templates */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 3,
              }}
            >
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
              </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ListItemButton
                        onClick={action.onClick}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1,
                          '&:hover': {
                            borderColor: `${action.color}.main`,
                            bgcolor: `${action.color}.main`,
                            color: 'white',
                            '& .MuiListItemIcon-root': {
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${action.color}.main`, width: 32, height: 32 }}>
                            {action.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={action.title}
                          secondary={action.description}
                        />
                      </ListItemButton>
                    </motion.div>
                  ))}
                </Box>
            </CardContent>
          </Card>

            {/* Popular Templates */}
            <Card
              sx={{
                borderRadius: 3,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Popular Templates
            </Typography>
                <List dense>
                  {recentTemplates.map((template, index) => (
                    <motion.div
                      key={template.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => navigate('/templates')}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: getContentColor(template.type),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getContentIcon(template.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={template.name}
                          secondary={`${template.usage} uses`}
                        />
                        <Chip
                          label="Popular"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
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
      </motion.div>
    </Box>
  );
};

export default Dashboard;