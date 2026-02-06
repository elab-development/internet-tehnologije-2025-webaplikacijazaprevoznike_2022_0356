import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';

const AdminPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated } = useAuth();

  // Role-based redirect using useEffect + useNavigate
  useEffect(() => {
    if (isAuthenticated && userRole !== 'admin') {
      // Redirect non-admin users to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [userRole, isAuthenticated, navigate]);

  if (!isAuthenticated || userRole !== 'admin') {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin. Here you can manage the system.</p>
      </div>
    </ProtectedLayout>
  );
};

export default AdminPage;
