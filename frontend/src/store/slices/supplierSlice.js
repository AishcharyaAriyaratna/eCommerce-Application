/**
 * Supplier Redux Slice
 * Handles supplier dashboard data (products, approvals, etc.)
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  supplierProducts: [],
  allSuppliers: [],
  pendingProducts: [],
  pendingSuppliers: [],
  loading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    // Fetch supplier products
    fetchSupplierProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSupplierProductsSuccess: (state, action) => {
      state.loading = false;
      state.supplierProducts = action.payload;
      state.error = null;
    },
    fetchSupplierProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all suppliers
    fetchAllSuppliersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAllSuppliersSuccess: (state, action) => {
      state.loading = false;
      state.allSuppliers = action.payload;
      state.error = null;
    },
    fetchAllSuppliersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch pending products (admin view)
    fetchPendingProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPendingProductsSuccess: (state, action) => {
      state.loading = false;
      state.pendingProducts = action.payload;
      state.error = null;
    },
    fetchPendingProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch pending suppliers (admin view)
    fetchPendingSuppliersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPendingSuppliersSuccess: (state, action) => {
      state.loading = false;
      state.pendingSuppliers = action.payload;
      state.error = null;
    },
    fetchPendingSuppliersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSupplierProductsStart,
  fetchSupplierProductsSuccess,
  fetchSupplierProductsFailure,
  fetchAllSuppliersStart,
  fetchAllSuppliersSuccess,
  fetchAllSuppliersFailure,
  fetchPendingProductsStart,
  fetchPendingProductsSuccess,
  fetchPendingProductsFailure,
  fetchPendingSuppliersStart,
  fetchPendingSuppliersSuccess,
  fetchPendingSuppliersFailure,
  clearError,
} = supplierSlice.actions;

// Async thunks
export const fetchPendingProductsAsync = (token) => async (dispatch) => {
  dispatch(fetchPendingProductsStart());

  try {
    const response = await fetch('http://localhost:3001/api/products/status/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending products');
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products || [];
    dispatch(fetchPendingProductsSuccess(products));

    return products;
  } catch (error) {
    dispatch(fetchPendingProductsFailure(error.message));
    throw error;
  }
};

export const fetchPendingSuppliersAsync = (token) => async (dispatch) => {
  dispatch(fetchPendingSuppliersStart());

  try {
    const response = await fetch('http://localhost:3001/api/suppliers/status/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending suppliers');
    }

    const data = await response.json();
    const suppliers = Array.isArray(data) ? data : data.suppliers || [];
    dispatch(fetchPendingSuppliersSuccess(suppliers));

    return suppliers;
  } catch (error) {
    dispatch(fetchPendingSuppliersFailure(error.message));
    throw error;
  }
};

export const fetchAllSuppliersAsync = (token) => async (dispatch) => {
  dispatch(fetchAllSuppliersStart());

  try {
    const response = await fetch('http://localhost:3001/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }

    const data = await response.json();
    const suppliers = Array.isArray(data) ? data : data.suppliers || [];
    dispatch(fetchAllSuppliersSuccess(suppliers));

    return suppliers;
  } catch (error) {
    dispatch(fetchAllSuppliersFailure(error.message));
    throw error;
  }
};

// Selector functions
export const selectSupplierProducts = (state) => state.suppliers.supplierProducts;
export const selectAllSuppliers = (state) => state.suppliers.allSuppliers;
export const selectPendingProducts = (state) => state.suppliers.pendingProducts;
export const selectPendingSuppliers = (state) => state.suppliers.pendingSuppliers;
export const selectSupplierLoading = (state) => state.suppliers.loading;
export const selectSupplierError = (state) => state.suppliers.error;

export default supplierSlice.reducer;
