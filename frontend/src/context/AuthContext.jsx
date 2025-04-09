import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Create context
const AuthContext = createContext(initialState);

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (formData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { data, error } = await loginUser(formData);
      
      if (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: error });
        return { success: false, error };
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Update state
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: data.user,
          token: data.token
        } 
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.message || 'Something went wrong. Please try again!' 
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (formData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { data, error } = await registerUser(formData);
      
      if (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: error });
        return { success: false, error };
      }
      
      return { success: true, message: data.success };
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.message || 'Registration failed!' 
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Value object to be provided to consumers
  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};