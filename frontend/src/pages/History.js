// frontend/src/pages/History.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { contentService } from '../services/api';
import { toast } from 'react-toastify';

const History = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const data = await contentService.getContents();
      setContents(data);
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await contentService.deleteContent(id);
        setContents(contents.filter(c => c.id !== id));
        toast.success('Content deleted successfully');
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  const handleView = (content) => {
    setSelectedContent(content);
    setOpenDialog(true);
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'text': return 'primary';
      case 'code': return 'secondary';
      case 'summary': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generation History
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell>{content.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={content.content_type} 
                    color={getTypeColor(content.content_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{content.model_used}</TableCell>
                <TableCell>
                  {new Date(content.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(content)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(content.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedContent && (
          <>
            <DialogTitle>{selectedContent.title}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>
                Input Prompt:
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">{selectedContent.input_text}</Typography>
              </Paper>
              
              <Typography variant="subtitle2" gutterBottom>
                Generated Content:
              </Typography>
              <Paper sx={{ p: 2 }}>
                {renderContent(selectedContent.generated_content, selectedContent.content_type)}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default History;