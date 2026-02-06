import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AdminPage from './pages/AdminPage';
import SupplierPage from './pages/SupplierPage';
import ImporterPage from './pages/ImporterPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="supplier" element={<SupplierPage />} />
          <Route path="importer" element={<ImporterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
