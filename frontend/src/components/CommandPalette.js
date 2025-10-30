import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search,
  Dashboard,
  AutoAwesome,
  History,
  Template,
  Person,
  Settings,
  Analytics,
  AdminPanelSettings,
  ContentCopy,
  Share,
  Download,
  Delete,
  Edit,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut to open command palette
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setOpen(true);
  });

  // Close on escape
  useHotkeys('escape', () => {
    if (open) {
      setOpen(false);
    }
  });

  const commands = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View your content overview and analytics',
      icon: <Dashboard />,
      action: () => navigate('/dashboard'),
      category: 'Navigation',
    },
    {
      id: 'generate',
      title: 'Generate Content',
      description: 'Create new AI-generated content',
      icon: <AutoAwesome />,
      action: () => navigate('/generate'),
      category: 'Content',
    },
    {
      id: 'history',
      title: 'View History',
      description: 'Browse your content generation history',
      icon: <History />,
      action: () => navigate('/history'),
      category: 'Content',
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Manage content templates',
      icon: <Template />,
      action: () => navigate('/templates'),
      category: 'Content',
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile',
      icon: <Person />,
      action: () => navigate('/profile'),
      category: 'Account',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure your preferences',
      icon: <Settings />,
      action: () => navigate('/settings'),
      category: 'Account',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed analytics and insights',
      icon: <Analytics />,
      action: () => navigate('/analytics'),
      category: 'Analytics',
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'Access admin functions',
      icon: <AdminPanelSettings />,
      action: () => navigate('/admin'),
      category: 'Admin',
    },
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommandSelect = (command) => {
    command.action();
    setOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Search sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Command Palette</Typography>
          <Chip
            label="Ctrl+K"
            size="small"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        <TextField
          fullWidth
          placeholder="Search commands, pages, or actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        
        <Paper
          elevation={0}
          sx={{
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <List disablePadding>
            <AnimatePresence>
              {filteredCommands.map((command, index) => (
                <motion.div
                  key={command.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem
                    button
                    onClick={() => handleCommandSelect(command)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {command.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={command.title}
                      secondary={command.description}
                      primaryTypographyProps={{
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      label={command.category}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                  {index < filteredCommands.length - 1 && <Divider />}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Paper>
        
        {filteredCommands.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No commands found for "{query}"
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
