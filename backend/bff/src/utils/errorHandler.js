/**
 * Error Handling Utilities
 * Centralized error handling for BFF
 */

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(statusCode, message, details = null, originalError = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Safely extract and format error from service responses
 * @param {Error} error - The error object
 * @param {string} serviceName - Name of the service that failed
 * @returns {APIError} Formatted error
 */
function handleServiceError(error, serviceName) {
  // Handle network/timeout errors
  if (error.code === 'ECONNREFUSED') {
    return new APIError(
      503,
      `Service Unavailable: ${serviceName} is not responding`,
      { service: serviceName, code: 'SERVICE_UNAVAILABLE' },
      error
    );
  }

  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new APIError(
      504,
      `Gateway Timeout: Request to ${serviceName} timed out`,
      { service: serviceName, code: 'GATEWAY_TIMEOUT' },
      error
    );
  }

  // Handle HTTP errors from service responses
  if (error.response) {
    const { status, data } = error.response;

    // Service returned an error
    return new APIError(
      status || 500,
      data?.message || `Error from ${serviceName}`,
      data || { service: serviceName, status },
      error
    );
  }

  // Handle other errors
  if (error.message) {
    return new APIError(
      500,
      `Internal Server Error: ${error.message}`,
      { service: serviceName },
      error
    );
  }

  return new APIError(
    500,
    `Unknown error from ${serviceName}`,
    { service: serviceName },
    error
  );
}

/**
 * Error response formatter for HTTP responses
 * @param {APIError|Error} error - The error to format
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error) {
  if (error instanceof APIError) {
    return {
      error: {
        status: error.statusCode,
        message: error.message,
        timestamp: error.timestamp,
        ...(error.details && { details: error.details }),
      },
    };
  }

  return {
    error: {
      status: 500,
      message: error.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  const error = err instanceof APIError ? err : new APIError(500, err.message, null, err);

  const statusCode = error.statusCode || 500;
  const response = formatErrorResponse(error);

  res.status(statusCode).json(response);
}

module.exports = {
  APIError,
  handleServiceError,
  formatErrorResponse,
  errorHandler,
};
