/**
 * Cart Redux Slice
 * Handles shopping cart state (CUSTOMER only)
 */

import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  items: [],
  orderId: null,
  totalAmount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Create order
    createOrderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action) => {
      state.loading = false;
      state.orderId = action.payload.id;
      state.items = [];
      state.totalAmount = 0;
      state.error = null;
    },
    createOrderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add item to cart
    addItemToCart: (state, action) => {
      const { productId, quantity, unitPrice, productName } = action.payload;

      // Check if product already in cart
      const existingItem = state.items.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
      } else {
        state.items.push({
          id: uuidv4(),
          productId,
          productName,
          quantity,
          unitPrice,
          subtotal: quantity * unitPrice,
        });
      }

      calculateTotal(state);
    },

    // Remove item from cart
    removeItemFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      calculateTotal(state);
    },

    // Update item quantity
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item.id === itemId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== itemId);
        } else {
          item.quantity = quantity;
          item.subtotal = quantity * item.unitPrice;
        }
      }

      calculateTotal(state);
    },

    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.orderId = null;
      state.totalAmount = 0;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Helper function to calculate total
function calculateTotal(state) {
  state.totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0);
}

export const {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  clearError,
} = cartSlice.actions;

// Async thunk for creating order
export const createOrderAsync = (customerId, token) => async (dispatch) => {
  dispatch(createOrderStart());

  try {
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    dispatch(createOrderSuccess(data));

    return data;
  } catch (error) {
    dispatch(createOrderFailure(error.message));
    throw error;
  }
};

// Selector functions
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartItemCount = (state) => state.cart.items.length;
export const selectOrderId = (state) => state.cart.orderId;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
