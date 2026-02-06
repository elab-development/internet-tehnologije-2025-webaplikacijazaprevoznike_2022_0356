import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to get and manage user authentication/role
 * @returns {Object} { userRole, setUserRole }
 */
export const useAuth = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(() => {
    // Initialize from localStorage or default
    return localStorage.getItem('userRole') || 'admin';
  });

  useEffect(() => {
    // Update role from location state if provided
    const roleFromState = location.state?.role;
    if (roleFromState) {
      setUserRole(roleFromState);
      localStorage.setItem('userRole', roleFromState);
    }
  }, [location]);

  const updateRole = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  return { userRole, setUserRole: updateRole };
};
