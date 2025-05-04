import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Badge,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  History,
  ContentCopy,
  PhotoCamera,
  Edit,
  Save,
  ArrowBack,
  CloudUpload,
  Settings,
  Favorite,
  Analytics,
  Dashboard
} from '@mui/icons-material';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: user?.fullName || user?.name || 'User',
    email: user?.email || 'user@example.com',
    bio: '',
    avatar: '',
    company: '',
    website: '',
  });
  
  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    contentLanguage: 'English',
    aiModelPreference: 'gpt-3.5-turbo',
    defaultTone: 'Professional',
    defaultContentType: 'blog',
  });
  
  // Content stats
  const [contentStats] = useState({
    totalGenerated: 42,
    blogsCreated: 18,
    articlesCreated: 12,
    socialPosts: 8,
    emailsCreated: 4,
    mostUsedType: 'Blog Post'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, checked } = e.target;
    setSecurity(prev => ({
      ...prev,
      [name]: name === 'twoFactorEnabled' ? checked : value
    }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: typeof checked !== 'undefined' ? checked : value
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSecurity(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccess('Password changed successfully');
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Account Settings
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 3, textAlign: 'center', overflow: 'visible' }}>
            <CardContent sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    size="small" 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' } 
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    fontSize: '2.5rem',
                    bgcolor: 'primary.main' 
                  }}
                >
                  {profile.fullName.charAt(0)}
                </Avatar>
              </Badge>
              <Typography variant="h6" gutterBottom>
                {profile.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Edit />}
                onClick={() => setTabValue(0)}
                sx={{ mt: 1 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Paper>
            <Tabs
              orientation="vertical"
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Settings tabs"
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  pl: 2
                }
              }}
            >
              <Tab icon={<Person />} iconPosition="start" label="Profile" />
              <Tab icon={<Security />} iconPosition="start" label="Security" />
              <Tab icon={<Palette />} iconPosition="start" label="Preferences" />
              <Tab icon={<Analytics />} iconPosition="start" label="Statistics" />
              <Tab icon={<History />} iconPosition="start" label="History" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ minHeight: 500 }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <form onSubmit={handleProfileSave}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={profile.company}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={profile.website}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      value={profile.bio}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <form onSubmit={handlePasswordChange}>
                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={security.currentPassword}
                      onChange={handleSecurityChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={handleSecurityChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={handleSecurityChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Password'}
                    </Button>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      name="twoFactorEnabled"
                      checked={security.twoFactorEnabled}
                      onChange={handleSecurityChange}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Appearance
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="darkMode"
                    checked={preferences.darkMode}
                    onChange={handlePreferencesChange}
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle1" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={handlePreferencesChange}
                  />
                }
                label="Email Notifications"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle1" gutterBottom>
                Content Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Default Content Type</InputLabel>
                    <Select
                      name="defaultContentType"
                      value={preferences.defaultContentType}
                      label="Default Content Type"
                      onChange={handlePreferencesChange}
                    >
                      <MenuItem value="blog">Blog Post</MenuItem>
                      <MenuItem value="article">Article</MenuItem>
                      <MenuItem value="social">Social Media</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Default Tone</InputLabel>
                    <Select
                      name="defaultTone"
                      value={preferences.defaultTone}
                      label="Default Tone"
                      onChange={handlePreferencesChange}
                    >
                      <MenuItem value="Professional">Professional</MenuItem>
                      <MenuItem value="Casual">Casual</MenuItem>
                      <MenuItem value="Friendly">Friendly</MenuItem>
                      <MenuItem value="Formal">Formal</MenuItem>
                      <MenuItem value="Humorous">Humorous</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Content Language</InputLabel>
                    <Select
                      name="contentLanguage"
                      value={preferences.contentLanguage}
                      label="Content Language"
                      onChange={handlePreferencesChange}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                      <MenuItem value="Chinese">Chinese</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>AI Model</InputLabel>
                    <Select
                      name="aiModelPreference"
                      value={preferences.aiModelPreference}
                      label="AI Model"
                      onChange={handlePreferencesChange}
                    >
                      <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                      <MenuItem value="gpt-4">GPT-4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => setSuccess('Preferences saved successfully')}
                  >
                    Save Preferences
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Content Statistics
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h3">{contentStats.totalGenerated}</Typography>
                    <Typography variant="subtitle1">Total Content Generated</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                    <Typography variant="h3">{contentStats.blogsCreated}</Typography>
                    <Typography variant="subtitle1">Blog Posts</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                    <Typography variant="h3">{contentStats.articlesCreated}</Typography>
                    <Typography variant="subtitle1">Articles</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="h3">{contentStats.socialPosts}</Typography>
                    <Typography variant="subtitle1">Social Media Posts</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                    <Typography variant="h3">{contentStats.emailsCreated}</Typography>
                    <Typography variant="subtitle1">Email Campaigns</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                    <Typography variant="h6">{contentStats.mostUsedType}</Typography>
                    <Typography variant="subtitle1">Most Used Type</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                Content History
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List>
                {Array.from({ length: 5 }).map((_, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="copy">
                        <ContentCopy />
                      </IconButton>
                    }
                    sx={{ 
                      mb: 1, 
                      border: '1px solid #eee', 
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      {index % 2 === 0 ? <Favorite color="error" /> : <Dashboard color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Content ${index + 1}: ${index % 2 === 0 ? 'Blog Post' : 'Social Media Post'}`}
                      secondary={`Generated on ${new Date(Date.now() - index * 86400000).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/dashboard')}
              >
                Generate New Content
              </Button>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default AccountSettings; 