import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from './components/Sidebar';
import SchoolReports from './pages/SchoolReports';
import RehearsalsReports from './pages/RehearsalsReports';
import PerformanceDashboard from './pages/PerformanceDashboard';
import NeedsPayment from './pages/NeedsPayment';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Button from '@mui/material/Button';
import axios from 'axios';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ffb74d',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 1,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage for token on initial load
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
          {isLoggedIn ? (
            <>
              <Sidebar onLogout={handleLogout} />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
                <Routes>
                  <Route path="/school-reports" element={<SchoolReports />} />
                  <Route path="/rehearsals-reports" element={<RehearsalsReports />} />
                  <Route path="/performance-dashboard" element={<PerformanceDashboard />} />
                  <Route path="/needs-payment" element={<NeedsPayment />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/needs-payment" />} />
                </Routes>
              </Box>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
