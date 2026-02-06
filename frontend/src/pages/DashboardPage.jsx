import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, isAuthenticated } = useAuth();

  // Role-based redirects using useEffect + useNavigate
  useEffect(() => {
    if (!isAuthenticated) {
      return; // ProtectedRoute will handle redirect
    }

    // If role is not set, redirect to login
    if (!userRole) {
      navigate('/login', { replace: true });
      return;
    }

    // Role-specific redirects based on user's role
    // This allows custom logic for different roles
    const roleRedirects = {
      supplier: {
        // Suppliers might want to go directly to products
        // Uncomment if needed: navigate('/products', { replace: true });
      },
      importer: {
        // Importers might want to go directly to products
        // Uncomment if needed: navigate('/products', { replace: true });
      },
      admin: {
        // Admins stay on dashboard
      }
    };

    // Apply role-specific redirect if defined
    if (roleRedirects[userRole]) {
      // Role-specific logic can be added here
    }
  }, [userRole, isAuthenticated, navigate]);

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
    <ProtectedLayout>
      <div className="page">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        
        <div className="content-section">
          <h2>Quick Actions</h2>
          <div className="actions-container">
            {content.actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant="primary"
                size="large"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2>Features</h2>
          <ul className="list-unstyled">
            {content.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default DashboardPage;
