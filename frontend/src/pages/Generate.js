// frontend/src/pages/Generate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AutoAwesome,
  ContentCopy,
  Download,
  Share,
  Refresh,
  Settings,
  ExpandMore,
  History,
  Star,
  Bookmark,
  PlayArrow,
  Pause,
  Stop,
  Speed,
  Palette,
  Language,
  Psychology,
  Code,
  Article,
  Email,
  Campaign,
  Description,
  Translate,
  School,
  Business,
  Science,
  Sports,
  Music,
  Movie,
  Restaurant,
  LocalHospital,
  Flight,
  ShoppingCart,
  Home,
  Work,
  Favorite,
  ThumbUp,
  Comment,
  Visibility,
  VisibilityOff,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Remove,
  CheckCircle,
  Error,
  Warning,
  Info,
  FlashOn,
  Newspaper,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contentService, templateService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Generate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
    prompt: '',
      content_type: 'blog_post',
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
      language: 'en',
      style: 'professional',
      tags: [],
      metadata: {},
    },
  });

  const watchedValues = watch();

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery(
    'templates',
    () => templateService.getTemplates(),
    {
      select: (data) => data.data,
    }
  );

  // Fetch recent generations
  const { data: recentGenerations } = useQuery(
    'recentGenerations',
    () => contentService.getContents({ limit: 10 }),
    {
      select: (data) => data.data,
    }
  );

  const generateContentMutation = useMutation(
    (data) => contentService.generateContent(data),
    {
      onSuccess: (response) => {
        setGeneratedContent(response.data.content);
        setGenerationHistory(prev => [response.data, ...prev.slice(0, 9)]);
      toast.success('Content generated successfully!');
        queryClient.invalidateQueries('recentContent');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Generation failed');
      },
      onSettled: () => {
        setIsGenerating(false);
        setGenerationProgress(0);
      },
    }
  );

  const saveContentMutation = useMutation(
    (data) => contentService.createContent(data),
    {
      onSuccess: () => {
        toast.success('Content saved successfully!');
        queryClient.invalidateQueries('recentContent');
      },
      onError: (error) => {
        toast.error('Failed to save content');
      },
    }
  );

  const contentTypes = [
    { value: 'blog_post', label: 'Blog Post', icon: <Article />, color: '#2196F3' },
    { value: 'email', label: 'Email', icon: <Email />, color: '#4CAF50' },
    { value: 'marketing_copy', label: 'Marketing Copy', icon: <Campaign />, color: '#FF9800' },
    { value: 'code', label: 'Code', icon: <Code />, color: '#9C27B0' },
    { value: 'summary', label: 'Summary', icon: <Description />, color: '#607D8B' },
    { value: 'translation', label: 'Translation', icon: <Translate />, color: '#795548' },
    { value: 'creative_writing', label: 'Creative Writing', icon: <Favorite />, color: '#E91E63' },
    { value: 'technical_docs', label: 'Technical Docs', icon: <Science />, color: '#3F51B5' },
    { value: 'news_article', label: 'News Article', icon: <Newspaper />, color: '#FF5722' },
    { value: 'product_description', label: 'Product Description', icon: <ShoppingCart />, color: '#009688' },
  ];

  const models = [
    { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model', icon: <Psychology /> },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient', icon: <Speed /> },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Anthropic\'s latest', icon: <AutoAwesome /> },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fast and lightweight', icon: <FlashOn /> },
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
    { value: 'it', label: 'Italian', flag: '🇮🇹' },
    { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { value: 'ru', label: 'Russian', flag: '🇷🇺' },
    { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { value: 'ko', label: 'Korean', flag: '🇰🇷' },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  ];

  const styles = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
    { value: 'creative', label: 'Creative', description: 'Imaginative and artistic' },
    { value: 'technical', label: 'Technical', description: 'Precise and detailed' },
    { value: 'humorous', label: 'Humorous', description: 'Funny and entertaining' },
    { value: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
  ];

  const handleGenerate = async (data) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    generateContentMutation.mutate(data);
  };

  const handleSaveContent = () => {
    if (!generatedContent) return;
    
    saveContentMutation.mutate({
      title: `Generated ${watchedValues.content_type.replace('_', ' ')}`,
      content: generatedContent,
      content_type: watchedValues.content_type,
      model_used: watchedValues.model,
      prompt: watchedValues.prompt,
      tags: watchedValues.tags,
      metadata: watchedValues.metadata,
    });
  };

  const handleUseTemplate = (template) => {
    setValue('prompt', template.prompt);
    setValue('content_type', template.content_type);
    setValue('style', template.style || 'professional');
    setSelectedTemplate(template);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied!`);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const handleDownloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`generation-tabpanel-${index}`}
      aria-labelledby={`generation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

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
                AI Content Generator
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Create amazing content with the power of AI
      </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/history')}
                sx={{ borderRadius: 2 }}
              >
                History
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ borderRadius: 2 }}
              >
                Advanced
              </Button>
            </Box>
          </Box>
          
          {/* Progress Bar */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Generating content...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    {Math.round(generationProgress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={generationProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
              </Box>
            </motion.div>
          )}
        </Box>
      </motion.div>

      <Box sx={{ px: 3 }}>
        <Grid container spacing={3}>
          {/* Generation Form */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  mb: 3,
                }}
              >
                <CardContent>
                  <form onSubmit={handleSubmit(handleGenerate)}>
                    {/* Content Type Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        What would you like to create?
                      </Typography>
                      <Grid container spacing={2}>
                        {contentTypes.map((type) => (
                          <Grid item xs={6} sm={4} md={3} key={type.value}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  border: watchedValues.content_type === type.value ? 2 : 1,
                                  borderColor: watchedValues.content_type === type.value ? type.color : 'divider',
                                  bgcolor: watchedValues.content_type === type.value ? `${type.color}10` : 'background.paper',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    borderColor: type.color,
                                    bgcolor: `${type.color}10`,
                                  },
                                }}
                                onClick={() => setValue('content_type', type.value)}
                              >
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: type.color,
                                      mx: 'auto',
                                      mb: 1,
                                      width: 40,
                                      height: 40,
                                    }}
                                  >
                                    {type.icon}
                                  </Avatar>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {type.label}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Prompt Input */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Describe what you want to create
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Enter your prompt here... Be specific about what you want to create, the tone, style, and any key points to include."
                        {...register('prompt', { required: 'Prompt is required' })}
                        error={!!errors.prompt}
                        helperText={errors.prompt?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1.1rem',
                          },
                        }}
            />
          </Box>
          
                    {/* Model Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Choose AI Model
                      </Typography>
                      <Grid container spacing={2}>
                        {models.map((model) => (
                          <Grid item xs={12} sm={6} key={model.value}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  border: watchedValues.model === model.value ? 2 : 1,
                                  borderColor: watchedValues.model === model.value ? 'primary.main' : 'divider',
                                  bgcolor: watchedValues.model === model.value ? 'primary.50' : 'background.paper',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'primary.50',
                                  },
                                }}
                                onClick={() => setValue('model', model.value)}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                                      {model.icon}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {model.label}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {model.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Advanced Settings */}
                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Advanced Settings
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Temperature: {watchedValues.temperature}
                                  </Typography>
                                  <Controller
                                    name="temperature"
                                    control={control}
                                    render={({ field }) => (
                                      <Slider
                                        {...field}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        marks={[
                                          { value: 0, label: 'Focused' },
                                          { value: 0.5, label: 'Balanced' },
                                          { value: 1, label: 'Creative' },
                                        ]}
                                        sx={{ mb: 2 }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Max Tokens: {watchedValues.max_tokens}
                                  </Typography>
                                  <Controller
                                    name="max_tokens"
                                    control={control}
                                    render={({ field }) => (
                                      <Slider
                                        {...field}
                                        min={100}
                                        max={4000}
                                        step={100}
                                        marks={[
                                          { value: 100, label: '100' },
                                          { value: 2000, label: '2000' },
                                          { value: 4000, label: '4000' },
                                        ]}
                                        sx={{ mb: 2 }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Language</InputLabel>
                                    <Controller
                                      name="language"
                                      control={control}
                                      render={({ field }) => (
                                        <Select {...field} label="Language">
                                          {languages.map((lang) => (
                                            <MenuItem key={lang.value} value={lang.value}>
                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ mr: 1 }}>{lang.flag}</Typography>
                                                {lang.label}
                                              </Box>
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      )}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Writing Style</InputLabel>
                                    <Controller
                                      name="style"
                                      control={control}
                                      render={({ field }) => (
                                        <Select {...field} label="Writing Style">
                                          {styles.map((style) => (
                                            <MenuItem key={style.value} value={style.value}>
                                              <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                  {style.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                  {style.description}
                                                </Typography>
                                              </Box>
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      )}
                                    />
                                  </FormControl>
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
                          disabled={isGenerating}
                          startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                          }}
                        >
                          {isGenerating ? 'Generating...' : 'Generate Content'}
                        </Button>
                      </motion.div>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Template />}
                        onClick={() => setShowTemplates(true)}
                        sx={{ borderRadius: 2 }}
                      >
                        Templates
          </Button>
                    </Box>
        </form>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Generated Content */}
              {generatedContent && (
                <Card
                  sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3,
                  }}
                >
          <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generated Content
            </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Copy">
                          <IconButton onClick={handleCopyContent} size="small">
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton onClick={handleDownloadContent} size="small">
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Save">
                          <IconButton onClick={handleSaveContent} size="small">
                            <Bookmark />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Paper
                      sx={{
                        p: 2,
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
                        {generatedContent}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              )}

              {/* Recent Generations */}
              {recentGenerations && recentGenerations.length > 0 && (
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
                      Recent Generations
                    </Typography>
                    <List dense>
                      {recentGenerations.slice(0, 5).map((content, index) => (
                        <motion.div
                          key={content.id}
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
                            onClick={() => {
                              setValue('prompt', content.prompt);
                              setValue('content_type', content.content_type);
                              setGeneratedContent(content.content);
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: contentTypes.find(t => t.value === content.content_type)?.color || 'primary.main',
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {contentTypes.find(t => t.value === content.content_type)?.icon || <AutoAwesome />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {content.title || 'Untitled'}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(content.created_at).toLocaleDateString()}
            </Typography>
                              }
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
          </CardContent>
        </Card>
      )}
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Templates Dialog */}
      <Dialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Content Templates
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {templates?.map((template) => (
              <Grid item xs={12} sm={6} key={template.id}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      <Chip
                        label={template.content_type.replace('_', ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplates(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Generate;