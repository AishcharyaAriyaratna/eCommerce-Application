import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, toDisplayText, useCommerce } from '../contexts/CommerceContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProductById, addToCart } = useCommerce();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const product = useMemo(() => (productId ? getProductById(productId) : undefined), [productId, getProductById]);

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white">
          Back to Products
        </button>
      </main>
    );
  }

  const isCustomer = user?.role === 'Customer';

  const handleAddToCart = (): void => {
    if (!user) {
      return;
    }

    const result = addToCart(user.sub || user.username, product.id, quantity);
    setMessage(result);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate('/products')}
        className="mb-4 rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
      >
        Back to Menu
      </button>

      <section className="grid grid-cols-1 gap-8 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <img src={product.imageUrl} alt={product.name} className="h-80 w-full rounded-xl object-cover" />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">{product.category}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h2>
          <p className="mt-3 text-slate-600">{product.description}</p>

          <div className="mt-4 space-y-1 text-slate-700">
            <p>Supplier: <span className="font-medium">{product.supplierName}</span></p>
            <p>Status: <span className="font-medium">{toDisplayText(product.status)}</span></p>
            <p>Stock: <span className="font-medium">{product.stock}</span></p>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</p>

          {isCustomer && product.status === 'approved' && (
            <div className="mt-5 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                className="w-24 rounded-md border border-slate-300 px-3 py-2"
              />
              <button
                onClick={handleAddToCart}
                className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
              >
                Add to Cart
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Go to Cart
              </button>
            </div>
          )}

          {!isCustomer && (
            <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-amber-700">
              Sign in as a customer to add this item to cart.
            </p>
          )}

          {message && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">{message}</p>}
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;
