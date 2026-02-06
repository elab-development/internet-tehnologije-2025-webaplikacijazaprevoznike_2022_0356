import React, { useState, useMemo } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import Button from '../components/Button';

const ContainerBuilderPage = () => {
  // Mock products with weight and volume
  const [availableProducts] = useState([
    { id: 1, name: 'Product A', category: 'Electronics', price: 299.99, weight: 2.5, volume: 0.5, supplier: 'Supplier 1', inStock: true },
    { id: 2, name: 'Product B', category: 'Clothing', price: 49.99, weight: 0.3, volume: 0.1, supplier: 'Supplier 2', inStock: true },
    { id: 3, name: 'Product C', category: 'Electronics', price: 599.99, weight: 5.0, volume: 1.2, supplier: 'Supplier 1', inStock: false },
    { id: 4, name: 'Product D', category: 'Food', price: 19.99, weight: 1.0, volume: 0.3, supplier: 'Supplier 3', inStock: true },
    { id: 5, name: 'Product E', category: 'Clothing', price: 79.99, weight: 0.5, volume: 0.2, supplier: 'Supplier 2', inStock: true },
    { id: 6, name: 'Product F', category: 'Electronics', price: 199.99, weight: 3.0, volume: 0.8, supplier: 'Supplier 1', inStock: false },
  ]);

  // Container state: array of items with product id and quantity
  const [containerItems, setContainerItems] = useState([]);

  // Filter states for product selection
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(availableProducts.map(p => p.category))];

  // Filter available products
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || 
        product.category === filterCategory;
      return matchesSearch && matchesCategory && product.inStock;
    });
  }, [availableProducts, searchTerm, filterCategory]);

  // Add product to container
  const handleAddProduct = (product) => {
    const existingItem = containerItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increment quantity if product already in container
      setContainerItems(containerItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new product to container with quantity 1
      setContainerItems([...containerItems, {
        productId: product.id,
        quantity: 1
      }]);
    }
  };

  // Update quantity for a container item
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      handleRemoveProduct(productId);
      return;
    }
    
    setContainerItems(containerItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove product from container
  const handleRemoveProduct = (productId) => {
    setContainerItems(containerItems.filter(item => item.productId !== productId));
  };

  // Get product details by ID
  const getProductById = (productId) => {
    return availableProducts.find(p => p.id === productId);
  };

  // Compute totals using useMemo for derived rendering
  const totals = useMemo(() => {
    return containerItems.reduce((acc, item) => {
      const product = getProductById(item.productId);
      if (product) {
        acc.totalPrice += product.price * item.quantity;
        acc.totalWeight += product.weight * item.quantity;
        acc.totalVolume += product.volume * item.quantity;
        acc.itemCount += item.quantity;
      }
      return acc;
    }, {
      totalPrice: 0,
      totalWeight: 0,
      totalVolume: 0,
      itemCount: 0
    });
  }, [containerItems]);

  return (
    <ProtectedLayout>
      <div className="page">
        <h1>Container Builder</h1>
        <p>Add products to your container and manage quantities.</p>

        <div className="two-column-layout">
          {/* Left Column: Available Products */}
          <div>
            <h2>Available Products</h2>
            
            {/* Search and Filter */}
            <div className="filter-section" style={{ padding: '1rem' }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group">
                <select
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
            </div>

            {/* Product List */}
            <div className="scrollable" style={{ maxHeight: '500px' }}>
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No products available</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div style={{ flex: 1 }}>
                        <h4>{product.name}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          {product.category} | ${product.price.toFixed(2)}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#888' }}>
                          Weight: {product.weight}kg | Volume: {product.volume}m³
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAddProduct(product)}
                        variant="primary"
                        size="small"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Container Contents */}
          <div>
            <h2>Container Contents</h2>
            
            {/* Totals Summary */}
            <div className="totals-display">
              <h3>Totals</h3>
              <div className="totals-grid">
                <div>
                  <strong>Total Price:</strong> ${totals.totalPrice.toFixed(2)}
                </div>
                <div>
                  <strong>Total Weight:</strong> {totals.totalWeight.toFixed(2)} kg
                </div>
                <div>
                  <strong>Total Volume:</strong> {totals.totalVolume.toFixed(2)} m³
                </div>
                <div>
                  <strong>Item Count:</strong> {totals.itemCount}
                </div>
              </div>
            </div>

            {/* Container Items */}
            <div className="scrollable" style={{ maxHeight: '400px' }}>
              {containerItems.length === 0 ? (
                <div className="empty-state">
                  <p>Container is empty. Add products from the left panel.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {containerItems.map(item => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4>{product.name}</h4>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                              ${product.price.toFixed(2)} × {item.quantity} = ${(product.price * item.quantity).toFixed(2)}
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#888' }}>
                              Weight: {(product.weight * item.quantity).toFixed(2)}kg | Volume: {(product.volume * item.quantity).toFixed(2)}m³
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRemoveProduct(item.productId)}
                            variant="danger"
                            size="small"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="quantity-controls">
                          <label>Quantity:</label>
                          <Button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            variant="outline"
                            size="small"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item.productId, newQty);
                            }}
                            className="quantity-input"
                          />
                          <Button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            variant="outline"
                            size="small"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear Container Button */}
            {containerItems.length > 0 && (
              <div className="mt-2">
                <Button
                  onClick={() => setContainerItems([])}
                  variant="danger"
                  fullWidth
                >
                  Clear Container
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default ContainerBuilderPage;
