import React, { createContext, ReactNode, useContext, useState } from 'react';
import { FoodOrder, FoodProduct, ProductFilters, AppUser, CartLineItem } from '../types/commerce';
import { initialOrders, initialProducts, initialUsers } from '../services/foodData';

interface CheckoutInput {
  userSub: string;
  userName: string;
}

interface ProductUpdateInput {
  price?: number;
  stock?: number;
  status?: 'approved' | 'pending';
}

interface CommerceContextType {
  products: FoodProduct[];
  users: AppUser[];
  listProducts: (filters: ProductFilters) => FoodProduct[];
  getProductById: (id: string) => FoodProduct | undefined;
  getCategories: () => string[];
  getCartItems: (userSub: string) => CartLineItem[];
  getCartTotal: (userSub: string) => number;
  getCartCount: (userSub: string) => number;
  addToCart: (userSub: string, productId: string, quantity: number) => string;
  updateCartQuantity: (userSub: string, productId: string, quantity: number) => void;
  removeFromCart: (userSub: string, productId: string) => void;
  checkoutCart: (input: CheckoutInput) => FoodOrder | null;
  listOrders: (userSub: string, role: string) => FoodOrder[];
  listSupplierProducts: (username: string, role: string) => FoodProduct[];
  updateProduct: (productId: string, input: ProductUpdateInput) => void;
  toggleUserStatus: (userId: string) => void;
}

const PRODUCTS_KEY = 'foodcom_products_v1';
const CARTS_KEY = 'foodcom_carts_v1';
const ORDERS_KEY = 'foodcom_orders_v1';
const USERS_KEY = 'foodcom_users_v1';

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

