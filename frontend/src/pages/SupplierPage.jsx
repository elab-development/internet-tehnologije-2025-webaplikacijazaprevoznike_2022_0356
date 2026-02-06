import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';

const SupplierPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated } = useAuth();

  // Role-based redirect using useEffect + useNavigate
  useEffect(() => {
    if (isAuthenticated && userRole !== 'supplier') {
      // Redirect non-supplier users to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [userRole, isAuthenticated, navigate]);

  if (!isAuthenticated || userRole !== 'supplier') {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Supplier Dashboard</h1>
        <p>Welcome, Supplier. Manage your products and collaborations here.</p>
      </div>
    </ProtectedLayout>
  );
};

export default SupplierPage;
