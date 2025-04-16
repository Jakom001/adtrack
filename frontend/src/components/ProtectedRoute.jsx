// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { currentUser, loading, isAuthenticated, checkAuthStatus } = useAuthContext();
    
    // Add more logging to debug
    console.log('ProtectedRoute state:', { loading, isAuthenticated, currentUser });
    
    // While checking authentication status, show loading spinner
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }
    
    // If admin-only route, check if user is admin
    if (adminOnly && currentUser?.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    // If authenticated (and admin if required), render the child routes
    return <Outlet />;
};

export default ProtectedRoute;