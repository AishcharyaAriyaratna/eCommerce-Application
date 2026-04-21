/**
 * React Components - Supplier Dashboard
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, selectToken } from '../store/slices/authSlice';

export const SupplierDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
  });
  const [message, setMessage] = useState('');

  // Check if user is supplier
  useEffect(() => {
    if (user?.role !== 'SUPPLIER') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch supplier products
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const supplierProds = Array.isArray(data)
        ? data.filter((p) => p.supplierId === user.id)
        : [];
      setProducts(supplierProds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      setMessage('Product created successfully! Awaiting admin approval.');
      setFormData({ name: '', description: '', category: '', price: '', stock: '' });
      setShowForm(false);

      // Refresh products
      await fetchProducts();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newStock }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      setMessage('Stock updated successfully!');
      await fetchProducts();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supplier Dashboard</h1>
      <p>Welcome, {user?.username}!</p>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: message.includes('Error') ? '#fee' : '#e8f5e9',
          color: message.includes('Error') ? 'red' : 'green',
          borderRadius: '4px',
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#fee',
          color: 'red',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}

      {/* Create Product Form */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showForm ? '✕ Cancel' : '+ Create New Product'}
        </button>

        {showForm && (
          <div style={{
            marginTop: '15px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}>
            <h3>Create New Product</h3>

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '10px' }}>
                <label>
                  Product Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <label>
                  Category:
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </label>

                <label>
                  Price ($):
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>
                  Stock Quantity:
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </label>
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create Product
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Products List */}
      <div>
        <h2>My Products ({products.length})</h2>

        {loading && <p>Loading products...</p>}

        {products.length === 0 && !loading && (
          <p>You haven't created any products yet.</p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '15px',
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '4px',
                backgroundColor: '#fff',
              }}
            >
              <h3>{product.name}</h3>
              <p>{product.description}</p>

              <div style={{ marginTop: '10px' }}>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Price:</strong> ${product.price?.toFixed(2)}</p>
                <p><strong>Stock:</strong> {product.stock} units</p>
                <p style={{
                  color: product.status === 'PENDING' ? 'orange' : product.status === 'APPROVED' ? 'green' : 'red',
                }}>
                  <strong>Status:</strong> {product.status}
                </p>
              </div>

              {product.status === 'APPROVED' && (
                <div style={{ marginTop: '10px' }}>
                  <label>
                    Update Stock:
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboardPage;
