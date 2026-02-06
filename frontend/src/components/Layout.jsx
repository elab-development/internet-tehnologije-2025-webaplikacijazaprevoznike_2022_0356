import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout">
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>&copy; 2026</p>
      </footer>
    </div>
  );
};

export default Layout;
