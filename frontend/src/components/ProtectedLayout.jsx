import React from 'react';
import NavBar from './NavBar';
import { useAuth } from '../hooks/useAuth';

/**
 * Layout wrapper for protected pages that includes NavBar
 * Use this component to wrap protected page content
 */
const ProtectedLayout = ({ children }) => {
  const { userRole } = useAuth();

  return (
    <div className="app-layout">
      <NavBar userRole={userRole} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
