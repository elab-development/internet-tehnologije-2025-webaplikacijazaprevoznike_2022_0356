import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PublicRoute component that redirects authenticated users away from public pages
 * Used for login page - redirects to dashboard if already logged in
 */
const PublicRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token, userRole } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  // If authenticated, don't render the public page
  if (isAuthenticated && token) {
    return null;
  }

  return <>{children}</>;
};

export default PublicRoute;
