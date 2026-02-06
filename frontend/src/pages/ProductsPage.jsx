import React, { useState, useMemo } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';

const ProductsPage = () => {
  const [products] = useState([
    { id: 1, name: 'Product A', category: 'Electronics', price: 299.99, supplier: 'Supplier 1', inStock: true },
    { id: 2, name: 'Product B', category: 'Clothing', price: 49.99, supplier: 'Supplier 2', inStock: true },
    { id: 3, name: 'Product C', category: 'Electronics', price: 599.99, supplier: 'Supplier 1', inStock: false },
    { id: 4, name: 'Product D', category: 'Food', price: 19.99, supplier: 'Supplier 3', inStock: true },
    { id: 5, name: 'Product E', category: 'Clothing', price: 79.99, supplier: 'Supplier 2', inStock: true },
    { id: 6, name: 'Product F', category: 'Electronics', price: 199.99, supplier: 'Supplier 1', inStock: false },
  ]);

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Derived rendering: filter products based on search and category filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search by name only
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by category
      const matchesCategory = filterCategory === 'all' || 
        product.category === filterCategory;
      
      // Filter by stock status (optional filter)
      const matchesStock = 
        filterStock === 'all' || 
        (filterStock === 'inStock' && product.inStock) ||
        (filterStock === 'outOfStock' && !product.inStock);
      
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

        {/* Results count */}
        <div className="results-count">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Products list */}
        <div className="mt-3">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products match your filters.</p>
            </div>
          ) : (
            <div className="grid" style={{ gap: '1rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div>
                    <h3>{product.name}</h3>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                      Category: {product.category} | Supplier: {product.supplier}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem' }}>
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className={`status-badge ${product.inStock ? 'status-in-stock' : 'status-out-of-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default ProductsPage;
