// frontend/src/pages/Generate.js
import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Slider
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { contentService } from '../services/api';
import { toast } from 'react-toastify';

const Generate = () => {
  const [formData, setFormData] = useState({
    prompt: '',
    contentType: 'text',
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await contentService.generate(
        formData.prompt,
        formData.contentType,
        formData.model,
        formData.maxTokens
      );
      setResult(response);
      toast.success('Content generated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed');
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content, type) => {
    if (type === 'code') {
      return (
        <SyntaxHighlighter language="javascript" style={tomorrow}>
          {content}
        </SyntaxHighlighter>
      );
    }
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate AI Content
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Enter your prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="Describe what you want to generate..."
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                label="Content Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="code">Code</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Model</InputLabel>
              <Select
                name="model"
                value={formData.model}
                onChange={handleChange}
                label="Model"
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="local">Local Model</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Max Tokens: {formData.maxTokens}</Typography>
            <Slider
              name="maxTokens"
              value={formData.maxTokens}
              onChange={(e, value) => setFormData({ ...formData, maxTokens: value })}
              min={100}
              max={2000}
              step={50}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </form>
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {result && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Content
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Model: {result.model_used} | Type: {result.content_type}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {renderContent(result.generated_content, result.content_type)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Generate;