import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { loginUser, registerUser, getCurrentUser, requestVerificationCode, 
  verifyAccount, logoutUser, requestPasswordReset, changePassword, resetPassword } from '../service/authService';

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
    setLoading(true);
    setError(null);
  
    // Check both cookie and localStorage token
    const isLoggedInCookie = document.cookie.split(';').some(c => c.trim().startsWith('isLoggedIn='));
    const token = localStorage.getItem('token');
    
    if (!isLoggedInCookie && !token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
  
    try {
      // Validate authentication by fetching current user
      const result = await getCurrentUser();
      
      if (result.data) {
        setCurrentUser(result.data.user);
        setIsAuthenticated(true);
      } else {
        // Handle auth failure - clean up auth data
        handleAuthFailure(result.error);
      }
    } catch (err) {
      handleAuthFailure(err.message || 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthFailure = useCallback((errorMessage) => {
    console.log("Auth failure:", errorMessage);
    
    // Clean up ALL auth data
    localStorage.removeItem('token');
    
    // For browser clients - we can't directly clear cookies from JS
    // but we can set expired cookies if needed
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    setError(errorMessage);
    
    // If this is during initial auth check, avoid redirects
    // The login page will handle displaying appropriate messages
  }, []);

  // Login function
  const login = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await loginUser(formData);
    
    if (result.data && result.data.token) {
      // For non-browser clients or as fallback, store token in localStorage
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

  // Register function remains mostly the same
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
      // API call to logout - will clear cookies server-side
      const result = await logoutUser();
      
      // Clear local storage for good measure
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

  // Check authentication status on mount and periodically
  useEffect(() => {
    checkAuthStatus();
    
    // Set up a timer to check auth status periodically
    // This helps with cases where the cookie might expire
    const authCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(authCheckInterval);
  }, [checkAuthStatus]);

  // Other functions remain mostly the same
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    const result = await getCurrentUser();
    
    if (result.data) {
      setCurrentUser(result.data.user);
    } else {
      if (result.error === 'Unauthorized' || result.error?.includes('token')) {
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

  // Memoize the context value
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
    verifyUserAccount
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;