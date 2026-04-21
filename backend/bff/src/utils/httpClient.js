/**
 * HTTP Client for Microservices
 * Handles requests to backend microservices with error handling
 */

const axios = require('axios');
const config = require('../config');
const { handleServiceError } = require('./errorHandler');

/**
 * Create an axios instance for a specific service
 * @param {string} baseUrl - Service base URL
 * @returns {AxiosInstance} Configured axios instance
 */
function createServiceClient(baseUrl) {
  return axios.create({
    baseURL: baseUrl,
    timeout: config.httpTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Make a proxied request to a microservice
 * @param {string} serviceName - Service name for error handling
 * @param {string} baseUrl - Service base URL
 * @param {string} method - HTTP method (get, post, put, patch, delete)
 * @param {string} path - Endpoint path
 * @param {Object} data - Request body (for POST, PUT, PATCH)
 * @param {string} token - JWT token for authorization
 * @returns {Promise<Object>} Service response data
 */
async function proxyRequest(serviceName, baseUrl, method, path, data, token) {
  const client = createServiceClient(baseUrl);

  // Add auth header if token provided
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const config = {
      method,
      url: path,
      headers,
    };

    // Add data for POST, PUT, PATCH
    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = data;
    }

    const response = await client(config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, serviceName);
  }
}

/**
 * Utility functions for each HTTP method
 */
const httpMethods = {
  get: (serviceName, baseUrl, path, token) =>
    proxyRequest(serviceName, baseUrl, 'get', path, null, token),

  post: (serviceName, baseUrl, path, data, token) =>
    proxyRequest(serviceName, baseUrl, 'post', path, data, token),

  put: (serviceName, baseUrl, path, data, token) =>
    proxyRequest(serviceName, baseUrl, 'put', path, data, token),

  patch: (serviceName, baseUrl, path, data, token) =>
    proxyRequest(serviceName, baseUrl, 'patch', path, data, token),

  delete: (serviceName, baseUrl, path, token) =>
    proxyRequest(serviceName, baseUrl, 'delete', path, null, token),
};

module.exports = {
  createServiceClient,
  proxyRequest,
  ...httpMethods,
};
