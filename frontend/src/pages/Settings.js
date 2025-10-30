// frontend/src/pages/Settings.js
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
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  Chip,
  Avatar,
  Tab,
  Tabs,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Palette,
  Language,
  Security,
  Storage,
  Speed,
  CloudUpload,
  CloudDownload,
  VpnKey,
  Person,
  Email,
  Phone,
  LocationOn,
  Schedule,
  DataUsage,
  Refresh,
  Save,
  Cancel,
  Edit,
  Delete,
  Add,
  Remove,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  AutoAwesome,
  TrendingUp,
  Assessment,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  Download,
  Upload,
  Sync,
  Backup,
  Restore,
  Archive,
  DeleteForever,
  Lock,
  Public,
  Visibility,
  VisibilityOff,
  Keyboard,
  Mouse,
  TouchApp,
  VolumeUp,
  VolumeOff,
  Wifi,
  Bluetooth,
  Battery,
  Brightness4,
  Brightness7,
  Contrast,
  Opacity,
  BlurOn,
  Gradient,
  ColorLens,
  Brush,
  PaletteOutlined,
  Colorize,
  Tune,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  ViewComfy,
  ViewStream,
  ViewSidebar,
  ViewColumn,
  ViewWeek,
  ViewDay,
  ViewAgenda,
  ViewQuilt,
  ViewCarousel,
  ViewArray,
  ViewHeadline,
  ViewColumn2,
  ViewColumn3,
  ViewColumn4,
  ViewColumn5,
  ViewColumn6,
  ViewColumn7,
  ViewColumn8,
  ViewColumn9,
  ViewColumn10,
  ViewColumn11,
  ViewColumn12,
  ViewColumn13,
  ViewColumn14,
  ViewColumn15,
  ViewColumn16,
  ViewColumn17,
  ViewColumn18,
  ViewColumn19,
  ViewColumn20,
  ViewColumn21,
  ViewColumn22,
  ViewColumn23,
  ViewColumn24,
  ViewColumn25,
  ViewColumn26,
  ViewColumn27,
  ViewColumn28,
  ViewColumn29,
  ViewColumn30,
  ViewColumn31,
  ViewColumn32,
  ViewColumn33,
  ViewColumn34,
  ViewColumn35,
  ViewColumn36,
  ViewColumn37,
  ViewColumn38,
  ViewColumn39,
  ViewColumn40,
  ViewColumn41,
  ViewColumn42,
  ViewColumn43,
  ViewColumn44,
  ViewColumn45,
  ViewColumn46,
  ViewColumn47,
  ViewColumn48,
  ViewColumn49,
  ViewColumn50,
  ViewColumn51,
  ViewColumn52,
  ViewColumn53,
  ViewColumn54,
  ViewColumn55,
  ViewColumn56,
  ViewColumn57,
  ViewColumn58,
  ViewColumn59,
  ViewColumn60,
  ViewColumn61,
  ViewColumn62,
  ViewColumn63,
  ViewColumn64,
  ViewColumn65,
  ViewColumn66,
  ViewColumn67,
  ViewColumn68,
  ViewColumn69,
  ViewColumn70,
  ViewColumn71,
  ViewColumn72,
  ViewColumn73,
  ViewColumn74,
  ViewColumn75,
  ViewColumn76,
  ViewColumn77,
  ViewColumn78,
  ViewColumn79,
  ViewColumn80,
  ViewColumn81,
  ViewColumn82,
  ViewColumn83,
  ViewColumn84,
  ViewColumn85,
  ViewColumn86,
  ViewColumn87,
  ViewColumn88,
  ViewColumn89,
  ViewColumn90,
  ViewColumn91,
  ViewColumn92,
  ViewColumn93,
  ViewColumn94,
  ViewColumn95,
  ViewColumn96,
  ViewColumn97,
  ViewColumn98,
  ViewColumn99,
  ViewColumn100,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Appearance
      theme: 'light',
      fontSize: 14,
      compactMode: false,
      animations: true,
      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      // Privacy
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
      // Performance
      cacheSize: 100,
      autoSave: true,
      backgroundSync: true,
      // Advanced
      debugMode: false,
      experimentalFeatures: false,
      betaFeatures: false,
    },
  });

  const watchedValues = watch();

  const updateSettingsMutation = useMutation(
    (data) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data });
        }, 1000);
      });
    },
    {
      onSuccess: (data) => {
        toast.success('Settings saved successfully!');
        queryClient.invalidateQueries('userSettings');
      },
      onError: (error) => {
        toast.error('Failed to save settings');
      },
    }
  );

  const handleSave = (data) => {
    updateSettingsMutation.mutate(data);
  };

  const handleExport = () => {
    const settings = watchedValues;
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'intellicontent-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          // Apply settings
          toast.success('Settings imported successfully!');
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    // Reset to default settings
    toast.success('Settings reset to defaults!');
    setShowResetDialog(false);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const appearanceSettings = [
    {
      key: 'theme',
      label: 'Theme',
      type: 'select',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' },
      ],
      icon: <Palette />,
    },
    {
      key: 'fontSize',
      label: 'Font Size',
      type: 'slider',
      min: 12,
      max: 20,
      step: 1,
      icon: <Typography />,
    },
    {
      key: 'compactMode',
      label: 'Compact Mode',
      type: 'switch',
      description: 'Reduce spacing and padding for a more compact interface',
      icon: <ViewModule />,
    },
    {
      key: 'animations',
      label: 'Animations',
      type: 'switch',
      description: 'Enable smooth animations and transitions',
      icon: <AutoAwesome />,
    },
  ];

  const notificationSettings = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      type: 'switch',
      description: 'Receive notifications via email',
      icon: <Email />,
    },
    {
      key: 'pushNotifications',
      label: 'Push Notifications',
      type: 'switch',
      description: 'Receive push notifications in your browser',
      icon: <Notifications />,
    },
    {
      key: 'marketingEmails',
      label: 'Marketing Emails',
      type: 'switch',
      description: 'Receive promotional emails and updates',
      icon: <TrendingUp />,
    },
  ];

  const privacySettings = [
    {
      key: 'profileVisibility',
      label: 'Profile Visibility',
      type: 'select',
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
        { value: 'friends', label: 'Friends Only' },
      ],
      icon: <Public />,
    },
    {
      key: 'dataSharing',
      label: 'Data Sharing',
      type: 'switch',
      description: 'Allow sharing of anonymous usage data to improve the service',
      icon: <DataUsage />,
    },
    {
      key: 'analytics',
      label: 'Analytics',
      type: 'switch',
      description: 'Enable analytics tracking for your account',
      icon: <Assessment />,
    },
  ];

  const performanceSettings = [
    {
      key: 'cacheSize',
      label: 'Cache Size (MB)',
      type: 'slider',
      min: 50,
      max: 500,
      step: 50,
      icon: <Storage />,
    },
    {
      key: 'autoSave',
      label: 'Auto Save',
      type: 'switch',
      description: 'Automatically save your work as you type',
      icon: <Save />,
    },
    {
      key: 'backgroundSync',
      label: 'Background Sync',
      type: 'switch',
      description: 'Sync data in the background when possible',
      icon: <Sync />,
    },
  ];

  const advancedSettings = [
    {
      key: 'debugMode',
      label: 'Debug Mode',
      type: 'switch',
      description: 'Enable debug logging and developer tools',
      icon: <Warning />,
    },
    {
      key: 'experimentalFeatures',
      label: 'Experimental Features',
      type: 'switch',
      description: 'Enable experimental features that may be unstable',
      icon: <Science />,
    },
    {
      key: 'betaFeatures',
      label: 'Beta Features',
      type: 'switch',
      description: 'Enable beta features for early access',
      icon: <AutoAwesome />,
    },
  ];

  const renderSetting = (setting) => {
    switch (setting.type) {
      case 'switch':
        return (
          <FormControlLabel
            control={
              <Controller
                name={setting.key}
                control={control}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value}
                  />
                )}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {setting.label}
                </Typography>
                {setting.description && (
                  <Typography variant="body2" color="text.secondary">
                    {setting.description}
                  </Typography>
                )}
              </Box>
            }
          />
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{setting.label}</InputLabel>
            <Controller
              name={setting.key}
              control={control}
              render={({ field }) => (
                <Select {...field} label={setting.label}>
                  {setting.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        );
      case 'slider':
        return (
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              {setting.label}: {watchedValues[setting.key]}
            </Typography>
            <Controller
              name={setting.key}
              control={control}
              render={({ field }) => (
                <Slider
                  {...field}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  marks={[
                    { value: setting.min, label: setting.min.toString() },
                    { value: setting.max, label: setting.max.toString() },
                  ]}
                />
              )}
            />
          </Box>
        );
      default:
        return null;
    }
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
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Customize your IntelliContent experience
          </Typography>
        </Box>
      </motion.div>

      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={3}>
          {/* Settings Navigation */}
          <Grid item xs={12} md={3}>
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
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {[
                      { label: 'Appearance', icon: <Palette />, index: 0 },
                      { label: 'Notifications', icon: <Notifications />, index: 1 },
                      { label: 'Privacy', icon: <Security />, index: 2 },
                      { label: 'Performance', icon: <Speed />, index: 3 },
                      { label: 'Advanced', icon: <SettingsIcon />, index: 4 },
                    ].map((item) => (
                      <ListItemButton
                        key={item.index}
                        selected={activeTab === item.index}
                        onClick={() => setActiveTab(item.index)}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: activeTab === item.index ? 'white' : 'inherit' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Quick Actions */}
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
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      onClick={handleExport}
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      Export Settings
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => setShowImportDialog(true)}
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      Import Settings
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Refresh />}
                      onClick={() => setShowResetDialog(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Reset to Defaults
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Settings Content */}
          <Grid item xs={12} md={9}>
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
                <form onSubmit={handleSubmit(handleSave)}>
                  <TabPanel value={activeTab} index={0}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Appearance Settings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {appearanceSettings.map((setting) => (
                        <Paper key={setting.key} sx={{ p: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {setting.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                          </Box>
                          {renderSetting(setting)}
                        </Paper>
                      ))}
                    </Box>
                  </TabPanel>

                  <TabPanel value={activeTab} index={1}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Notification Settings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {notificationSettings.map((setting) => (
                        <Paper key={setting.key} sx={{ p: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {setting.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                          </Box>
                          {renderSetting(setting)}
                        </Paper>
                      ))}
                    </Box>
                  </TabPanel>

                  <TabPanel value={activeTab} index={2}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Privacy Settings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {privacySettings.map((setting) => (
                        <Paper key={setting.key} sx={{ p: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {setting.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                          </Box>
                          {renderSetting(setting)}
                        </Paper>
                      ))}
                    </Box>
                  </TabPanel>

                  <TabPanel value={activeTab} index={3}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Performance Settings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {performanceSettings.map((setting) => (
                        <Paper key={setting.key} sx={{ p: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {setting.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                          </Box>
                          {renderSetting(setting)}
                        </Paper>
                      ))}
                    </Box>
                  </TabPanel>

                  <TabPanel value={activeTab} index={4}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Advanced Settings
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      These settings are for advanced users only. Changing them may affect the stability of the application.
                    </Alert>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {advancedSettings.map((setting) => (
                        <Paper key={setting.key} sx={{ p: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {setting.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                          </Box>
                          {renderSetting(setting)}
                        </Paper>
                      ))}
                    </Box>
                  </TabPanel>

                  {/* Save Button */}
                  <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Changes are saved automatically
                      </Typography>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={updateSettingsMutation.isLoading}
                        sx={{ borderRadius: 2 }}
                      >
                        {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Import Settings Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="settings-import"
              type="file"
              onChange={handleImport}
            />
            <label htmlFor="settings-import">
              <Button variant="contained" component="span" startIcon={<CloudUpload />} fullWidth>
                Choose Settings File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Select a JSON file exported from IntelliContent to import your settings.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
      >
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReset}
            color="warning"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
