import React from 'react';
import ProtectedLayout from '../components/ProtectedLayout';

const AdminPage = () => {
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
