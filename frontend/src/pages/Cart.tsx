import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../contexts/CommerceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useAuth } from '../contexts/AuthContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCartItems, getCartTotal, updateCartQuantity, removeFromCart, checkoutCart } = useCommerce();
  const [message, setMessage] = useState('');

  const userSub = user?.sub || user?.username || '';
  const cartItems = useMemo(() => (userSub ? getCartItems(userSub) : []), [userSub, getCartItems]);
  const total = useMemo(() => (userSub ? getCartTotal(userSub) : 0), [userSub, getCartTotal]);

  if (!user || user.role !== 'Customer') {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-slate-900">Cart Access</h2>
        <p className="text-slate-600 mt-2">Only customers can use the shopping cart.</p>
      </main>
    );
  }

  const handleCheckout = (): void => {
    const order = checkoutCart({ userSub, userName: user.username });
    if (!order) {
      setMessage('Your cart is empty.');
      return;
    }

    setMessage(`Order ${order.id} placed successfully.`);
    setTimeout(() => {
      navigate('/orders');
    }, 700);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Your Cart</h2>
        <p className="text-slate-600">Review your meal selections before checkout.</p>
      </header>

      {message && <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-emerald-700">{message}</p>}

      {cartItems.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Your cart is currently empty.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Browse Products
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <article key={item.productId} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex gap-4">
                  <img src={item.imageUrl} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{formatCurrency(item.price)} each</p>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateCartQuantity(userSub, item.productId, Number(event.target.value))}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1"
                      />
                      <button
                        onClick={() => removeFromCart(userSub, item.productId)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-right font-semibold text-slate-900">{formatCurrency(item.subtotal)}</p>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 h-fit">
            <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
            <div className="mt-4 flex justify-between text-slate-700">
              <span>Items</span>
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
            >
              Place Order
            </button>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;
