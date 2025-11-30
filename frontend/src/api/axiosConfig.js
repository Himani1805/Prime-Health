import axios from 'axios';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: 'https://prime-health.onrender.com/api',
  // baseURL: 'http://localhost:3000/api', // Pointing to your Node.js backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attaches the Token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Optional global error handling
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // You can handle 401 (Unauthorized) errors here globally (e.g., redirect to login)
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
























