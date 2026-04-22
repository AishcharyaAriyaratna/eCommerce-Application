import axios from 'axios';

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface User {
  sub: string;
  username: string;
  email: string;
  role: string; // Local role: Customer, Supplier, Data Steward
  email_verified: boolean;
}

/**
 * Local authentication service for Food.com demo flow.
 * Uses BFF auth endpoint when available and falls back to local mock tokens.
 */
class LocalAuthService {
  private bffUrl: string;

  constructor() {
    this.bffUrl = process.env.REACT_APP_BFF_URL || 'http://localhost:3001';
  }

  /**
   * Login with username and role (local development only)
   */
  async login(username: string, role: string): Promise<TokenResponse> {
    const loginUrl = `${this.bffUrl}/api/auth/login`;
    console.log('Attempting login request:', loginUrl, { username, role });
    
    try {
      const response = await axios.post(loginUrl, {
        username,
        role,
      });

      console.log('Login response status:', response.status);
      console.log('Login response data received:', {
        hasIdToken: !!response.data.id_token,
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        tokenType: response.data.token_type,
      });

      return response.data;
    } catch (error) {
      console.error('Login request failed, falling back to local token mode:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received, request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      }
      return this.createMockTokens(username, role);
    }
  }

  private toBase64Url(value: string): string {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private createMockToken(payload: Record<string, unknown>): string {
    const header = this.toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = this.toBase64Url(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  }

  private createMockTokens(username: string, role: string): TokenResponse {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const roleForToken = role || 'Customer';
    const commonPayload = {
      sub: username,
      username,
      email: `${username}@food.com`,
      role: roleForToken,
      email_verified: true,
      exp,
    };

    return {
      access_token: this.createMockToken({ ...commonPayload, scope: 'food:read food:write' }),
      id_token: this.createMockToken(commonPayload),
      refresh_token: this.createMockToken({ sub: username, token_use: 'refresh', exp }),
      expires_in: 60 * 60 * 24,
      token_type: 'Bearer',
    };
  }

  /**
   * Logout - clear local tokens
   */
  async logout(): Promise<void> {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Parse JWT and extract user info
   */
  parseToken(token: string): User {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get current user from ID token
   */
  getCurrentUser(): User | null {
    const idToken = localStorage.getItem('id_token');
    if (!idToken) return null;

    try {
      return this.parseToken(idToken);
    } catch (error) {
      console.error('Failed to parse ID token:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if token is valid
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get Authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }
}

const localAuthService = new LocalAuthService();
export default localAuthService;
export type { User, TokenResponse };
