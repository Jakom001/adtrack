import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { loginUser, registerUser, getCurrentUser, requestVerificationCode, 
  verifyAccount, logoutUser, requestPasswordReset, changePassword, resetPassword, } from '../service/authService';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  const checkAuthStatus = useCallback(async () => {
    console.log("Checking auth status...");
    setLoading(true);
    setError(null);
  
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    console.log("Token exists:", !!token);
    
    if (!token) {
      console.log("No token found, not authenticated");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
  
    try {
      // Validate token by fetching current user
      console.log("Fetching current user data...");
      const result = await getCurrentUser();
      console.log("Current user result:", result);
      
      if (result.data) {
        console.log("User authenticated successfully");
        setCurrentUser(result.data.user);
        setIsAuthenticated(true);
      } else {
        console.log("Authentication failed:", result.error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setError(result.error);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setError(err.message || 'Authentication check failed');
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await loginUser(formData);
    if (result.data && result.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', result.data.token);
      setIsAuthenticated(true);
      
      // Fetch user details after successful login
      const userResult = await getCurrentUser();
      if (userResult.data && userResult.data.user) {
        setCurrentUser(userResult.data.user);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Register function
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await registerUser(formData);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await logoutUser();
      
      // Always clear local storage and auth state on logout attempt
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear auth state even if API call fails
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setError("Logout failed, but you've been logged out locally");
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Refresh user data periodically or when needed
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    const result = await getCurrentUser();
    
    if (result.data) {
      setCurrentUser(result.data.user);
    } else {
      if (result.error === 'Unauthorized' || result.error.includes('token')) {
        // Handle token expiration
        await logout();
      }
      setError(result.error);
    }
    setLoading(false);
  }, [isAuthenticated, logout]);


  const changeUserPassword = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await changePassword(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);
  
  const verifyUserAccount = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    
    const result = await verifyAccount(code);
    
    if (result.data && currentUser) {
      // Update user verification status
      setCurrentUser({...currentUser, verified: true});
    }
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
    clearError,
    checkAuthStatus,
    changeUserPassword,
    verifyUserAccount,
    requestVerificationCode,
    requestPasswordReset,
    resetPassword
  }), [
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
    clearError,
    checkAuthStatus,
    changeUserPassword,
    verifyUserAccount,
    requestVerificationCode,
    requestPasswordReset,
    resetPassword
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;