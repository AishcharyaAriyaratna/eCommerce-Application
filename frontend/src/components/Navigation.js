/**
 * Navigation Component
 * Top navigation bar with user info and logout
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { selectCartItemCount } from '../store/slices/cartSlice';

export const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartCount = useSelector(selectCartItemCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          eCommerce Platform
        </h2>
      </div>

      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Products
            </button>

            {user.role === 'CUSTOMER' && (
              <button
                onClick={() => navigate('/cart')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
            )}

            {user.role === 'CUSTOMER' && (
              <button
                onClick={() => navigate('/orders')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                My Orders
              </button>
            )}

            {user.role === 'SUPPLIER' && (
              <button
                onClick={() => navigate('/supplier-dashboard')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                My Products
              </button>
            )}

            {user.role === 'DATA_STEWARD' && (
              <button
                onClick={() => navigate('/admin-dashboard')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Admin Panel
              </button>
            )}
          </div>

          {/* User Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>{user.username} ({user.role})</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Login
        </button>
      )}
    </nav>
  );
};

export default Navigation;
