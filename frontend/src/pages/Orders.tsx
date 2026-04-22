import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatTimestamp, toDisplayText, useCommerce } from '../contexts/CommerceContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { listOrders } = useCommerce();

  if (!user) {
    return null;
  }

  const orders = listOrders(user.sub || user.username, user.role);

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-3xl font-bold text-slate-900">Orders</h2>
            <p className="mt-1 text-slate-600">
              {user.role === 'Data Steward'
                ? 'Platform-wide order tracking for Food.com operations.'
                : 'Your latest food orders and delivery status.'}
            </p>

            {orders.length === 0 ? (
              <p className="mt-6 rounded-md bg-slate-100 px-4 py-3 text-slate-600">No orders available yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{order.id}</h3>
                        <p className="text-sm text-slate-500">{formatTimestamp(order.createdAt)}</p>
                        <p className="text-sm text-slate-500">Customer: {order.userName}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500">Status</p>
                        <p className="font-semibold text-slate-900">{toDisplayText(order.status)}</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(order.total)}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3 rounded-md bg-slate-50 p-2">
                          <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.quantity} x {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </div>
    </main>
  );
};

export default Orders;