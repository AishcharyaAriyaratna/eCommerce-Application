import React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, toDisplayText, useCommerce } from '../contexts/CommerceContext';

const Products: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listProducts, getCategories, addToCart } = useCommerce();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const products = useMemo(() => listProducts({ search, category }), [search, category, listProducts]);
  const categories = useMemo(() => getCategories(), [getCategories]);

  const handleAddToCart = (productId: string): void => {
    if (!user) {
      return;
    }

    const response = addToCart(user.sub || user.username, productId, 1);
    setMessage(response);
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Food.com Menu</h2>
                <p className="text-slate-600">Fresh meals, desserts, and drinks from trusted suppliers.</p>
              </div>
              {user?.role === 'Customer' && (
                <button
                  onClick={() => navigate('/cart')}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
                >
                  Open Cart
                </button>
              )}
            </header>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search foods..."
                className="rounded-md border border-slate-300 px-3 py-2"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
              >
                Clear Filters
              </button>
            </div>

            {message && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">{message}</p>}

            <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img src={product.imageUrl} alt={product.name} className="h-48 w-full rounded-t-xl object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {product.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                    <p className="mt-3 text-sm text-slate-500">Supplier: {product.supplierName}</p>
                    <p className="mt-1 text-sm text-slate-500">Status: {toDisplayText(product.status)}</p>
                    <p className="mt-1 text-sm text-slate-500">Stock: {product.stock}</p>
                    <p className="mt-3 text-xl font-bold text-slate-900">{formatCurrency(product.price)}</p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        View Details
                      </button>
                      {user?.role === 'Customer' && product.status === 'approved' && (
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {products.length === 0 && (
              <p className="mt-8 rounded-md bg-slate-100 px-4 py-3 text-slate-600">No products match your filters.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;