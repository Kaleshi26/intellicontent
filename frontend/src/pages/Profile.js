// frontend/src/pages/Profile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  CalendarToday,
  Security,
  Notifications,
  Palette,
  Language,
  Storage,
  Speed,
  TrendingUp,
  AutoAwesome,
  History,
  Star,
  Share,
  Download,
  Settings,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Warning,
  Info,
  Refresh,
  Delete,
  Add,
  Lock,
  Public,
  VpnKey,
  CloudUpload,
  CloudDownload,
  DataUsage,
  Timer,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { authService, analyticsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      preferences: user?.preferences || {},
    },
  });

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'userAnalytics',
    () => analyticsService.getUserAnalytics(),
    {
      select: (data) => data.data,
    }
  );

  const updateProfileMutation = useMutation(
    (data) => authService.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        queryClient.invalidateQueries('userProfile');
      },
      onError: (error) => {
        toast.error('Failed to update profile');
      },
    }
  );

  const changePasswordMutation = useMutation(
    (data) => authService.changePassword(data),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        setShowPasswordDialog(false);
      },
      onError: (error) => {
        toast.error('Failed to change password');
      },
    }
  );

  const deleteAccountMutation = useMutation(
    () => authService.deleteAccount(),
    {
      onSuccess: () => {
        toast.success('Account deleted successfully');
        navigate('/');
      },
      onError: (error) => {
        toast.error('Failed to delete account');
      },
    }
  );

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      preferences: user?.preferences || {},
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleSave = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleChangePassword = (data) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle avatar upload
      toast.info('Avatar upload feature coming soon!');
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const stats = [
    {
      label: 'Total Generations',
      value: analytics?.total_generations || 0,
      icon: <AutoAwesome />,
      color: 'primary',
    },
    {
      label: 'This Month',
      value: analytics?.monthly_generations || 0,
      icon: <TrendingUp />,
      color: 'success',
    },
    {
      label: 'Templates Used',
      value: analytics?.templates_used || 0,
      icon: <Star />,
      color: 'info',
    },
    {
      label: 'Success Rate',
      value: `${analytics?.success_rate || 0}%`,
      icon: <CheckCircle />,
      color: 'warning',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Profile Settings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your account and preferences
          </Typography>
        </Box>
      </motion.div>

      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
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
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        fontSize: '3rem',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                      onClick={() => setShowAvatarDialog(true)}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    @{user?.username}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {user?.bio || 'No bio available'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                    <Chip
                      icon={<Email />}
                      label={user?.email}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<CalendarToday />}
                      label={`Joined ${new Date(user?.created_at).toLocaleDateString()}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      sx={{ borderRadius: 2 }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={() => setActiveTab(2)}
                      sx={{ borderRadius: 2 }}
                    >
                      Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Quick Stats */}
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
                    Quick Stats
                  </Typography>
                  <List dense>
                    {stats.map((stat, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: `${stat.color}.main`,
                              width: 32,
                              height: 32,
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={stat.value}
                          secondary={stat.label}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    aria-label="profile tabs"
                  >
                    <Tab label="Personal Info" icon={<Person />} />
                    <Tab label="Account" icon={<Security />} />
                    <Tab label="Preferences" icon={<Settings />} />
                    <Tab label="Analytics" icon={<Assessment />} />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <form onSubmit={handleSubmit(handleSave)}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          {...register('first_name', { required: 'First name is required' })}
                          error={!!errors.first_name}
                          helperText={errors.first_name?.message}
                          disabled={!isEditing}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          {...register('last_name')}
                          disabled={!isEditing}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          {...register('email', { required: 'Email is required' })}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          disabled={!isEditing}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          multiline
                          rows={4}
                          {...register('bio')}
                          disabled={!isEditing}
                          placeholder="Tell us about yourself..."
                        />
                      </Grid>
                    </Grid>

                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={updateProfileMutation.isLoading}
                          sx={{ borderRadius: 2 }}
                        >
                          {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </form>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Password
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Change your account password
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<Lock />}
                          onClick={() => setShowPasswordDialog(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Change Password
                        </Button>
                      </Box>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Account Status
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Your account is {user?.is_verified ? 'verified' : 'not verified'}
                          </Typography>
                        </Box>
                        <Chip
                          icon={user?.is_verified ? <CheckCircle /> : <Warning />}
                          label={user?.is_verified ? 'Verified' : 'Unverified'}
                          color={user?.is_verified ? 'success' : 'warning'}
                        />
                      </Box>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Delete Account
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Permanently delete your account and all data
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setShowDeleteDialog(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Delete Account
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Notifications
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Email notifications"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Push notifications"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Marketing emails"
                        />
                      </Box>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Appearance
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Dark mode"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Compact layout"
                        />
                      </Box>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Language & Region
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        label="Language"
                        defaultValue="en"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </TextField>
                      <TextField
                        fullWidth
                        select
                        label="Timezone"
                        defaultValue="UTC"
                      >
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="EST">Eastern Time</MenuItem>
                        <MenuItem value="PST">Pacific Time</MenuItem>
                        <MenuItem value="GMT">Greenwich Mean Time</MenuItem>
                      </TextField>
                    </Paper>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  {analyticsLoading ? (
                    <Box>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography>Loading analytics...</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Grid container spacing={3}>
                        {stats.map((stat, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                              <Avatar
                                sx={{
                                  bgcolor: `${stat.color}.main`,
                                  mx: 'auto',
                                  mb: 2,
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {stat.icon}
                              </Avatar>
                              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {stat.value}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {stat.label}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>

                      <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Recent Activity
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <AutoAwesome />
                            </ListItemIcon>
                            <ListItemText
                              primary="Generated blog post"
                              secondary="2 hours ago"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText
                              primary="Created email template"
                              secondary="1 day ago"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Code />
                            </ListItemIcon>
                            <ListItemText
                              primary="Generated code snippet"
                              secondary="3 days ago"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Box>
                  )}
                </TabPanel>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteAccountMutation.isLoading}
          >
            {deleteAccountMutation.isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog
        open={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
      >
        <DialogTitle>Change Avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
                mx: 'auto',
                mb: 2,
              }}
            >
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
            />
            <label htmlFor="avatar-upload">
              <Button variant="contained" component="span" startIcon={<CloudUpload />}>
                Upload New Avatar
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAvatarDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
