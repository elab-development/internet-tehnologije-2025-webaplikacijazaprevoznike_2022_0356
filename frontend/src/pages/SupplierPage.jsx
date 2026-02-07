import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SupplierPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, token } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [importers, setImporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedImporterId, setSelectedImporterId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const loadImporters = useCallback(() => {
    if (!token) return Promise.resolve();
    return fetch(`${API_BASE}/collaborations/importers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load importers');
        return res.json();
      })
      .then((data) => setImporters(Array.isArray(data) ? data : []))
      .catch(() => setImporters([]));
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && userRole !== 'supplier') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([loadCollaborations(), loadImporters()]).finally(() => setLoading(false));
  }, [userRole, isAuthenticated, navigate, token, loadCollaborations, loadImporters]);

  const handleRequestCollaboration = (e) => {
    e.preventDefault();
    setFormError('');
    const importerId = selectedImporterId ? Number(selectedImporterId) : null;
    if (!importerId) {
      setFormError('Select an importer.');
      return;
    }
    setSubmitting(true);
    fetch(`${API_BASE}/collaborations/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ importerId }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setShowRequestForm(false);
          setSelectedImporterId('');
          loadCollaborations();
          loadImporters();
        } else {
          setFormError(data.message || 'Request failed');
        }
      })
      .catch(() => setFormError('Network error'))
      .finally(() => setSubmitting(false));
  };

  if (!isAuthenticated || userRole !== 'supplier') {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Supplier Dashboard</h1>
        <p>Manage your products and collaborations with importers. Request a collaboration so an importer can see your products.</p>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Collaborations</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Request collaboration with an importer. After admin approves, that importer will see your products.
          </p>
          <Button onClick={() => { setShowRequestForm(true); setFormError(''); setSelectedImporterId(''); }} variant="primary">
            Request collaboration
          </Button>

          {error && (
            <div className="empty-state" style={{ color: '#721c24', marginTop: '1rem' }}>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="empty-state" style={{ marginTop: '1rem' }}>
              <p>Loading…</p>
            </div>
          ) : collaborations.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '1rem' }}>
              <p>No collaborations yet. Request one above.</p>
            </div>
          ) : (
            <div className="grid" style={{ marginTop: '1rem', gap: '0.75rem' }}>
              {collaborations.map((c) => (
                <div
                  key={c.id}
                  className="product-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <div>
                    <strong>{c.importerName || c.importerEmail || `Importer #${c.importerId}`}</strong>
                    {c.importerEmail && <span style={{ marginLeft: '0.5rem', color: '#666' }}>({c.importerEmail})</span>}
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                      Status: <span style={{ fontWeight: 600 }}>{c.status}</span>
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

      {showRequestForm && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !submitting && setShowRequestForm(false)}
        >
          <div
            style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Request collaboration</h2>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Select an importer. They will see your products after admin approves.</p>
            {formError && <p style={{ color: '#721c24', marginBottom: '1rem' }}>{formError}</p>}
            <form onSubmit={handleRequestCollaboration}>
              <div className="form-group">
                <label>Importer *</label>
                <select
                  value={selectedImporterId}
                  onChange={(e) => setSelectedImporterId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">— Select importer —</option>
                  {importers.map((imp) => (
                    <option key={imp.id} value={imp.id}>
                      {imp.name} ({imp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
};

export default SupplierPage;
