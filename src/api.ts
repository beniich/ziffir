// ============================================================
// api.ts — Point central d'accès à toutes les routes backend
// ============================================================

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('zafir_auth_token');
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  // Fallback if token is in localstorage
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Use credentials to send HTTP-Only cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };

  const res = await fetch(`${BASE_URL}${path}`, fetchOptions);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Types retournés par le backend ──────────────────────────

export interface BackendRoomOrder {
  id: string;
  guestName: string;
  roomNo: string;
  details: string;
  status: string;
  price: number;
  createdAt: string;
}

export interface BackendVaultDoc {
  id: string;
  docRef: string;
  name: string;
  category: string;
  owner: string;
  room: string;
  fingerprint: boolean;
  depositDate: string;
  withdrawnAt: string | null;
  securityLevel?: string;
}

export interface BackendSuiteControl {
  id: string;
  roomId: string;
  room?: { number: string; type: string };
  lights: string;
  climate: number;
  curtains: number;
  music: string;
  musicVolume: number;
  doNotDisturb: boolean;
}

export interface BackendStaff {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  department?: string;
  clearanceLevel: number;
  active: boolean;
}

export interface BackendPricingRule {
  id: string;
  suite: string;
  basePrice: number;
  channelMultipliers?: string;
  status: string;
  lastSync?: string;
}

export interface BackendAudit {
  id: string;
  logId: string;
  action: string;
  reason: string;
  status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT';
  previousHash: string;
  hash: string;
  timestamp: string;
  userName?: string;
  userId?: string;
}

export interface BackendAnalyticsOverview {
  period: { days: number; since: string };
  orders: { total: number; completed: number; pending: number };
  revenue: { total: number; average: number };
  occupancy: { occupied: number; total: number; rate: number };
  staff: { active: number };
}

// ─── API Namespace ────────────────────────────────────────────

