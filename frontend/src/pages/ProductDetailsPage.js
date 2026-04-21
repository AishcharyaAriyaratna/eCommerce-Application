/**
 * React Components - Product Details Page
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { selectSelectedProduct } from '../store/slices/productSlice';
import { addItemToCart } from '../store/slices/cartSlice';
import { selectUser } from '../store/slices/authSlice';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector(selectSelectedProduct);
  const user = useSelector(selectUser);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  if (!product) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Product not found. <a onClick={() => navigate('/products')}>Go back</a></p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (user?.role !== 'CUSTOMER') {
      setMessage('Only customers can add items to cart.');
      return;
    }

    if (quantity > product.stock) {
      setMessage(`Only ${product.stock} units available.`);
      return;
    }

    dispatch(addItemToCart({
      productId: product.id,
      quantity,
      unitPrice: product.price,
      productName: product.name,
    }));

    setMessage(`Added ${quantity} ${product.name}(s) to cart!`);
    setQuantity(1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <button onClick={() => navigate('/products')} style={{ marginBottom: '20px' }}>
        ← Back to Products
      </button>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px' }}>
        <h1>{product.name}</h1>

        <div style={{ marginTop: '20px' }}>
          <p><strong>Description:</strong></p>
          <p>{product.description}</p>
        </div>

        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>
          <div>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> <span style={{ fontSize: '20px', color: 'green' }}>${product.price?.toFixed(2)}</span></p>
            <p><strong>Stock Available:</strong> {product.stock} units</p>
            <p><strong>Supplier ID:</strong> {product.supplierId}</p>
            <p><strong>Status:</strong> {product.status}</p>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
            <h3>Add to Cart</h3>

            {message && (
              <div style={{
                color: message.includes('Added') ? 'green' : 'red',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: message.includes('Added') ? '#e8f5e9' : '#fee',
              }}>
                {message}
              </div>
            )}

            {user?.role === 'CUSTOMER' ? (
              <div>
                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      marginBottom: '15px',
                    }}
                  />
                </label>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: product.stock === 0 ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    cursor: product.stock === 0 ? 'default' : 'pointer',
                  }}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View Cart
                </button>
              </div>
            ) : (
              <p style={{ color: '#666' }}>
                Only customers can purchase products. You are logged in as a <strong>{user?.role}</strong>.
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Product Details</h3>
          <ul>
            <li>Created: {new Date(product.createdAt).toLocaleDateString()}</li>
            <li>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</li>
            <li>Approval Status: {product.status}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
