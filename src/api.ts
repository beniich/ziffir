// ============================================================
// api.ts — Point central d'accès à toutes les routes backend
// ============================================================

import { authFetch, getCurrentUserId } from './firebase';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string; code?: string };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await authFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
      'X-User-Id': getCurrentUserId() || '',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err?.error?.message || err?.error || err?.message || `HTTP ${res.status}`;
    throw new Error(message);
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
  securityLevel: string;
  encrypted: boolean;
  depositDate: string;
  withdrawnAt: string | null;
  fingerprint: boolean;
  hash: string;
}

export interface BackendSuiteControl {
  id: string;
  roomId: string;
  room?: { id: string; number: string; floor: number };
  lights: string;
  climate: number;
  curtains: number;
  music: string;
  musicVolume: number;
  doNotDisturb: boolean;
}

export interface BackendMenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  priceCents: number;
  photo?: string;
  isActive: boolean;
  isFeatured: boolean;
  allergens?: string[];
  prepTimeMinutes?: number;
}

export interface BackendRestaurantOrder {
  id: string;
  reference: string;
  type: string;
  status: string;
  tableNumber?: string;
  roomId?: string;
  room?: { number: string };
  guestId?: string;
  guest?: { firstName: string; lastName: string };
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  specialInstructions?: string;
  items: {
    id: string;
    menuItemId: string;
    name: string;
    priceCents: number;
    quantity: number;
    totalCents: number;
    notes?: string;
    menuItem?: { name: string; category: string; photo?: string };
  }[];
  createdAt: string;
  updatedAt: string;
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

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
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

export interface BackendReservation {
  id: string;
  reference: string;
  status: string;
  guestId: string;
  guest?: { firstName: string; lastName: string; email: string; phone?: string };
  roomId?: string;
  room?: { number: string; floor: number };
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  totalAmountCents: number;
  notes?: string;
  flightNumber?: string;
  estimatedArrival?: string;
  transferStatus?: string;
  createdAt: string;
}

// ─── API Namespace ────────────────────────────────────────────

export const api = {

  // ── 1. Room Orders (legacy) ──────────────────────────────
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

  // 🌟 2. Suite Controls (environmental) 🌟
  controls: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendSuiteControl[] }>('/controls'),
    update: (id: string, updates: Partial<BackendSuiteControl>) =>
      apiFetch<{ success: boolean; data: BackendSuiteControl }>(
        `/controls/${id}`, { method: 'PUT', body: JSON.stringify(updates) }
      ),
  },

  // 🌟 Ledger (Academic) 🌟
  ledger: {
    export: (studentId: string, studentName: string, gpa: string, credits: string) => {
      const url = new URL(`${BASE_URL}/ledger/export`);
      url.searchParams.append('studentId', studentId);
      url.searchParams.append('studentName', studentName);
      url.searchParams.append('gpa', gpa);
      url.searchParams.append('credits', credits);
      
      const token = localStorage.getItem('zafir_auth_token');
      return fetch(url.toString(), {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
    }
  },
  // 🌟 Guests & Memberships 🌟
  guests: {
    listMembership: () =>
      apiFetch<{ success: boolean; data: { items: any[] } }>('/guests/membership'),
  },

  // ── 3. Secure Vault ──────────────────────────────────────
  vault: {
    list: () =>
      apiFetch<{ success: boolean; data: BackendVaultDoc[] }>('/vault'),
    deposit: (body: { name: string; category: string; securityLevel?: string }) =>
      apiFetch<{ success: boolean; data: BackendVaultDoc }>(
        '/vault', { method: 'POST', body: JSON.stringify(body) }
      ),
    decrypt: (id: string) =>
      apiFetch<{ success: boolean; data: BackendVaultDoc & { decryptedAt: string; auditHash: string } }>(
        `/vault/decrypt/${id}`, { method: 'POST', body: JSON.stringify({}) }
      ),
  },

  // ── 4. Restaurant & Room Service ─────────────────────────
  restaurant: {
    // Menu items
    listMenu: (params?: { category?: string; featured?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.featured) qs.set('isFeatured', 'true');
      return apiFetch<{ success: boolean; data: { items: BackendMenuItem[]; pagination: any } }>(
        `/restaurant/menu?${qs}`
      );
    },
    // Orders
    listOrders: (params?: { status?: string; type?: string; date?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.type) qs.set('type', params.type);
      if (params?.date) qs.set('date', params.date);
      return apiFetch<{ success: boolean; data: { items: BackendRestaurantOrder[]; pagination: any } }>(
        `/restaurant/orders?${qs}`
      );
    },
    createOrder: (body: {
      type: string;
      roomId?: string;
      tableNumber?: string;
      guestId?: string;
      items: { menuItemId: string; quantity: number; notes?: string }[];
      specialInstructions?: string;
    }) =>
      apiFetch<{ success: boolean; data: BackendRestaurantOrder }>(
        '/restaurant/orders', { method: 'POST', body: JSON.stringify(body) }
      ),
    updateOrderStatus: (id: string, status: string, servedById?: string) =>
      apiFetch<{ success: boolean; data: BackendRestaurantOrder }>(
        `/restaurant/orders/${id}/status`,
        { method: 'PATCH', body: JSON.stringify({ status, servedById }) }
      ),
  },

  // ── 5. Reservations / Arrivals VIP ──────────────────────
  reservations: {
    list: (params?: { date?: string; status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.date) qs.set('date', params.date);
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch<{ success: boolean; data: { items: BackendReservation[]; pagination: any } }>(
        `/reservations?${qs}`
      );
    },
    todayArrivals: () => {
      const today = new Date().toISOString().split('T')[0];
      return apiFetch<{ success: boolean; data: { items: BackendReservation[]; pagination: any } }>(
        `/reservations?status=CONFIRMED&checkIn=${today}&pageSize=50`
      );
    },
    getById: (id: string) =>
      apiFetch<{ success: boolean; data: BackendReservation }>(`/reservations/${id}`),
    checkIn: (id: string) =>
      apiFetch<{ success: boolean; data: BackendReservation }>(
        `/reservations/${id}/check-in`, { method: 'POST', body: JSON.stringify({}) }
      ),
  },

  // ── 6. Users / Staff Management ─────────────────────────
  users: {
    list: () =>
      apiFetch<BackendUser[]>('/users'),
    getById: (id: string) =>
      apiFetch<BackendUser>(`/users/${id}`),
    create: (body: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
      apiFetch<BackendUser>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, updates: { firstName?: string; lastName?: string; role?: string; isActive?: boolean }) =>
      apiFetch<BackendUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    resetPassword: (id: string, newPassword: string) =>
      apiFetch<{ message: string }>(`/users/${id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      }),
    deactivate: (id: string) =>
      apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
  },

  // ── 7. Audit Logs ────────────────────────────────────────
  audits: {
    list: (limit = 100) =>
      apiFetch<{ success: boolean; data: BackendAudit[] }>(`/audit?limit=${limit}`),
    create: (body: { action: string; reason: string; status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT' }) =>
      apiFetch<{ success: boolean; data: BackendAudit }>(
        '/audit', { method: 'POST', body: JSON.stringify(body) }
      ),
    verify: () =>
      apiFetch<{ success: boolean; data: { valid: boolean; total: number; brokenAt?: number } }>(
        '/audit/verify'
      ),
  },

  // ── 8. Analytics ─────────────────────────────────────────
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

  // ── 9. Subscription / Stripe ─────────────────────────────
  subscription: {
    createCheckout: (planId: string, interval: 'monthly' | 'yearly' = 'monthly') =>
      apiFetch<{ status: string; data: { url: string; isMock?: boolean } }>(
        '/subscription/checkout', { method: 'POST', body: JSON.stringify({ planId, interval }) }
      ),
  },

  // ── 10. Pricing / Channel Sync ───────────────────────────
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

  // ── 11. Team (invitations, sessions) ─────────────────────
  team: {
    listMembers: () =>
      apiFetch<{ id: string; hotelRole: string; department: string; position: string; lastActiveAt: string; user: { id: string; firstName: string; lastName: string; email: string } }[]>('/team/members'),
    listInvitations: () =>
      apiFetch<{ id: string; email: string; proposedRole: string; status: string; expiresAt: string; invitedBy: { firstName: string; lastName: string } }[]>('/team/invitations'),
    createInvitation: (body: { email: string; proposedRole: string; department?: string; position?: string }) =>
      apiFetch<unknown>('/team/invitations', { method: 'POST', body: JSON.stringify(body) }),
    revokeInvitation: (id: string) =>
      apiFetch<unknown>(`/team/invitations/${id}`, { method: 'DELETE' }),
    listSessions: () =>
      apiFetch<{ id: string; deviceName: string; location: string; ipAddress: string; lastUsedAt: string }[]>('/team/sessions'),
    revokeSession: (id: string) =>
      apiFetch<unknown>(`/team/sessions/${id}`, { method: 'DELETE' }),
    revokeAllSessions: () =>
      apiFetch<unknown>('/team/sessions', { method: 'DELETE' }),
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
