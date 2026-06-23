import { ApiClient } from '../shared/api/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'OPERATOR' | 'MANAGER';
}

export class AuthStore {
  private static listeners = new Set<() => void>();
  private static state = {
    user: null as UserProfile | null,
    token: localStorage.getItem('zafir_auth_token') || null,
    isAuthenticated: !!localStorage.getItem('zafir_auth_token'),
    isLoading: false,
    error: null as string | null
  };

  static getState() {
    return this.state;
  }

  static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static emit() {
    this.listeners.forEach(listen => listen());
  }

  /**
   * Log into node, persisting secure JWT on client
   */
  static async login(email: string, passwordHash: string): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.emit();

    try {
      const response = await ApiClient.post<{ token: string; user: UserProfile }>('/auth/login', {
        email,
        password: passwordHash
      });

      this.state.token = response.token;
      this.state.user = response.user;
      this.state.isAuthenticated = true;
      
      localStorage.setItem('zafir_auth_token', response.token);
      
      this.state.isLoading = false;
      this.emit();
      return true;
    } catch (err: any) {
      this.state.error = err.message || 'Identity authentication failed.';
      this.state.isLoading = false;
      this.emit();
      return false;
    }
  }

  /**
   * Securely sign out from active node, cleansing session dockets
   */
  static logout() {
    this.state.token = null;
    this.state.user = null;
    this.state.isAuthenticated = false;
    this.state.error = null;
    
    localStorage.removeItem('zafir_auth_token');
    this.emit();
  }
}
