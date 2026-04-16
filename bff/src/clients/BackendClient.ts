import axios, { AxiosInstance } from 'axios';

/**
 * Axios instance configured to forward auth token to backend services
 */
class BackendClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Add request interceptor to forward auth token
    this.axiosInstance.interceptors.request.use((config) => {
      // Token will be passed in context from req.accessToken
      return config;
    });

    // Handle service errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Backend service error:', error.message);
        throw error;
      }
    );
  }

  getInstance(token: string): AxiosInstance {
    const instance = axios.create({
      baseURL: this.axiosInstance.defaults.baseURL,
      timeout: 10000,
    });

    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }
}

export const userServiceClient = new BackendClient(
  process.env.USER_SERVICE_URL || 'http://localhost:8081'
);

export const productServiceClient = new BackendClient(
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:8082'
);

export const orderServiceClient = new BackendClient(
  process.env.ORDER_SERVICE_URL || 'http://localhost:8083'
);

export const supplyManagementServiceClient = new BackendClient(
  process.env.SUPPLY_MANAGEMENT_SERVICE_URL || 'http://localhost:8084'
);
