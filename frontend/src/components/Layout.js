// frontend/src/components/Layout.js
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AutoAwesome,
  History,
  Template,
  Person,
  Settings,
  Analytics,
  AdminPanelSettings,
  Logout,
  Notifications,
  Search,
  Keyboard,
  Brightness4,
  Brightness7,
  Close,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useHotkeys } from 'react-hotkeys-hook';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { notifications } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Keyboard shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setCommandPaletteOpen(true);
  });

  useHotkeys('ctrl+shift+d, cmd+shift+d', (e) => {
    e.preventDefault();
    navigate('/dashboard');
  });

  useHotkeys('ctrl+shift+g, cmd+shift+g', (e) => {
    e.preventDefault();
    navigate('/generate');
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard />, shortcut: 'Ctrl+Shift+D' },
    { label: 'Generate', path: '/generate', icon: <AutoAwesome />, shortcut: 'Ctrl+Shift+G' },
    { label: 'History', path: '/history', icon: <History /> },
    { label: 'Templates', path: '/templates', icon: <Template /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
  ];

  const adminItems = [
    { label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettings /> },
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          <AutoAwesome />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            IntelliContent
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            AI Content Platform
          </Typography>
        </Box>
      </Box>
      
      <List sx={{ px: 2, py: 2 }}>
        {navigationItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListItem
              button
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                color: isActive(item.path) ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'text.primary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {item.shortcut && (
                <Chip
                  label={item.shortcut}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                />
              )}
            </ListItem>
          </motion.div>
        ))}
        
        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" sx={{ px: 2, color: 'text.secondary' }}>
              Admin
            </Typography>
            {adminItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListItem
                  button
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                    color: isActive(item.path) ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? 'white' : 'text.primary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              </motion.div>
            ))}
          </>
        )}
      </List>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              icon={<Brightness7 />}
              checkedIcon={<Brightness4 />}
            />
          }
          label="Dark Mode"
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            IntelliContent
          </Typography>
          
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Search (Ctrl+K)">
                <IconButton
                  color="inherit"
                  onClick={() => setCommandPaletteOpen(true)}
                >
                  <Search />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={notifications.length} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Profile">
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                >
                  <Avatar
                    src={user?.avatar_url}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 2 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{ borderRadius: 2 }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      {isAuthenticated && (
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isAuthenticated ? 280 : 0}px)` },
          ml: { sm: isAuthenticated ? '280px' : 0 },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Command Palette - will be handled by App.js */}
    </Box>
  );
};

export default Layout;