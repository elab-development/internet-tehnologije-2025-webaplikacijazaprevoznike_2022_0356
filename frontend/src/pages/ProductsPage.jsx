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
      <div className="page" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Products</h1>
        <p>Browse and filter available products.</p>

      {/* Filter UI */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div>
          <label htmlFor="search" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Search by Name:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Enter product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Category:
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stock" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Stock Status:
            </label>
            <select
              id="stock"
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Products</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginTop: '1rem', color: '#666' }}>
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products list */}
      <div style={{ marginTop: '1.5rem' }}>
        {filteredProducts.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No products match your filters.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    Category: {product.category} | Supplier: {product.supplier}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: '#007bff' }}>
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      backgroundColor: product.inStock ? '#d4edda' : '#f8d7da',
                      color: product.inStock ? '#155724' : '#721c24',
                      fontWeight: 'bold'
                    }}
                  >
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
