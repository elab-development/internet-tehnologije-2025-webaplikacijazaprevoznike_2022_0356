import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function mapProductFromApi(p) {
  const volume = (p.length * p.width * p.height) / 1_000_000;
  return {
    id: p.id,
    name: p.name,
    category: p.categoryName || p.category?.name || 'Uncategorized',
    price: Number(p.price),
    weight: Number(p.weight),
    volume,
    supplier: p.supplierName || p.supplierEmail || '',
    inStock: true,
  };
}

const ContainerBuilderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, token, isAuthenticated } = useAuth();

  const [containers, setContainers] = useState([]);
  const [containerId, setContainerId] = useState(() => location.state?.containerId ?? null);
  const [container, setContainer] = useState(null);
  const [containerLoading, setContainerLoading] = useState(false);
  const [containerError, setContainerError] = useState('');

  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [addError, setAddError] = useState('');
  const [addingProductId, setAddingProductId] = useState(null);

  const loadContainers = useCallback(() => {
    if (!token) return Promise.resolve();
    return fetch(`${API_BASE}/containers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load containers');
        return res.json();
      })
      .then((data) => setContainers(Array.isArray(data) ? data : []))
      .catch(() => setContainers([]));
  }, [token]);

  const loadContainer = useCallback(
    (id) => {
      if (!token || !id) {
        setContainer(null);
        return Promise.resolve();
      }
      setContainerLoading(true);
      setContainerError('');
      return fetch(`${API_BASE}/containers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status === 404 ? 'Container not found' : 'Failed to load container');
          return res.json();
        })
        .then(setContainer)
        .catch((err) => {
          setContainerError(err.message || 'Failed to load container');
          setContainer(null);
        })
        .finally(() => setContainerLoading(false));
    },
    [token]
  );

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'importer') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!token) return;

    loadContainers();
  }, [isAuthenticated, userRole, navigate, token, loadContainers]);

  useEffect(() => {
    setContainerId((prev) => location.state?.containerId ?? prev);
  }, [location.state?.containerId]);

  useEffect(() => {
    if (containerId) loadContainer(containerId);
    else setContainer(null);
  }, [containerId, loadContainer]);

  useEffect(() => {
    if (!token) {
      setProductsLoading(false);
      setProductsError('Not logged in');
      return;
    }
    fetch(`${API_BASE}/importer/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Session expired' : 'Failed to load products');
        return res.json();
      })
      .then((data) => {
        setAvailableProducts((data || []).map(mapProductFromApi));
        setProductsError('');
      })
      .catch((err) => setProductsError(err.message || 'Failed to load products'))
      .finally(() => setProductsLoading(false));
  }, [token]);

  const categories = useMemo(
    () => ['all', ...new Set(availableProducts.map((p) => p.category).filter(Boolean))],
    [availableProducts]
  );

  const filteredProducts = useMemo(() => {
    return availableProducts.filter((product) => {
      const matchesSearch =
        searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory && product.inStock;
    });
  }, [availableProducts, searchTerm, filterCategory]);

  const handleAddToContainer = (product, quantity = 1) => {
    if (!containerId || !token || quantity < 1) return;
    setAddError('');
    setAddingProductId(product.id);
    fetch(`${API_BASE}/containers/${containerId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: Number(quantity) }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.id) {
          setAddError('');
          loadContainer(containerId);
        } else {
          setAddError(data.message || 'Could not add product');
        }
      })
      .catch(() => setAddError('Network error'))
      .finally(() => setAddingProductId(null));
  };

  const handleRemoveItem = (itemId) => {
    if (!containerId || !token) return;
    if (!window.confirm('Remove this item from the container?')) return;
    fetch(`${API_BASE}/containers/${containerId}/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        loadContainer(containerId);
      })
      .catch(() => setContainerError('Failed to remove item'));
  };

  if (!isAuthenticated || userRole !== 'importer') {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="page">
        <h1>Container Builder</h1>
        <p>Select a container and add products from your approved suppliers.</p>

        {/* Container selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="container-select" style={{ marginRight: '0.5rem', fontWeight: 600 }}>
            Container:
          </label>
          <select
            id="container-select"
            value={containerId ?? ''}
            onChange={(e) => setContainerId(e.target.value ? Number(e.target.value) : null)}
            style={{ padding: '0.5rem 0.75rem', minWidth: '220px' }}
          >
            <option value="">— Select container —</option>
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.itemCount ?? 0} items)
              </option>
            ))}
          </select>
          {containers.length === 0 && !containerId && (
            <span style={{ marginLeft: '0.75rem', color: '#666' }}>
              No containers yet. <Link to="/importer">Create one</Link> first.
            </span>
          )}
        </div>

        {containerError && (
          <div className="empty-state" style={{ color: '#721c24', marginBottom: '1rem' }}>
            {containerError}
          </div>
        )}

        {containerLoading && containerId && (
          <div className="empty-state">
            <p>Loading container…</p>
          </div>
        )}

        {!containerId && !containerLoading && (
          <div className="empty-state">
            <p>Select a container above to add products, or <Link to="/importer">go to Containers</Link> to create one.</p>
          </div>
        )}

        {containerId && container && !containerLoading && (
          <div className="two-column-layout">
            {/* Left: Available products */}
            <div>
              <h2>Available products</h2>
              <div className="filter-section" style={{ padding: '1rem 0' }}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {addError && (
                <p style={{ color: '#721c24', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  {addError}
                </p>
              )}

              <div className="scrollable" style={{ maxHeight: '500px' }}>
                {productsLoading ? (
                  <div className="empty-state">
                    <p>Loading products…</p>
                  </div>
                ) : productsError ? (
                  <div className="empty-state" style={{ color: '#721c24' }}>
                    <p>{productsError}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No products available. Get approved by suppliers to see their products.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="product-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0 }}>{product.name}</h4>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                            {product.category} · ${product.price.toFixed(2)}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                            Weight: {product.weight} kg · Volume: {product.volume.toFixed(4)} m³
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            min={1}
                            defaultValue={1}
                            id={`qty-${product.id}`}
                            style={{ width: '56px', padding: '0.35rem' }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.getElementById(`qty-${product.id}`);
                              const qty = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
                              handleAddToContainer(product, qty);
                            }}
                            variant="primary"
                            size="small"
                            disabled={!!addingProductId}
                          >
                            {addingProductId === product.id ? 'Adding…' : 'Add'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Container contents */}
            <div>
              <h2>{container.name}</h2>
              <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                Max weight: {container.maxWeight} kg · Max volume: {container.maxVolume} m³ · Max price: $
                {Number(container.maxPrice || 0).toFixed(2)}
              </p>

              <div className="totals-display" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Current totals</h3>
                <div className="totals-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><strong>Price:</strong> ${Number(container.totalPrice || 0).toFixed(2)}</div>
                  <div><strong>Weight:</strong> {Number(container.totalWeight || 0).toFixed(2)} kg</div>
                  <div><strong>Volume:</strong> {Number(container.totalVolume || 0).toFixed(4)} m³</div>
                  <div><strong>Items:</strong> {(container.items || []).reduce((s, i) => s + (i.quantity || 0), 0)}</div>
                </div>
              </div>

              <h3 style={{ marginTop: '1.25rem' }}>Items in container</h3>
              <div className="scrollable" style={{ maxHeight: '400px' }}>
                {!container.items || container.items.length === 0 ? (
                  <div className="empty-state">
                    <p>No items yet. Add products from the left panel.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {container.items.map((item) => {
                      const p = item.product;
                      return (
                        <div
                          key={item.id}
                          className="item-card"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{p?.name ?? `Product #${item.productId}`}</h4>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                              ${p ? (p.price * item.quantity).toFixed(2) : '—'} ({p?.price?.toFixed(2)} × {item.quantity})
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                              Weight: {p ? (p.weight * item.quantity).toFixed(2) : '—'} kg · Volume:{' '}
                              {p ? (p.volume * item.quantity).toFixed(4) : '—'} m³
                            </p>
                          </div>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Link to="/importer">
                  <Button variant="outline">Back to Containers</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default ContainerBuilderPage;
