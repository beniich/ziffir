// Secure API Client with auto-JWT bearer header interceptors

export interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiClient {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private static getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);
    
    // Auto-inject JWT security session if present inside persistent user state
    const token = localStorage.getItem('zafir_auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  /**
   * Universal fetch helper wrapper
   */
  private static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, val]) => {
        url.searchParams.append(key, val);
      });
    }

    const headers = this.getHeaders(options.headers);
    const config: RequestInit = {
      ...options,
      headers
    };

    const response = await fetch(url.toString(), config);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.message || `API error handshake failure status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  static get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  static put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  static delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
