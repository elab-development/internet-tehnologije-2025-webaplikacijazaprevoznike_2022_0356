import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('admin'); // Default role, can be from auth context

  useEffect(() => {
    // Get role from location state or localStorage
    const roleFromState = location.state?.role;
    const roleFromStorage = localStorage.getItem('userRole');
    
    if (roleFromState) {
      setUserRole(roleFromState);
      localStorage.setItem('userRole', roleFromState);
    } else if (roleFromStorage) {
      setUserRole(roleFromStorage);
    }
  }, [location]);

  const roleContent = {
    admin: {
      title: 'Admin Dashboard',
      description: 'Welcome, Admin. Here you can manage the system.',
      features: [
        'Manage users and permissions',
        'View system statistics',
        'Monitor all activities',
        'Configure system settings'
      ],
      actions: [
        { label: 'View Users', onClick: () => console.log('View users') },
        { label: 'System Stats', onClick: () => console.log('View stats') }
      ]
    },
    supplier: {
      title: 'Supplier Dashboard',
      description: 'Welcome, Supplier. Manage your products and collaborations here.',
      features: [
        'Manage your products',
        'View orders and requests',
        'Track shipments',
        'Collaborate with importers'
      ],
      actions: [
        { label: 'My Products', onClick: () => navigate('/products') },
        { label: 'Orders', onClick: () => console.log('View orders') }
      ]
    },
    importer: {
      title: 'Importer Dashboard',
      description: 'Welcome, Importer. Manage your containers and collaborations here.',
      features: [
        'Manage containers',
        'View available products',
        'Track shipments',
        'Collaborate with suppliers'
      ],
      actions: [
        { label: 'Browse Products', onClick: () => navigate('/products') },
        { label: 'My Containers', onClick: () => console.log('View containers') }
      ]
    }
  };

  const content = roleContent[userRole] || roleContent.admin;

  return (
    <div className="page">
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {content.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul style={{ marginTop: '1rem' }}>
          {content.features.map((feature, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
