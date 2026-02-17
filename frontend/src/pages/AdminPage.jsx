import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, token } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const loadCategories = useCallback(() => {
    return fetch(`${API_BASE}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setCategoriesError('');
      })
      .catch((err) => {
        setCategoriesError(err.message || 'Failed to load categories');
        setCategories([]);
      });
  }, []);

  const loadCollaborations = useCallback(() => {
    if (!token) return Promise.resolve();
    return fetch(`${API_BASE}/collaborations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load collaborations');
        return res.json();
      })
      .then((data) => {
        setCollaborations(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load collaborations');
        setCollaborations([]);
      });
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && userRole !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!token) {
      setLoading(false);
      setCategoriesLoading(false);
      return;
    }
    loadCollaborations().finally(() => setLoading(false));
    loadCategories().finally(() => setCategoriesLoading(false));
  }, [userRole, isAuthenticated, navigate, token, loadCollaborations, loadCategories]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    setCategoryFormError('');
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryFormError('Category name is required.');
      return;
    }
    setCategorySubmitting(true);
    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })))
      .then(({ ok, status, data }) => {
        if (ok) {
          setNewCategoryName('');
          loadCategories();
        } else {
          setCategoryFormError(data.message || 'Failed to create category');
        }
      })
      .catch(() => setCategoryFormError('Network error'))
      .finally(() => setCategorySubmitting(false));
  };

  const handleDeleteCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This will fail if any products use it.`)) return;
    setDeletingCategoryId(cat.id);
    fetch(`${API_BASE}/categories/${cat.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 204) {
          loadCategories();
          return;
        }
        return res.json().then((data) => {
          throw new Error(data.message || 'Delete failed');
        });
      })
      .catch((err) => setCategoriesError(err.message || 'Delete failed'))
      .finally(() => setDeletingCategoryId(null));
  };

  const filtered =
    filterStatus === 'all'
      ? collaborations
      : collaborations.filter((c) => c.status === filterStatus);

  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Admin Dashboard</h1>
        <p>View collaborations between suppliers and importers. The importer approves or rejects requests sent to them.</p>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Collaborations</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="filter-status" style={{ marginRight: '0.5rem' }}>Status:</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {error && (
            <div className="empty-state" style={{ color: '#721c24', marginBottom: '1rem' }}>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <p>Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No collaborations.</p>
            </div>
          ) : (
            <div className="grid" style={{ gap: '0.75rem' }}>
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="product-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {c.supplierName || c.supplierEmail || `Supplier #${c.supplierId}`}
                      {c.supplierEmail && <span style={{ fontWeight: 400, color: '#666' }}> ({c.supplierEmail})</span>}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#666' }}>
                      ↔ {c.importerName || c.importerEmail || `Importer #${c.importerId}`}
                      {c.importerEmail && <span> ({c.importerEmail})</span>}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                      Status: <strong>{c.status}</strong>
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      background:
                        c.status === 'APPROVED' ? '#d4edda' : c.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                      color: c.status === 'APPROVED' ? '#155724' : c.status === 'PENDING' ? '#856404' : '#721c24',
                    }}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2>Categories</h2>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Manage product categories. Suppliers choose a category when adding products. Deleting a category fails if any product uses it.
          </p>
          {categoriesError && (
            <div className="empty-state" style={{ color: '#721c24', marginBottom: '1rem' }}>
              <p>{categoriesError}</p>
            </div>
          )}
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              style={{ padding: '0.4rem 0.6rem', minWidth: '180px' }}
              disabled={categorySubmitting}
            />
            <Button type="submit" variant="primary" disabled={categorySubmitting}>
              {categorySubmitting ? 'Adding…' : 'Add category'}
            </Button>
            {categoryFormError && <span style={{ color: '#721c24', fontSize: '0.9rem' }}>{categoryFormError}</span>}
          </form>
          {categoriesLoading ? (
            <p style={{ color: '#666' }}>Loading categories…</p>
          ) : categories.length === 0 ? (
            <p style={{ color: '#666' }}>No categories yet. Add one above.</p>
          ) : (
            <div className="grid" style={{ gap: '0.5rem' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="product-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteCategory(cat)}
                    disabled={deletingCategoryId !== null}
                  >
                    {deletingCategoryId === cat.id ? '…' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedLayout>
  );
};

export default AdminPage;
