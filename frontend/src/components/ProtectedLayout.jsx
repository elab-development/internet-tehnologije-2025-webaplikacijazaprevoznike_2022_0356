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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar userRole={userRole} />
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        {children}
      </main>
      <footer style={{ 
        padding: '1rem', 
        borderTop: '1px solid #ccc', 
        backgroundColor: 'white',
        textAlign: 'center',
        color: '#666'
      }}>
        <p style={{ margin: 0 }}>&copy; 2026 University Project</p>
      </footer>
    </div>
  );
};

export default ProtectedLayout;
