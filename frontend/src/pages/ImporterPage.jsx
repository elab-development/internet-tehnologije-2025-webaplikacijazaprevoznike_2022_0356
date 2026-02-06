import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';

const ImporterPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated } = useAuth();

  // Role-based redirect using useEffect + useNavigate
  useEffect(() => {
    if (isAuthenticated && userRole !== 'importer') {
      // Redirect non-importer users to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [userRole, isAuthenticated, navigate]);

  if (!isAuthenticated || userRole !== 'importer') {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Importer Dashboard</h1>
        <p>Welcome, Importer. Manage your containers and collaborations here.</p>
      </div>
    </ProtectedLayout>
  );
};

export default ImporterPage;
