import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // In production (Vercel), the API calls will be proxied through rewrites
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use the local backend URL
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

// Create axios instance with default configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 