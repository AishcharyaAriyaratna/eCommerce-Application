import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, useCommerce } from '../contexts/CommerceContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { products, listOrders, getCartCount, getCartTotal } = useCommerce();

  const userSub = user?.sub || user?.username || '';
  const activeProducts = products.filter((product) => product.status === 'approved').length;
  const pendingProducts = products.filter((product) => product.status === 'pending').length;
  const roleOrders = user ? listOrders(userSub, user.role) : [];
  const cartCount = user && user.role === 'Customer' ? getCartCount(userSub) : 0;
  const cartTotal = user && user.role === 'Customer' ? getCartTotal(userSub) : 0;

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="rounded-xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-100 p-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome to Food.com</h2>
          {user && (
            <p className="mt-2 text-slate-600">
              Signed in as <span className="font-semibold">{user.username}</span> ({user.role})
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Approved Products</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{activeProducts}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{pendingProducts}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Visible Orders</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{roleOrders.length}</p>
            </div>
          </div>

          {hasRole('Customer') && (
            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm text-indigo-700">Your active cart</p>
              <p className="mt-1 text-lg font-semibold text-indigo-900">
                {cartCount} items · {formatCurrency(cartTotal)}
              </p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/products')}
              className="rounded-lg bg-slate-900 px-4 py-3 text-left text-white hover:bg-slate-800"
            >
              <h3 className="font-semibold">Browse Menu</h3>
              <p className="text-sm text-slate-200">Explore food categories and product details.</p>
            </button>

            {hasRole('Customer') && (
              <button
                onClick={() => navigate('/cart')}
                className="rounded-lg bg-emerald-700 px-4 py-3 text-left text-white hover:bg-emerald-600"
              >
                <h3 className="font-semibold">Open Cart</h3>
                <p className="text-sm text-emerald-100">Update quantities and checkout quickly.</p>
              </button>
            )}

            {(hasRole('Customer') || hasRole('Data Steward')) && (
              <button
                onClick={() => navigate('/orders')}
                className="rounded-lg bg-indigo-700 px-4 py-3 text-left text-white hover:bg-indigo-600"
              >
                <h3 className="font-semibold">Track Orders</h3>
                <p className="text-sm text-indigo-100">Review order timelines and totals.</p>
              </button>
            )}

            {(hasRole('Supplier') || hasRole('Data Steward')) && (
              <button
                onClick={() => navigate('/suppliers')}
                className="rounded-lg bg-amber-600 px-4 py-3 text-left text-white hover:bg-amber-500"
              >
                <h3 className="font-semibold">Manage Stock</h3>
                <p className="text-sm text-amber-100">Adjust food inventory and price points.</p>
              </button>
            )}

            {hasRole('Data Steward') && (
              <button
                onClick={() => navigate('/users')}
                className="rounded-lg bg-rose-700 px-4 py-3 text-left text-white hover:bg-rose-600"
              >
                <h3 className="font-semibold">Admin Users</h3>
                <p className="text-sm text-rose-100">Enable or suspend platform accounts.</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
