import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { Dashboard as DashboardIcon, ExitToApp } from '@mui/icons-material';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mr: 2,
                }}
              >
                <DashboardIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to AI Content Studio
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Welcome back, {user?.fullName || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You're now logged in to your AI Content Studio dashboard.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Content Generation
                  </Typography>
                  <Typography variant="body2">
                    Generate blog posts, articles, social media content, and more using our advanced AI.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/content-generator')}
                  >
                    Create Content
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content Library
                  </Typography>
                  <Typography variant="body2">
                    Access your saved content, drafts, and templates.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/library')}
                  >
                    View Library
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Settings
                  </Typography>
                  <Typography variant="body2">
                    Manage your profile, subscription, and preferences.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/settings')}
                  >
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 