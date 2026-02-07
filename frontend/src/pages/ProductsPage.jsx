import React, { useState, useMemo, useEffect } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      setError('Please log in to see products.');
      return;
    }
    fetch(`${API_BASE}/products`, {
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
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.categoryName || p.category).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    const category = (p) => p.categoryName || p.category || '';
    return products.filter(product => {
      const matchesSearch = searchTerm === '' ||
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <ProtectedLayout>
      <div className="page">
        <h1>Products</h1>
        <p>Browse and filter available products.</p>

        {/* Filter UI */}
        <div className="filter-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Filters</h2>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="small"
              disabled={!hasActiveFilters}
            >
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
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="stock">Stock Status:</label>
              <select
                id="stock"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
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
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div>
                    <h3>{product.name}</h3>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                      Category: {product.categoryName || product.category || '—'} | Supplier: {product.supplierName || product.supplierEmail || product.supplier || '—'}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem' }}>
                      ${Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className={`status-badge ${product.inStock !== false ? 'status-in-stock' : 'status-out-of-stock'}`}>
                      {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default ProductsPage;
