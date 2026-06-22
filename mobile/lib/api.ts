import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.zaphir.com/api';

class ApiClient {
  public axios = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  constructor() {
    this.axios.interceptors.request.use(this.onRequest.bind(this));
    this.axios.interceptors.response.use(
      (res) => res,
      this.onResponseError.bind(this),
    );
  }

  private async onRequest(config: InternalAxiosRequestConfig) {
    const access = await SecureStore.getItemAsync('access_token');
    if (access && config.headers) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  }

  private async onResponseError(error: AxiosError) {
    if (error.response?.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed && error.config) {
        return this.axios.request(error.config);
      }
      // Rediriger vers login (gestion via événement global)
      await SecureStore.deleteItemAsync('access_token');
    }
    return Promise.reject(error);
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const refresh = await SecureStore.getItemAsync('refresh_token');
      if (!refresh) return false;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
      await SecureStore.setItemAsync('access_token', data.data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // ─── API Methods (identiques au web) ─────────────────
  auth = {
    login: (email: string, password: string) =>
      this.axios.post('/auth/login', { email, password }).then((r) => r.data),
    register: (data: any) =>
      this.axios.post('/auth/register', data).then((r) => r.data),
    me: () => this.axios.get('/auth/me').then((r) => r.data),
    logout: () => this.axios.post('/auth/logout').then((r) => r.data),
  };

  client = {
    myOrders: () => this.axios.get('/room-orders?guestId=me').then((r) => r.data),
    myInvoices: () => this.axios.get('/invoices/me').then((r) => r.data),
    createOrder: (data: any) =>
      this.axios.post('/room-orders', data).then((r) => r.data),
  };

  hotel = {
    orders: () => this.axios.get('/room-orders').then((r) => r.data),
    staff: () => this.axios.get('/staff').then((r) => r.data),
    analytics: () => this.axios.get('/analytics/overview').then((r) => r.data),
    advanceOrder: (id: string) =>
      this.axios.patch(`/room-orders/${id}/advance`).then((r) => r.data),
  };

  admin = {
    hotels: () => this.axios.get('/hotels').then((r) => r.data),
    users: () => this.axios.get('/users').then((r) => r.data),
  };
}

export const api = new ApiClient();
