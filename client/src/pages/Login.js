import React, { useState } from 'react';
import { Button, Box, Typography, Alert, TextField, Paper } from '@mui/material';
import axios from 'axios';
import config from '../config';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic client-side validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      console.log('Attempting login with:', { email });
      const apiUrl = config.getApiUrl();
      const res = await axios.post(`${apiUrl}/auth/login`, { 
        email: email.trim(), 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Store user data if available
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        onLogin();
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundColor: 'background.default',
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 700 }}>
        Music Hub Dashboard
      </Typography>
      <Paper sx={{ p: 4, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 