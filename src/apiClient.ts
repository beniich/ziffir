/**
 * Zaphir API Client
 * Wraps native fetch to automatically include the Security Envelope authorization headers.
 */

class ApiClient {
  private token: string | null = null;
  private baseUrl: string = '/api';

  /**
   * Set the active authorization token (JWT or Sandbox Token)
   * Also exposes the token on window for the Socket.IO singleton
   */
  public setToken(token: string | null) {
    this.token = token;
    // Sync to global so useSocket can access it without circular imports
    (window as any).__zaphir_token__ = token ?? 'sandbox-token-proprietor';
  }

  public getToken() {
    return this.token;
  }

  /**
   * Base request interceptor
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || response.statusText;
      
      // Global Interceptors
      if (response.status === 401) {
        console.error('[SECURITY] 401 Unauthorized:', errorMessage);
        // Dispatch custom event to tell App.tsx to logout
        window.dispatchEvent(new CustomEvent('zaphir-unauthorized'));
      } else if (response.status === 403) {
        console.error('[SECURITY] 403 Forbidden (RBAC):', errorMessage);
        alert(`Clearance Denied: ${errorMessage}`);
      } else if (response.status === 429) {
        console.error('[SECURITY] 429 Quota Exceeded:', errorMessage);
        alert(`Token Quota Exceeded: ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

export const zaphirApi = new ApiClient();
