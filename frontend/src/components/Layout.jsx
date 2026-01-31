import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout">
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', margin: 0, padding: 0 }}>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/supplier">Supplier</Link></li>
            <li><Link to="/importer">Importer</Link></li>
          </ul>
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
      <footer style={{ padding: '1rem', borderTop: '1px solid #ccc', marginTop: 'auto' }}>
        <p>&copy; 2026 University Project</p>
      </footer>
    </div>
  );
};

export default Layout;
