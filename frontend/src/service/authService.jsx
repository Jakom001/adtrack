import api from './api';

// Get CSRF token for protected requests
export const getCsrfToken = async () => {
  try {
    const response = await api.get('/auth/csrf-token');
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to get CSRF token' };
  }
};

// Function to handle user login
export const loginUser = async (formData) => {
  try {
    const response = await api.post('/auth/login', formData);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.error || 'Something went wrong. Please try again!' 
    };
  }
};

// Function to handle user registration
export const registerUser = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.error || 'Registration failed!. Please try again' 
    };
  }
};

// Function to get current user info
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.error || 'Failed to get user info' 
    };
  }
};


// Function to handle user logout
export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout', {}, { withCredentials: true });
    // Clear token from localStorage
    localStorage.removeItem('token');
    return { success: true, data: response.data, error: null };
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error.response?.data?.error || 'Logout failed!' 
    };
  }
};

// Change password
export const changePassword = async (formData) => {
  try {
    const response = await api.patch('/auth/change-password', formData);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to change password' };
  }
};

// Request verification code
export const requestVerificationCode = async () => {
  try {
    const response = await api.patch('/auth/send-verification-code');
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to send verification code' };
  }
};

// Verify account with code
export const verifyAccount = async (code) => {
  try {
    const response = await api.patch('/auth/verify-verification-code', { code });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to verify account' };
  }
};

// Request password reset code
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.patch('/auth/send-forgot-password-code', { email });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to send reset code' };
  }
};

// Verify password reset code and set new password
export const resetPassword = async (formData) => {
  try {
    const response = await api.patch('/auth/verify-forgot-password-code', formData);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to reset password' };
  }
};