export const api = {

  // ── 1. Room Orders ───────────────────────────────────────
  roomOrders: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendRoomOrder[] }>('/room-orders'),
    updateStatus: (id: string, status: string) =>
      apiFetch<{ success: boolean; data: BackendRoomOrder }>(
        `/room-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }
      ),
    create: (body: { guestName: string; roomNo: string; details: string; price: number }) =>
      apiFetch<{ success: boolean; data: BackendRoomOrder }>(
        '/room-orders', { method: 'POST', body: JSON.stringify(body) }
      ),
  },

  // ── 2. Suite Controls ────────────────────────────────────
  controls: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendSuiteControl[] }>('/controls'),
    update: (id: string, updates: Partial<BackendSuiteControl>) =>
      apiFetch<{ success: boolean; data: BackendSuiteControl }>(
        `/controls/${id}`, { method: 'PUT', body: JSON.stringify(updates) }
      ),
  },

  // ── 3. Vault ─────────────────────────────────────────────
  vault: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendVaultDoc[] }>('/vault'),
    deposit: (body: { name: string; category: string; owner: string; room: string }) =>
      apiFetch<{ success: boolean; data: BackendVaultDoc }>(
        '/vault', { method: 'POST', body: JSON.stringify(body) }
      ),
    withdraw: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(
        `/vault/${id}/withdraw`, { method: 'PUT', body: JSON.stringify({}) }
      ),
  },

  // ── 4. Staff / Personnel ─────────────────────────────────
  staff: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendStaff[] }>('/staff'),
    create: (body: { name: string; email: string; username: string; password: string; department?: string; clearanceLevel?: number }) =>
      apiFetch<{ success: boolean; data: BackendStaff }>(
        '/staff', { method: 'POST', body: JSON.stringify(body) }
      ),
    update: (id: string, updates: Partial<BackendStaff>) =>
      apiFetch<{ success: boolean; data: BackendStaff }>(
        `/staff/${id}`, { method: 'PUT', body: JSON.stringify(updates) }
      ),
    updateClearance: (id: string, level: number) =>
      apiFetch<{ success: boolean; message: string }>(
        `/staff/${id}/clearance`, { method: 'PUT', body: JSON.stringify({ clearanceLevel: level }) }
      ),
    deactivate: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(
        `/staff/${id}/deactivate`, { method: 'PUT', body: JSON.stringify({}) }
      ),
  },

  // ── 5. Pricing / Channel Sync ────────────────────────────
  pricing: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendPricingRule[] }>('/pricing'),
    update: (id: string, updates: { basePrice?: number; channelMultipliers?: object; status?: string }) =>
      apiFetch<{ success: boolean; data: BackendPricingRule }>(
        `/pricing/${id}`, { method: 'PUT', body: JSON.stringify(updates) }
      ),
    syncAll: () =>
      apiFetch<{ success: boolean; message: string }>(
        '/pricing/sync', { method: 'POST', body: JSON.stringify({}) }
      ),
  },

  // ── 6. Audit Logs ────────────────────────────────────────
  audits: {
    list: (limit = 100) =>
      apiFetch<{ success: boolean; data: BackendAudit[] }>(`/audits?limit=${limit}`),
    create: (body: { action: string; reason: string; status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT' }) =>
      apiFetch<{ success: boolean; data: BackendAudit }>(
        '/audits', { method: 'POST', body: JSON.stringify(body) }
      ),
    verify: () =>
      apiFetch<{ success: boolean; data: { valid: boolean; total: number; brokenAt?: number } }>(
        '/audits/verify'
      ),
  },

  // ── 7. Analytics ─────────────────────────────────────────
  analytics: {
    overview: (days = 7) =>
      apiFetch<{ success: boolean; data: BackendAnalyticsOverview }>(
        `/analytics/overview?days=${days}`
      ),
    revenueByDay: (days = 30) =>
      apiFetch<{ success: boolean; data: { date: string; revenue: number }[] }>(
        `/analytics/revenue?days=${days}`
      ),
  },

  // ── 8. Invoices ──────────────────────────────────────────
  invoices: {
    list: () =>
      apiFetch<{ success: boolean; data: unknown[] }>('/invoices'),
    getByOrderId: (orderId: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/invoices?orderId=${orderId}`),
  },

  // ── 9. Notifications ─────────────────────────────────────
  notifications: {
    list: () =>
      apiFetch<{ success: boolean; data: unknown[] }>('/notifications'),
    markRead: (id: string) =>
      apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT', body: JSON.stringify({}) }),
  },

  // ── 10. AI / ML ──────────────────────────────────────────
  ai: {
    recommend: (prompt: string) =>
      apiFetch<{ success: boolean; data: { recommendation: string } }>(
        '/ai/recommend', { method: 'POST', body: JSON.stringify({ prompt }) }
      ),
    wineSuggestion: (profile: { guest?: string; dish?: string; occasion?: string }) =>
      apiFetch<{ success: boolean; data: { suggestion: string; wine: string } }>(
        '/ai/wine', { method: 'POST', body: JSON.stringify(profile) }
      ),
  },

  // ── 11. Team / Multi-Hotel ───────────────────────────────
  team: {
    listMembers: () =>
      apiFetch<{ id: string; hotelRole: string; department: string; position: string; lastActiveAt: string; user: { id: string; firstName: string; lastName: string; email: string } }[]>('/team/members'),
    updateMember: (id: string, updates: { hotelRole?: string; department?: string; position?: string }) =>
      apiFetch<unknown>(`/team/members/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    removeMember: (id: string) =>
      apiFetch<unknown>(`/team/members/${id}`, { method: 'DELETE' }),
    listInvitations: () =>
      apiFetch<{ id: string; email: string; proposedRole: string; status: string; expiresAt: string; invitedBy: { firstName: string; lastName: string } }[]>('/team/invitations'),
    createInvitation: (body: { email: string; proposedRole: string; department?: string; position?: string; personalMessage?: string }) =>
      apiFetch<unknown>('/team/invitations', { method: 'POST', body: JSON.stringify(body) }),
    revokeInvitation: (id: string) =>
      apiFetch<unknown>(`/team/invitations/${id}`, { method: 'DELETE' }),
    listSessions: () =>
      apiFetch<{ id: string; deviceName: string; location: string; ipAddress: string; lastUsedAt: string }[]>('/team/sessions'),
    revokeSession: (id: string) =>
      apiFetch<unknown>(`/team/sessions/${id}`, { method: 'DELETE' }),
    revokeAllSessions: () =>
      apiFetch<unknown>('/team/sessions', { method: 'DELETE' }),
    listAccessibleHotels: () =>
      apiFetch<{ hotelId: string; hotelRole: string; hotel: { id: string; name: string; slug: string; logoUrl?: string } }[]>('/team/hotels'),
    switchHotel: (hotelId: string) =>
      apiFetch<{ activeHotel: { id: string; name: string; slug: string; role: string } }>(`/team/hotels/${hotelId}/switch`, { method: 'POST' }),
  },

  // ── 12. Billing / Stripe ─────────────────────────────────
  billing: {
    createCheckout: (priceId: string) =>
      apiFetch<{ url: string }>('/billing/create-checkout', { method: 'POST', body: JSON.stringify({ priceId }) }),
    createPortal: () =>
      apiFetch<{ url: string }>('/billing/create-portal', { method: 'POST', body: JSON.stringify({}) }),
    verifySession: (sessionId: string) =>
      apiFetch<{ success: boolean; plan: string; status: string }>(`/billing/verify-session?session_id=${sessionId}`),
    getSubscription: () =>
      apiFetch<{ plan: string; status: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null>('/billing/subscription'),
  },

};


// ─── Helper : appel API avec fallback sur mock ────────────────

export async function fetchWithFallback<T>(
  apiFn: () => Promise<{ success: boolean; data: T }>,
  mockData: T,
  onSuccess?: (data: T) => void
): Promise<T> {
  try {
    const res = await apiFn();
    if (res.success && res.data) {
      if (onSuccess) onSuccess(res.data);
      return res.data;
    }
    return mockData;
  } catch (err) {
    console.warn('[Zafir API] Fallback sur données locales :', err);
    return mockData;
  }
}
