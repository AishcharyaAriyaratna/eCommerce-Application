/**
 * Redux Store Configuration
 * Central state management for the application
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import supplierReducer from './slices/supplierSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    suppliers: supplierReducer,
  },
});

export default store;
