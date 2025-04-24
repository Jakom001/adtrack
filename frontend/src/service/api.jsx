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
    
    // Handle token expiration specifically
    if (error.response?.status === 401 && 
        (error.response?.data?.code === 'TOKEN_EXPIRED' || error.response?.data?.message === 'Token expired') && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        // Update localStorage for mobile clients
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clean up ALL auth data
        localStorage.removeItem('token');
        console.log("Token refresh failed, logging out");
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;