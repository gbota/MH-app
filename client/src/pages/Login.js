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
    try {
      const res = await axios.post(`${config.apiUrl}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 400,
          px: 2,
        }}
      >
        <img src="/logo.png" alt="Logo" style={{ height: 72, width: 'auto', marginBottom: 16 }} />
        <Typography variant="h3" color="primary" sx={{ mb: 3, fontWeight: 700, letterSpacing: 2, textAlign: 'center' }}>
          Music HUB Dashboard
        </Typography>
        <Paper sx={{ p: 4, width: '100%', bgcolor: 'background.paper', color: 'text.primary', boxShadow: 6 }}>
          <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Login</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
