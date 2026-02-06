import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';

const NavBar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  // Get role from prop, localStorage, or default to 'admin'
  const role = userRole || localStorage.getItem('userRole') || 'admin';

  // Role-based navigation links
  const roleLinks = {
    admin: [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/products', label: 'All Products', icon: '📦' },
      { path: '/admin', label: 'Admin Panel', icon: '⚙️' },
    ],
    supplier: [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/products', label: 'My Products', icon: '📦' },
      { path: '/supplier', label: 'Supplier Tools', icon: '🔧' },
    ],
    importer: [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/products', label: 'Browse Products', icon: '📦' },
      { path: '/container-builder', label: 'Container Builder', icon: '📦' },
      { path: '/importer', label: 'My Containers', icon: '📋' },
    ],
  };

  const links = roleLinks[role] || roleLinks.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={{
      backgroundColor: '#343a40',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link 
          to="/dashboard" 
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}
        >
          Transport App
        </Link>
        
        <ul style={{ 
          display: 'flex', 
          listStyle: 'none', 
          gap: '1.5rem', 
          margin: 0, 
          padding: 0 
        }}>
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                style={{
                  color: isActive(link.path) ? '#ffc107' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive(link.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.path)) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.path)) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          Role: <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong>
        </span>
        <Button
          onClick={handleLogout}
          variant="danger"
          size="small"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
