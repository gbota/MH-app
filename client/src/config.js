const config = {
  // In development, use the proxy defined in package.json
  // In production, use the backend service name (Docker internal network) or Render URL
  apiUrl: process.env.REACT_APP_API_URL || 'https://music-school-backend.onrender.com/api',
};

export default config;
