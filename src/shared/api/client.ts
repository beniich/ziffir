const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type { UserRole } from '../../types';

// ════════════════════════════════════════════════════════════
// TOKEN MANAGER (inchangé)
// ════════════════════════════════════════════════════════════

class TokenManager {
  private static ACCESS = 'zaphir_access';
  private static REFRESH = 'zaphir_refresh';

  static getAccess(): string | null { return localStorage.getItem(this.ACCESS); }
  static getRefresh(): string | null { return localStorage.getItem(this.REFRESH); }
  static set(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS, access);
    localStorage.setItem(this.REFRESH, refresh);
  }
  static clear(): void {
    localStorage.removeItem(this.ACCESS);
    localStorage.removeItem(this.REFRESH);
  }

  static async tryRefresh(): Promise<boolean> {
    const refresh = this.getRefresh();
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) { this.clear(); return false; }
      const { data } = await res.json();
      this.set(data.accessToken, data.refreshToken);
      return true;
    } catch {
      this.clear();
      return false;
    }
  }
}

// ════════════════════════════════════════════════════════════
// FETCH AVEC AUTH
// ════════════════════════════════════════════════════════════

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const access = TokenManager.getAccess();
  if (access) headers['Authorization'] = `Bearer ${access}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'Erreur réseau');
  }

  if (response.status === 401 && retry) {
    const refreshed = await TokenManager.tryRefresh();
    if (refreshed) return request<T>(endpoint, options, false);
    throw new ApiError(401, 'Session expirée');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new ApiError(response.status, error.error, error.details);
  }

  return response.json();
}

// ════════════════════════════════════════════════════════════
// API METHODS (par contexte métier)
// ════════════════════════════════════════════════════════════

export const api = {
  // ─── Auth ──────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: any) =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
    logout: async () => {
      try { await request('/auth/logout', { method: 'POST' }); } catch {}
      TokenManager.clear();
    },
  },

  // ─── Client endpoints ─────────────────────────────
  client: {
    myOrders: () => request<any>('/room-orders?guestId=me'),
    myInvoices: () => request<any>('/invoices/me'),
    createOrder: (data: any) =>
      request<any>('/room-orders', { method: 'POST', body: JSON.stringify(data) }),
  },

  // ─── Hotel endpoints ──────────────────────────────
  hotel: {
    orders: (filters?: { status?: string }) =>
      request<any>(`/room-orders${filters?.status ? `?status=${filters.status}` : ''}`),
    staff: () => request<any>('/staff'),
    vault: () => request<any>('/vault/documents'),
    pricing: () => request<any>('/pricing/rules'),
    controls: () => request<any>('/controls'),
    analytics: () => request<any>('/analytics/overview'),
    advanceOrder: (id: string) =>
      request<any>(`/room-orders/${id}/advance`, { method: 'PATCH' }),
    syncPricing: () =>
      request<any>('/pricing/sync', { method: 'POST' }),
    updateControl: (id: string, data: any) =>
      request<any>(`/controls/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    mlForecast: (days?: number) =>
      request<any>(`/ml/forecast${days ? `?days=${days}` : ''}`),
    mlAnomalies: () => request<any>('/ml/anomalies'),
  },

  // ─── Super Admin endpoints ────────────────────────
  admin: {
    hotels: () => request<any>('/hotels'),
    users: (filters?: { role?: string; hotelId?: string }) => {
      const params = new URLSearchParams();
      if (filters?.role) params.set('role', filters.role);
      if (filters?.hotelId) params.set('hotelId', filters.hotelId);
      return request<any>(`/users${params.toString() ? `?${params}` : ''}`);
    },
    globalAnalytics: () => request<any>('/analytics/overview'),
  },

  // ─── Audits ───────────────────────────────────────
  audits: {
    list: () => request<any>('/audits'),
    create: (data: any) =>
      request<any>('/audits', { method: 'POST', body: JSON.stringify(data) }),
    verify: () => request<any>('/audits/verify'),
  },

  // ─── AI ───────────────────────────────────────────
  ai: {
    chat: (messages: any[], provider?: string) =>
      request<any>('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, provider }) }),
  },

  // ─── Billing ──────────────────────────────────────
  billing: {
    getPlans: () => request<any>('/billing/plans'),
    getSubscription: () => request<any>('/billing/subscription'),
    getUsage: () => request<any>('/billing/usage'),
    createCheckout: (plan: string) =>
      request<any>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
    createPortal: () =>
      request<any>('/billing/portal', { method: 'POST' }),
    getInvoices: () => request<any>('/billing/invoices'),
    cancel: () =>
      request<any>('/billing/cancel', { method: 'POST' }),
    resume: () =>
      request<any>('/billing/resume', { method: 'POST' }),
  },
};

export { TokenManager };
