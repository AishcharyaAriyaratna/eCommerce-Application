/**
 * Product Redux Slice
 * Handles product listing, filtering, and search
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allProducts: [],
  filteredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  pagination: {
    page: 0,
    size: 20,
    total: 0,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Fetch products
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.allProducts = action.payload;
      state.filteredProducts = action.payload;
      state.error = null;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select single product
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    // Search products
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      filterProducts(state);
    },

    // Filter by category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      filterProducts(state);
    },

    // Update pagination
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Helper function to filter products
function filterProducts(state) {
  let filtered = [...state.allProducts];

  // Filter by search term
  if (state.searchTerm) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  // Filter by category
  if (state.selectedCategory) {
    filtered = filtered.filter(
      (product) => product.category === state.selectedCategory
    );
  }

  // Filter by status (only show approved products)
  filtered = filtered.filter((product) => product.status === 'APPROVED');

  state.filteredProducts = filtered;
}

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  selectProduct,
  setSearchTerm,
  setSelectedCategory,
  setPagination,
  clearError,
} = productSlice.actions;

// Async thunk for fetching products
export const fetchProductsAsync = (token) => async (dispatch) => {
  dispatch(fetchProductsStart());

  try {
    const response = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    // If array, use it. If object with array property, extract
    const products = Array.isArray(data) ? data : data.products || data.data || [];
    dispatch(fetchProductsSuccess(products));

    return products;
  } catch (error) {
    dispatch(fetchProductsFailure(error.message));
    throw error;
  }
};

// Selector functions
export const selectAllProducts = (state) => state.products.allProducts;
export const selectFilteredProducts = (state) => state.products.filteredProducts;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectProductLoading = (state) => state.products.loading;
export const selectProductError = (state) => state.products.error;
export const selectSearchTerm = (state) => state.products.searchTerm;
export const selectSelectedCategory = (state) => state.products.selectedCategory;

export default productSlice.reducer;
