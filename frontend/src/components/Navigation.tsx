import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItemClass = (path: string) => {
    const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const active = 'bg-indigo-700 text-white';
    const inactive = 'text-gray-300 hover:bg-indigo-600 hover:text-white';
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className="bg-indigo-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and nav links */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0"
            >
              <h1 className="text-xl font-bold text-white">eCommerce</h1>
            </button>

            <div className="hidden md:flex items-center space-x-4 ml-8">
              {/* Dashboard link (all authenticated users) */}
              <button
                onClick={() => navigate('/dashboard')}
                className={navItemClass('/dashboard')}
              >
                Dashboard
              </button>

              {/* Products link (all users) */}
              <button
                onClick={() => navigate('/products')}
                className={navItemClass('/products')}
              >
                Products
              </button>

              {/* Orders link (Customer, Data Steward) */}
              {(hasRole('Customer') || hasRole('Data Steward')) && (
                <button
                  onClick={() => navigate('/orders')}
                  className={navItemClass('/orders')}
                >
                  Orders
                </button>
              )}

              {/* Suppliers link (Supplier, Data Steward) */}
              {(hasRole('Supplier') || hasRole('Data Steward')) && (
                <button
                  onClick={() => navigate('/suppliers')}
                  className={navItemClass('/suppliers')}
                >
                  Suppliers
                </button>
              )}

              {/* Users link (Data Steward only) */}
              {hasRole('Data Steward') && (
                <button
                  onClick={() => navigate('/users')}
                  className={navItemClass('/users')}
                >
                  Users
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
