import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, token } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      return;
    }
    loadCollaborations().finally(() => setLoading(false));
  }, [userRole, isAuthenticated, navigate, token, loadCollaborations]);

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
      </div>
    </ProtectedLayout>
  );
};

export default AdminPage;