const readStorage = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const toTitle = (value: string): string => value.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export const CommerceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<FoodProduct[]>(() => readStorage(PRODUCTS_KEY, initialProducts));
  const [orders, setOrders] = useState<FoodOrder[]>(() => readStorage(ORDERS_KEY, initialOrders));
  const [users, setUsers] = useState<AppUser[]>(() => readStorage(USERS_KEY, initialUsers));
  const [carts, setCarts] = useState<Record<string, Array<{ productId: string; quantity: number }>>>(() => readStorage(CARTS_KEY, {}));

  const listProducts = (filters: ProductFilters): FoodProduct[] => {
    return products.filter((product) => {
      const search = filters.search.trim().toLowerCase();
      const bySearch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);
      const byCategory = filters.category.length === 0 || product.category === filters.category;
      return bySearch && byCategory;
    });
  };

  const getProductById = (id: string): FoodProduct | undefined => products.find((product) => product.id === id);

  const getCategories = (): string[] => Array.from(new Set(products.map((product) => product.category))).sort();

  const getCartItems = (userSub: string): CartLineItem[] => {
    const cart = carts[userSub] || [];
    return cart
      .map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product) {
          return null;
        }

        return {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: item.quantity,
          subtotal: Number((product.price * item.quantity).toFixed(2)),
        };
      })
      .filter((line): line is CartLineItem => Boolean(line));
  };

  const getCartTotal = (userSub: string): number => {
    return Number(getCartItems(userSub).reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  };

  const getCartCount = (userSub: string): number => {
    return getCartItems(userSub).reduce((sum, item) => sum + item.quantity, 0);
  };

  const addToCart = (userSub: string, productId: string, quantity: number): string => {
    const product = getProductById(productId);
    if (!product) {
      return 'Product not found.';
    }

    if (product.status !== 'approved') {
      return 'This product is pending approval.';
    }

    const safeQuantity = Math.max(1, quantity);
    const cart = carts[userSub] || [];
    const currentItem = cart.find((item) => item.productId === productId);
    const currentQty = currentItem ? currentItem.quantity : 0;

    if (currentQty + safeQuantity > product.stock) {
      return `Only ${product.stock} items are available in stock.`;
    }

    const nextCart = currentItem
      ? cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + safeQuantity } : item))
      : [...cart, { productId, quantity: safeQuantity }];

    const nextCarts = { ...carts, [userSub]: nextCart };
    setCarts(nextCarts);
    writeStorage(CARTS_KEY, nextCarts);
    return `${product.name} added to cart.`;
  };

  const updateCartQuantity = (userSub: string, productId: string, quantity: number): void => {
    const safeQuantity = Math.max(1, quantity);
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    const nextCarts = {
      ...carts,
      [userSub]: (carts[userSub] || []).map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(safeQuantity, product.stock) } : item
      ),
    };

    setCarts(nextCarts);
    writeStorage(CARTS_KEY, nextCarts);
  };

  const removeFromCart = (userSub: string, productId: string): void => {
    const nextCarts = {
      ...carts,
      [userSub]: (carts[userSub] || []).filter((item) => item.productId !== productId),
    };
    setCarts(nextCarts);
    writeStorage(CARTS_KEY, nextCarts);
  };

  const checkoutCart = (input: CheckoutInput): FoodOrder | null => {
    const cartItems = getCartItems(input.userSub);
    if (cartItems.length === 0) {
      return null;
    }

    const createdOrder: FoodOrder = {
      id: `FOOD-${1000 + orders.length + 1}`,
      userSub: input.userSub,
      userName: input.userName,
      status: 'placed',
      createdAt: new Date().toISOString(),
      items: cartItems,
      total: Number(cartItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
    };

    const nextOrders = [createdOrder, ...orders];
    setOrders(nextOrders);
    writeStorage(ORDERS_KEY, nextOrders);

    const nextProducts = products.map((product) => {
      const ordered = cartItems.find((line) => line.productId === product.id);
      if (!ordered) {
        return product;
      }
      return {
        ...product,
        stock: Math.max(0, product.stock - ordered.quantity),
      };
    });
    setProducts(nextProducts);
    writeStorage(PRODUCTS_KEY, nextProducts);

    const nextCarts = {
      ...carts,
      [input.userSub]: [],
    };
    setCarts(nextCarts);
    writeStorage(CARTS_KEY, nextCarts);

    return createdOrder;
  };

  const listOrders = (userSub: string, role: string): FoodOrder[] => {
    if (role === 'Data Steward') {
      return orders;
    }
    return orders.filter((order) => order.userSub === userSub);
  };

  const listSupplierProducts = (username: string, role: string): FoodProduct[] => {
    if (role === 'Data Steward') {
      return products;
    }
    return products.filter((product) => product.supplierName === username);
  };

  const updateProduct = (productId: string, input: ProductUpdateInput): void => {
    const nextProducts = products.map((product) => {
      if (product.id !== productId) {
        return product;
      }
      return {
        ...product,
        ...(typeof input.price === 'number' ? { price: Number(input.price.toFixed(2)) } : {}),
        ...(typeof input.stock === 'number' ? { stock: Math.max(0, Math.floor(input.stock)) } : {}),
        ...(input.status ? { status: input.status } : {}),
      };
    });

    setProducts(nextProducts);
    writeStorage(PRODUCTS_KEY, nextProducts);
  };

  const toggleUserStatus = (userId: string): void => {
    const nextUsers: AppUser[] = users.map((currentUser) => {
      if (currentUser.id !== userId) {
        return currentUser;
      }
      return {
        ...currentUser,
        status: (currentUser.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended',
      };
    });
    setUsers(nextUsers);
    writeStorage(USERS_KEY, nextUsers);
  };

  const value: CommerceContextType = {
    products,
    users,
    listProducts,
    getProductById,
    getCategories,
    getCartItems,
    getCartTotal,
    getCartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    checkoutCart,
    listOrders,
    listSupplierProducts,
    updateProduct,
    toggleUserStatus,
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export const useCommerce = (): CommerceContextType => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used inside CommerceProvider');
  }
  return context;
};

export const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

export const formatTimestamp = (isoDate: string): string => new Date(isoDate).toLocaleString();

export const toDisplayText = (value: string): string => toTitle(value.replace('_', ' '));
