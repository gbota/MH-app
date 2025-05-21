import axios from 'axios';

const config = {
  // In development, use the proxy defined in package.json
  // In production, use the backend service name (Docker internal network)
  apiUrl: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
  
  // For Docker Compose environment
  getApiUrl: () => {
    // If running in the browser, use relative URL for production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      return '/api';
    }
    // For development
    return process.env.REACT_APP_API_URL || 'http://localhost:5050/api';
  },

  // Get auth token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set auth token in axios headers
  setAuthHeader: (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }
};

export default config;
