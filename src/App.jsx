import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
} from '@mui/material';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ContentDashboard from './components/ContentDashboard';
import AccountSettings from './components/AccountSettings';
import { AuthProvider } from './contexts/AuthContext';

// Enhanced professional theme with vibrant colors and modern gradients
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#4fc3f7',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    info: {
      main: '#03a9f4',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    gradient: {
      primary: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
      secondary: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
      success: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
      info: 'linear-gradient(45deg, #03a9f4 30%, #4fc3f7 90%)',
      warning: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
      dark: 'linear-gradient(45deg, #424242 30%, #757575 90%)',
      light: 'linear-gradient(45deg, #f5f5f5 30%, #ffffff 90%)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    // Custom styling for images rendered through ReactMarkdown
    MuiImageListItem: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box 
            sx={{ 
              minHeight: '100vh', 
              bgcolor: 'background.default',
              background: 'linear-gradient(135deg, #ebf5ff 0%, #e3f2fd 50%, #e1f5fe 100%)',
              pt: 2,
              pb: 4
            }}
          >
            <Container maxWidth="lg">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ContentDashboard />} />
                <Route path="/settings" element={<AccountSettings />} />
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 