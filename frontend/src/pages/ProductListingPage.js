/**
 * React Components - Product Listing & Search
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchProductsAsync,
  selectFilteredProducts,
  setSearchTerm,
  setSelectedCategory,
  selectSearchTerm,
  selectProductLoading,
  selectProductError,
  selectProduct,
} from '../store/slices/productSlice';
import { selectToken } from '../store/slices/authSlice';

export const ProductListingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const products = useSelector(selectFilteredProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const searchTerm = useSelector(selectSearchTerm);
  const [categories, setCategories] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchProductsAsync(token));
    }
  }, [dispatch, token]);

  // Extract unique categories
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map((p) => p.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleCategoryFilter = (e) => {
    dispatch(setSelectedCategory(e.target.value));
  };

  const handleProductClick = (product) => {
    dispatch(selectProduct(product));
    navigate(`/products/${product.id}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Product Catalog</h1>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#fee', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {/* Search & Filter Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Search Products:
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                box: '1px solid #ddd',
              }}
            />
          </label>
        </div>

        <div>
          <label>
            Filter by Category:
            <select
              onChange={handleCategoryFilter}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Results Section */}
      {loading && <p>Loading products...</p>}

      {products.length === 0 && !loading && (
        <p>No products found. Try adjusting your search or filters.</p>
      )}

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Price:</strong> ${product.price?.toFixed(2)}</p>
              <p><strong>Stock:</strong> {product.stock} units</p>
              <p style={{ color: 'green' }}>
                <strong>Status:</strong> {product.status}
              </p>
            </div>
            <button
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListingPage;
