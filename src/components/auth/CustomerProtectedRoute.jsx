import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import CustomerLogin from './CustomerLogin.jsx';
import CustomerRegister from './CustomerRegister.jsx';
import Loading from '../common/Loading.jsx';

const CustomerProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    // If user is not authenticated and not loading, show login modal
    if (!loading && !user) {
      setShowLoginModal(true);
    }
  }, [user, loading]);

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

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

  // If admin user, redirect to admin panel
  if (user && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated customer, render the protected component
  if (user && !isAdmin()) {
    return children;
  }

  // If not authenticated, show login modal overlay on current page
  return (
    <div>
      {/* Show the home page in background */}
      <Navigate to="/" replace />
      
      {/* Auth Modals */}
      <CustomerLogin
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />
      <CustomerRegister
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default CustomerProtectedRoute; 