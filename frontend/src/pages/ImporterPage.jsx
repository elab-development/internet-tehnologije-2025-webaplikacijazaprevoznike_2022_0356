import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ImporterPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, token } = useAuth();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [detailContainer, setDetailContainer] = useState(null);
  const [formData, setFormData] = useState({ name: '', maxWeight: '', maxVolume: '', maxPrice: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [collaborations, setCollaborations] = useState([]);
  const [collabLoading, setCollabLoading] = useState(true);
  const [collabError, setCollabError] = useState('');
  const [actingId, setActingId] = useState(null);

  const loadCollaborations = useCallback(() => {
    if (!token) return Promise.resolve();
    return fetch(`${API_BASE}/collaborations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load collaboration requests');
        return res.json();
      })
      .then((data) => {
        setCollaborations(Array.isArray(data) ? data : []);
        setCollabError('');
      })
      .catch((err) => {
        setCollabError(err.message || 'Failed to load');
        setCollaborations([]);
      });
  }, [token]);

  const loadContainers = useCallback(() => {
    if (!token) return;
    return fetch(`${API_BASE}/containers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Session expired' : 'Failed to load containers');
        return res.json();
      })
      .then((data) => {
        setContainers(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load containers');
        setContainers([]);
      });
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && userRole !== 'importer') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([loadContainers(), loadCollaborations()]).finally(() => {
      setLoading(false);
      setCollabLoading(false);
    });
  }, [userRole, isAuthenticated, navigate, token, loadContainers, loadCollaborations]);

  const handleApproveCollab = (id) => {
    setActingId(id);
    fetch(`${API_BASE}/collaborations/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Approve failed');
        loadCollaborations();
      })
      .catch(() => setCollabError('Failed to approve'))
      .finally(() => setActingId(null));
  };

  const handleRejectCollab = (id) => {
    if (!window.confirm('Reject this collaboration request?')) return;
    setActingId(id);
    fetch(`${API_BASE}/collaborations/${id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Reject failed');
        loadCollaborations();
      })
      .catch(() => setCollabError('Failed to reject'))
      .finally(() => setActingId(null));
  };

  const openCreateForm = () => {
    setFormData({ name: '', maxWeight: '', maxVolume: '', maxPrice: '' });
    setFormError('');
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormError('');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const name = formData.name.trim();
    if (!name) {
      setFormError('Name is required.');
      return;
    }
    const payload = {
      name,
      maxWeight: formData.maxWeight === '' ? undefined : Number(formData.maxWeight),
      maxVolume: formData.maxVolume === '' ? undefined : Number(formData.maxVolume),
      maxPrice: formData.maxPrice === '' ? undefined : Number(formData.maxPrice),
    };
    if (payload.maxWeight !== undefined && (Number.isNaN(payload.maxWeight) || payload.maxWeight < 0)) {
      setFormError('Max weight must be a non-negative number.');
      return;
    }
    if (payload.maxVolume !== undefined && (Number.isNaN(payload.maxVolume) || payload.maxVolume < 0)) {
      setFormError('Max volume must be a non-negative number.');
      return;
    }
    if (payload.maxPrice !== undefined && (Number.isNaN(payload.maxPrice) || payload.maxPrice < 0)) {
      setFormError('Max price must be a non-negative number.');
      return;
    }
    setFormSubmitting(true);
    fetch(`${API_BASE}/containers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || 'Create failed'); });
        return res.json();
      })
      .then(() => {
        closeCreateForm();
        loadContainers();
      })
      .catch((err) => setFormError(err.message || 'Create failed'))
      .finally(() => setFormSubmitting(false));
  };

  const loadDetail = (id) => {
    fetch(`${API_BASE}/containers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load container');
        return res.json();
      })
      .then(setDetailContainer)
      .catch(() => setDetailContainer(null));
  };

  const handleDelete = (container) => {
    if (!window.confirm(`Delete container "${container.name}"? This will remove all items inside.`)) return;
    fetch(`${API_BASE}/containers/${container.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
      })
      .then(() => {
        setDetailContainer(null);
        loadContainers();
      })
      .catch((err) => setError(err.message || 'Delete failed'));
  };

  if (!isAuthenticated || userRole !== 'importer') {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>My Containers</h1>
        <p>Create and manage your containers. Add products in Container Builder.</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Collaboration requests</h2>
          <p style={{ color: '#666', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Suppliers can send you a collaboration request. Approve to see their products on the Products page.
          </p>
          {collabError && (
            <p style={{ color: '#721c24', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{collabError}</p>
          )}
          {collabLoading ? (
            <p style={{ color: '#666' }}>Loading…</p>
          ) : collaborations.filter((c) => c.status === 'PENDING').length === 0 && collaborations.length === 0 ? (
            <p style={{ color: '#666' }}>No collaboration requests.</p>
          ) : (
            <div className="grid" style={{ gap: '0.75rem' }}>
              {collaborations.map((c) => (
                <div
                  key={c.id}
                  className="product-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong>{c.supplierName || c.supplierEmail || `Supplier #${c.supplierId}`}</strong>
                    {c.supplierEmail && <span style={{ marginLeft: '0.5rem', color: '#666' }}>({c.supplierEmail})</span>}
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Status: <strong>{c.status}</strong></p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                    {c.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleApproveCollab(c.id)}
                          disabled={actingId !== null}
                        >
                          {actingId === c.id ? '…' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleRejectCollab(c.id)}
                          disabled={actingId !== null}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ marginBottom: '1rem' }}>
          <Button onClick={openCreateForm} variant="primary">
            Create container
          </Button>
          <Link to="/container-builder" style={{ marginLeft: '0.75rem' }}>
            <Button variant="outline">Container Builder</Button>
          </Link>
        </div>

        {error && (
          <div className="empty-state" style={{ color: '#721c24', marginBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <p>Loading containers…</p>
          </div>
        ) : containers.length === 0 ? (
          <div className="empty-state">
            <p>No containers yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid" style={{ gap: '1rem' }}>
            {containers.map((c) => (
              <div key={c.id} className="product-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h3>{c.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                    Max weight: {c.maxWeight} kg · Max volume: {c.maxVolume} m³ · Max price: ${Number(c.maxPrice || 0).toFixed(2)}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                    Items: {c.itemCount ?? 0}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="small" onClick={() => loadDetail(c.id)}>
                    View
                  </Button>
                  <Link to="/container-builder" state={{ containerId: c.id }}>
                    <Button variant="primary" size="small">Add items</Button>
                  </Link>
                  <Button variant="danger" size="small" onClick={() => handleDelete(c)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeCreateForm}
        >
          <div
            style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Create container</h2>
            {formError && <p style={{ color: '#721c24', marginBottom: '1rem' }}>{formError}</p>}
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Shipment A"
                  required
                />
              </div>
              <div className="form-group">
                <label>Max weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData((p) => ({ ...p, maxWeight: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Max volume (m³)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxVolume}
                  onChange={(e) => setFormData((p) => ({ ...p, maxVolume: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Max price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={closeCreateForm} disabled={formSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailContainer && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setDetailContainer(null)}
        >
          <div
            style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{detailContainer.name}</h2>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              Max weight: {detailContainer.maxWeight} kg · Max volume: {detailContainer.maxVolume} m³ · Max price: ${Number(detailContainer.maxPrice || 0).toFixed(2)}
            </p>
            <h3 style={{ marginTop: '1rem' }}>Totals</h3>
            <p>
              Price: ${Number(detailContainer.totalPrice || 0).toFixed(2)} · Weight: {Number(detailContainer.totalWeight || 0).toFixed(2)} kg · Volume: {Number(detailContainer.totalVolume || 0).toFixed(4)} m³
            </p>
            <h3 style={{ marginTop: '1rem' }}>Items ({detailContainer.items?.length ?? 0})</h3>
            {detailContainer.items?.length ? (
              <ul style={{ paddingLeft: '1.25rem' }}>
                {detailContainer.items.map((item) => (
                  <li key={item.id}>
                    Product ID {item.productId} × {item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No items yet. Use Container Builder to add products.</p>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Button variant="outline" onClick={() => setDetailContainer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
};

export default ImporterPage;
