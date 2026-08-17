// client/src/Api/config.js

const API_URL =
  import.meta.env.MODE === 'production'
    ? 'https://want2be-backend-689107792668.asia-south1.run.app/api'
    : 'http://localhost:5000/api';

export { API_URL };

console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📡 API URL:', API_URL);