import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';

const NavBar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const role = userRole || localStorage.getItem('userRole') || 'admin';

  const roleLinks = {
    admin: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/products', label: 'Products' },
      { path: '/admin', label: 'Admin' },
    ],
    supplier: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/products', label: 'Products' },
      { path: '/supplier', label: 'Supplier' },
    ],
    importer: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/products', label: 'Products' },
      { path: '/container-builder', label: 'Container' },
      { path: '/importer', label: 'Containers' },
    ],
  };

  const links = roleLinks[role] || roleLinks.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/dashboard" className="navbar-brand">
          Transport
        </Link>
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={isActive(link.path) ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-meta">
        <span className="navbar-role">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
        <Button onClick={handleLogout} variant="outline" size="small">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
