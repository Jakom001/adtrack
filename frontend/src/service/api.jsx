import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Important! Allows cookies to be sent with requests
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    // For non-browser clients, we still include token in Authorization header if available
    const token = localStorage.getItem('token'); // Keep for backward compatibility with mobile
    if (token && !document.cookie.includes('accessToken')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // For CSRF protection on mutation requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      try {
        // Get CSRF token for protected routes
        const { data } = await axios.get(`${API_BASE_URL}/csrf-token`, { withCredentials: true });
        if (data.csrfToken) {
          config.headers['X-CSRF-Token'] = data.csrfToken;
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is token expired and request hasn't been retried yet
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // Request a new token
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        // If we also support mobile, update localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    // For other 401 errors, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;