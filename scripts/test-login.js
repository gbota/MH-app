const axios = require('axios');

const API_URL = 'http://localhost:5050/api/auth/login';
const credentials = {
  email: 'musichub.cluj@gmail.com',
  password: 'Trans1lvan1a',
};

(async () => {
  try {
    const res = await axios.post(API_URL, credentials, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    console.log('Login successful!');
    console.log('Response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Login failed:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})(); 