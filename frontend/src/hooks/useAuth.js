import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @returns {Object} 
 */
export const useAuth = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('authToken') || null;
  });

  useEffect(() => {
    const roleFromState = location.state?.role;
    const tokenFromStorage = localStorage.getItem('authToken');
    const roleFromStorage = localStorage.getItem('userRole');
    
    if (roleFromState) {
      setUserRole(roleFromState);
      localStorage.setItem('userRole', roleFromState);
    } else if (roleFromStorage) {
      setUserRole(roleFromStorage);
    }
    
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }
  }, [location]);

  const updateRole = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
  };

  const isAuthenticated = !!token;

  return { 
    userRole, 
    setUserRole: updateRole, 
    isAuthenticated,
    token,
    logout
  };
};
