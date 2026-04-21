/**
 * React Components - Shopping Cart Page
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotal,
  removeItemFromCart,
  updateItemQuantity,
  createOrderAsync,
} from '../store/slices/cartSlice';
import { selectUser, selectToken } from '../store/slices/authSlice';

export const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  if (user?.role !== 'CUSTOMER') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Shopping Cart</h1>
        <p style={{ color: 'red' }}>Only customers can view the cart.</p>
        <button onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart(itemId));
    setMessage('Item removed from cart');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateItemQuantity({ itemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setMessage('Cart is empty. Add items before checking out.');
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const order = await dispatch(createOrderAsync(user.id, token));

      // Add items to order
      if (order && order.id) {
        const itemsPayload = items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        const response = await fetch(`http://localhost:3001/api/orders/${order.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemsPayload),
        });

        if (!response.ok) {
          throw new Error('Failed to add items to order');
        }

        setMessage(`Order created successfully! Order ID: ${order.id}`);
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (error) {
      setMessage(`Checkout failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <h1>Shopping Cart</h1>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: message.includes('failed') ? '#fee' : '#e8f5e9',
          color: message.includes('failed') ? 'red' : 'green',
          borderRadius: '4px',
        }}>
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>Your cart is empty.</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div>
          {/* Cart Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Unit Price</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>
                    <a
                      onClick={() => navigate(`/products/${item.productId}`)}
                      style={{ cursor: 'pointer', color: '#007bff' }}
                    >
                      {item.productName}
                    </a>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    ${item.unitPrice?.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      style={{ width: '50px', padding: '5px' }}
                    />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    ${item.subtotal?.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total & Checkout */}
          <div style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}>
              <h3>Order Total:</h3>
              <h2 style={{ color: 'green' }}>${total?.toFixed(2)}</h2>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: processing ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                cursor: processing ? 'default' : 'pointer',
              }}
            >
              {processing ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <button
              onClick={() => navigate('/products')}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
