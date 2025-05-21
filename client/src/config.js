const config = {
  // In development, use the proxy defined in package.json
  // In production, use the backend service name (Docker internal network)
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
};

export default config;
