import React from 'react';
import ProtectedLayout from '../components/ProtectedLayout';

const ImporterPage = () => {
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
