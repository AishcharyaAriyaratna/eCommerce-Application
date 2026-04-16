import axios, { AxiosInstance } from 'axios';

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface User {
  sub: string;
  email: string;
  'cognito:groups': string[]; // Contains roles: Customer, Supplier, Data Steward
  email_verified: boolean;
}

class CognitoAuthService {
  private cognitoDomain: string;
  private clientId: string;
  private redirectUri: string;
  private region: string;
  private clientSecret?: string; // Only needed for confidential clients

  constructor() {
    this.cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN || '';
    this.clientId = process.env.REACT_APP_COGNITO_CLIENT_ID || '';
    this.region = process.env.REACT_APP_COGNITO_REGION || 'us-east-1';
    this.redirectUri = `${window.location.origin}/auth/callback`;
  }

  /**
   * Redirect user to Cognito login page
   */
  login(): void {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: this.redirectUri,
    });

    window.location.href = `https://${this.cognitoDomain}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await axios.post(
      `https://${this.cognitoDomain}/oauth2/token`,
      {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code,
        redirect_uri: this.redirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await axios.post(
      `https://${this.cognitoDomain}/oauth2/token`,
      {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Logout user - revoke tokens and redirect
   */
  async logout(accessToken: string): Promise<void> {
    try {
      await axios.post(
        `https://${this.cognitoDomain}/oauth2/revoke`,
        {
          client_id: this.clientId,
          token: accessToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (error) {
      console.error('Logout failed:', error);
    }

    // Clear tokens and redirect
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
   * Get user roles from token
   */
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.['cognito:groups'] || [];
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
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

export default new CognitoAuthService();
export type { User, TokenResponse };
