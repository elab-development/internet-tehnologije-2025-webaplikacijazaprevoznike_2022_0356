import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const defaultForm = {
  code: '',
  name: '',
  price: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  categoryId: '',
  description: '',
  imageUrl: '',
};

const ProductsPage = () => {
  const { userRole, token } = useAuth();
  const isSupplier = userRole === 'supplier';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProducts = useCallback(() => {
    if (!token) return;
    return fetch(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Session expired' : 'Failed to load products');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products');
        setProducts([]);
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Please log in to see products.');
      return;
    }
    loadProducts().finally(() => setLoading(false));
  }, [token, loadProducts]);

  useEffect(() => {
    if (!isSupplier) return;
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [isSupplier]);

  const categoriesForFilter = useMemo(
    () => ['all', ...new Set(products.map((p) => p.categoryName || p.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const category = (p) => p.categoryName || p.category || '';
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === '' || (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || category(product) === filterCategory;
      const inStock = product.inStock !== false;
      const matchesStock =
        filterStock === 'all' ||
        (filterStock === 'inStock' && inStock) ||
        (filterStock === 'outOfStock' && !inStock);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, filterCategory, filterStock]);

  const hasActiveFilters = filterCategory !== 'all' || filterStock !== 'all' || searchTerm !== '';

  const handleClearFilters = () => {
    setFilterCategory('all');
    setFilterStock('all');
    setSearchTerm('');
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(defaultForm);
    setFormError('');
    setShowProductForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code || '',
      name: product.name || '',
      price: String(product.price ?? ''),
      weight: String(product.weight ?? ''),
      length: String(product.length ?? ''),
      width: String(product.width ?? ''),
      height: String(product.height ?? ''),
      categoryId: String(product.categoryId ?? ''),
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
    });
    setFormError('');
    setShowProductForm(true);
  };

  const closeForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData(defaultForm);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      price: Number(formData.price),
      weight: Number(formData.weight),
      length: Number(formData.length),
      width: Number(formData.width),
      height: Number(formData.height),
      categoryId: Number(formData.categoryId),
      description: formData.description.trim() || '',
      imageUrl: formData.imageUrl.trim() || null,
    };
    if (!payload.code || !payload.name || !formData.categoryId) {
      setFormError('Code, name and category are required.');
      return;
    }
    if (!payload.description) {
      setFormError('Description is required.');
      return;
    }
    if (Number.isNaN(payload.price) || Number.isNaN(payload.weight) || Number.isNaN(payload.length) || Number.isNaN(payload.width) || Number.isNaN(payload.height)) {
      setFormError('Price, weight and dimensions must be numbers.');
      return;
    }
    setFormSubmitting(true);
    if (editingProduct) {
      fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) return res.json().then((d) => { throw new Error(d.message || 'Update failed'); });
          return res.json();
        })
        .then(() => {
          closeForm();
          loadProducts();
        })
        .catch((err) => setFormError(err.message || 'Update failed'))
        .finally(() => setFormSubmitting(false));
    } else {
      fetch(`${API_BASE}/products`, {
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
          closeForm();
          loadProducts();
        })
        .catch((err) => setFormError(err.message || 'Create failed'))
        .finally(() => setFormSubmitting(false));
    }
  };

  const handleDelete = (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    fetch(`${API_BASE}/products/${product.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
      })
      .then(() => loadProducts())
      .catch((err) => setError(err.message || 'Delete failed'));
  };

  return (
    <ProtectedLayout>
      <div className="page">
        <h1>Products</h1>
        <p>Browse and filter available products.</p>

        {isSupplier && (
          <div style={{ marginBottom: '1rem' }}>
            <Button onClick={openCreateForm} variant="primary">
              Add product
            </Button>
          </div>
        )}

        <div className="filter-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Filters</h2>
            <Button onClick={handleClearFilters} variant="outline" size="small" disabled={!hasActiveFilters}>
              Clear Filters
            </Button>
          </div>
          <div className="form-group">
            <label htmlFor="search">Search by Name:</label>
            <input
              id="search"
              type="text"
              placeholder="Enter product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="category">Category:</label>
              <select id="category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                {categoriesForFilter.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="stock">Stock Status:</label>
              <select id="stock" value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                <option value="all">All Products</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="empty-state" style={{ color: '#721c24', marginBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <p>Loading products…</p>
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="mt-3">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>{products.length === 0 ? 'No products in the database.' : 'No products match your filters.'}</p>
                </div>
              ) : (
                <div className="grid" style={{ gap: '1rem' }}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <div>
                        <h3>{product.name}</h3>
                        <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                          Category: {product.categoryName || product.category || '—'} | Supplier:{' '}
                          {product.supplierName || product.supplierEmail || product.supplier || '—'}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem' }}>
                          ${Number(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <span className={`status-badge ${product.inStock !== false ? 'status-in-stock' : 'status-out-of-stock'}`}>
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {isSupplier && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="outline" size="small" onClick={() => openEditForm(product)}>
                              Edit
                            </Button>
                            <Button variant="danger" size="small" onClick={() => handleDelete(product)}>
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showProductForm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeForm}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', maxWidth: '480px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{editingProduct ? 'Edit product' : 'Add product'}</h2>
            {formError && (
              <p style={{ color: '#721c24', marginBottom: '1rem' }}>{formError}</p>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleFormChange('code', e.target.value)}
                  placeholder="e.g. PRD-001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleFormChange('categoryId', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleFormChange('weight', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Length (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.length}
                    onChange={(e) => handleFormChange('length', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Width (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.width}
                    onChange={(e) => handleFormChange('width', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.height}
                    onChange={(e) => handleFormChange('height', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={2}
                  placeholder="Short description"
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving…' : editingProduct ? 'Save changes' : 'Create product'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} disabled={formSubmitting}>
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

export default ProductsPage;
