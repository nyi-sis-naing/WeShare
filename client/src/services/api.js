import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('weshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 responses to auto-logout expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('weshare_token')) {
        localStorage.removeItem('weshare_token');
        localStorage.removeItem('weshare_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
