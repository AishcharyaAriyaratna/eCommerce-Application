import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, toDisplayText, useCommerce } from '../contexts/CommerceContext';

const Suppliers: React.FC = () => {
  const { user } = useAuth();
  const { listSupplierProducts, updateProduct } = useCommerce();

  if (!user) {
    return null;
  }

  const products = listSupplierProducts(user.username, user.role);

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-3xl font-bold text-slate-900">Supplier Console</h2>
            <p className="mt-1 text-slate-600">
              {user.role === 'Data Steward'
                ? 'Approve pending items and manage cross-supplier inventory.'
                : 'Manage your Food.com menu listings and stock.'}
            </p>

            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <article key={product.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <img src={product.imageUrl} alt={product.name} className="h-24 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-sm text-slate-500">{product.category} · Supplier {product.supplierName}</p>
                      <p className="text-sm text-slate-500">Status: {toDisplayText(product.status)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateProduct(product.id, { stock: product.stock - 1 })}
                        className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        - Stock
                      </button>
                      <span className="min-w-20 text-center text-sm font-medium text-slate-700">{product.stock} in stock</span>
                      <button
                        onClick={() => updateProduct(product.id, { stock: product.stock + 1 })}
                        className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        + Stock
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-slate-600">Price: {formatCurrency(product.price)}</p>
                    <button
                      onClick={() => updateProduct(product.id, { price: product.price + 0.5 })}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      Increase Price
                    </button>
                    {user.role === 'Data Steward' && (
                      <button
                        onClick={() => updateProduct(product.id, { status: product.status === 'approved' ? 'pending' : 'approved' })}
                        className="rounded-md border border-indigo-300 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
                      >
                        Toggle Approval
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Suppliers;