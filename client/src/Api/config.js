// /* eslint-disable no-undef */
// // client/src/Api/config.js

// // ✅ Dynamically set API URL based on environment
// const getApiUrl = () => {
//   // Production - use your live backend
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://want2be.in/api'; // Your live backend URL
//   }
  
//   // Development - use localhost
//   return 'http://localhost:5000/api';
// };

// export const API_URL = getApiUrl();

// console.log('🌍 Environment:', process.env.NODE_ENV);
// console.log('📡 API URL:', API_URL);






/* eslint-disable no-undef */
// client/src/Api/config.js

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://want2be-backend-689107792668.asia-south1.run.app/api';
  }

  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📡 API URL:', API_URL);