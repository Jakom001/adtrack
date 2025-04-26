// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import WaveLoading from './common/WaveLoading';
const ProtectedRoute = ({ adminOnly = false }) => {
    const { currentUser, loading, isAuthenticated, checkAuthStatus } = useAuthContext();
    
    // While checking authentication status, show loading spinner
    if (loading) {
        return <div className="flex flex-col items-center py-8">
        <WaveLoading />
     
        <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
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