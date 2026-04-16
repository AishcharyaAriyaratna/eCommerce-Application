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
 * TEMPORARY LOCAL AUTHENTICATION SERVICE
 * Replaces AWS Cognito for development without cloud services
 * Can be replaced with CognitoAuthService.ts when AWS is available
 */
class LocalAuthService {
  private bffUrl: string;

  constructor() {
    this.bffUrl = process.env.REACT_APP_BFF_API_URL || 'http://localhost:3001';
  }

  /**
   * Login with username and role (local development only)
   */
  async login(username: string, role: string): Promise<TokenResponse> {
    const response = await axios.post(`${this.bffUrl}/api/auth/login`, {
      username,
      role,
    });

    return response.data;
  }

  /**
   * Logout - clear local tokens
   */
  async logout(): Promise<void> {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
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
}

export default new LocalAuthService();
export type { User, TokenResponse };
