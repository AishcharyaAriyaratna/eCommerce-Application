/**
 * React Components - Data Steward Dashboard (Admin)
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchPendingProductsAsync,
  fetchPendingSuppliersAsync,
  selectPendingProducts,
  selectPendingSuppliers,
} from '../store/slices/supplierSlice';
import { selectUser, selectToken } from '../store/slices/authSlice';

export const DataStewardDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const pendingProducts = useSelector(selectPendingProducts);
  const pendingSuppliers = useSelector(selectPendingSuppliers);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'suppliers'

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'DATA_STEWARD') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch pending items
  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([
        dispatch(fetchPendingProductsAsync(token)),
        dispatch(fetchPendingSuppliersAsync(token)),
      ])
        .catch((err) => {
          setMessage(`Error loading data: ${err.message}`);
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, token]);

  const handleApproveProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve product');
      }

      setMessage('Product approved successfully!');
      // Refresh data
      dispatch(fetchPendingProductsAsync(token));
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleRejectProduct = async (productId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject product');
      }

      setMessage('Product rejected successfully!');
      // Refresh data
      dispatch(fetchPendingProductsAsync(token));
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleApproveSupplier = async (supplierId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/suppliers/${supplierId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve supplier');
      }

      setMessage('Supplier approved successfully!');
      // Refresh data
      dispatch(fetchPendingSuppliersAsync(token));
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleRejectSupplier = async (supplierId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3001/api/suppliers/${supplierId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject supplier');
      }

      setMessage('Supplier rejected successfully!');
      // Refresh data
      dispatch(fetchPendingSuppliersAsync(token));
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Data Steward Dashboard</h1>
      <p>Welcome, {user?.username}! You have admin privileges.</p>

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

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'products' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'products' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Pending Products ({pendingProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'suppliers' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'suppliers' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Pending Suppliers ({pendingSuppliers.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <h2>Pending Product Approvals</h2>

          {loading && <p>Loading...</p>}

          {pendingProducts.length === 0 && !loading && (
            <p>No pending products to review.</p>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '15px',
          }}>
            {pendingProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  border: '2px solid #ffc107',
                  padding: '15px',
                  borderRadius: '4px',
                  backgroundColor: '#fffbf0',
                }}
              >
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Price:</strong> ${product.price?.toFixed(2)}</p>
                  <p><strong>Stock:</strong> {product.stock} units</p>
                  <p><strong>Supplier ID:</strong> {product.supplierId}</p>
                  <p><strong>Status:</strong> {product.status}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleApproveProduct(product.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() => handleRejectProduct(product.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div>
          <h2>Pending Supplier Approvals</h2>

          {loading && <p>Loading...</p>}

          {pendingSuppliers.length === 0 && !loading && (
            <p>No pending suppliers to review.</p>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '15px',
          }}>
            {pendingSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                style={{
                  border: '2px solid #17a2b8',
                  padding: '15px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f7fa',
                }}
              >
                <h3>{supplier.name}</h3>

                <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                  <p><strong>Email:</strong> {supplier.email}</p>
                  <p><strong>Phone:</strong> {supplier.phone}</p>
                  <p><strong>Address:</strong> {supplier.address}</p>
                  <p><strong>City:</strong> {supplier.city}</p>
                  <p><strong>Country:</strong> {supplier.country}</p>
                  <p><strong>Tax ID:</strong> {supplier.taxId}</p>
                  <p><strong>Status:</strong> {supplier.status}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleApproveSupplier(supplier.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() => handleRejectSupplier(supplier.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataStewardDashboardPage;
