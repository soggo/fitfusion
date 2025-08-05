import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - user:', user?.email, 'loading:', loading, 'isAdmin:', isAdmin?.());

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user is admin for admin routes
  if (location.pathname.startsWith('/admin') && !isAdmin()) {
    console.log('User is not admin, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated and authorized, render the protected component
  return children;
};

export default ProtectedRoute; 