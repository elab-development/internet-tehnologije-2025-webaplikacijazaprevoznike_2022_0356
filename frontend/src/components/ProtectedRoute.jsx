import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component that checks for authentication token
 * Redirects to login if user is not authenticated
 * 
 * @param {React.ReactNode} children - The component to render if authenticated
 * @param {Array<string>} allowedRoles - Optional array of allowed roles for this route
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, token } = useAuth();

  useEffect(() => {
    // Check if user has valid token
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }

    // If allowedRoles is specified, check if user's role is allowed
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      // Redirect to dashboard if role doesn't match
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, token, userRole, allowedRoles, navigate]);

  // Show nothing while checking authentication
  if (!isAuthenticated || !token) {
    return null;
  }

  // If role-based access is required and user doesn't have permission
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
