// ============================================================
// firebase.ts — Auth Ziffir JWT
// Firebase SDK conservé uniquement pour Firestore/Sheets config
// ============================================================

const API_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/auth`
  : 'http://localhost:5000/api/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'zafir_auth_token',
  REFRESH_TOKEN: 'zafir_refresh_token',
  USER_ID: 'zafir_user_id',
} as const;

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  role: 'administrateur' | 'client' | 'hotel';
  activeHotelId: string | null;
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

export interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  memberships?: Array<{
    hotelId: string;
    hotelName: string;
    role: string;
  }>;
}

interface ApiError {
  message: string;
  code?: string;
}

function mapBackendRole(role: string): 'administrateur' | 'client' | 'hotel' {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'administrateur') return 'administrateur';
  if (role === 'MANAGER' || role === 'STAFF' || role === 'hotel') return 'hotel';
  return 'client';
}

function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function persistSession(data: AuthResponse): void {
  const access = data.tokens?.accessToken;
  const refresh = data.tokens?.refreshToken;

  if (!access) {
    throw new Error("Réponse d'authentification invalide : accessToken manquant");
  }

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  if (refresh) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  }
  localStorage.setItem(STORAGE_KEYS.USER_ID, data.user.id);
  (window as any).__zaphirUserId = data.user.id;
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  delete (window as any).__zaphirUserId;
}

async function authedFetch(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return authedFetch(path, init, false);
    }
  }
  return res;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.tokens?.accessToken) return false;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.accessToken);
      if (data.tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// SaaS self-registration: creates hotel + admin user in one step
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const [firstName, ...lastNames] = displayName.split(' ');
  const res = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName: lastNames.join(' ') || 'User',
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.message || "Échec de l'inscription");
  }

  const data = (await res.json()) as AuthResponse;
  if (data.user) data.user.role = mapBackendRole(data.user.role as string);
  persistSession(data);
  return data.user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.message || 'Échec de la connexion');
  }

  const data = (await res.json()) as AuthResponse;
  if (data.user) data.user.role = mapBackendRole(data.user.role as string);
  persistSession(data);
  return data.user;
}

export async function logout(): Promise<void> {
  const token = getAccessToken();

  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // Ignorer l'erreur réseau potentielle
    }
  }

  clearSession();
}

export interface InitAuthResult {
  user: AuthUser | null;
  memberships: Array<{ hotelId: string; hotelName: string; role: string }>;
}

export async function initAuth(): Promise<InitAuthResult | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const res = await authedFetch('/me', { method: 'GET' }, true);
    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
        return null;
      }
      throw new Error('Erreur de vérification de session');
    }

    const data = await res.json();
    if (data.user) data.user.role = mapBackendRole(data.user.role);
    return {
      user: data.user as AuthUser,
      memberships: data.memberships || [],
    };
  } catch (e) {
    console.error('[auth] initAuth failed', e);
    clearSession();
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

export { authedFetch as authFetch };

// ─── Firestore (uniquement pour Google Sheets config) ───────

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, addDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(err: unknown, operation: OperationType, path: string): void {
  console.error(`[Firestore] ${operation.toUpperCase()} on '${path}' failed:`, err);
}

export const firestoreService = {
  async saveConfig(config: { sheetId: string; sheetName: string; liveSync: boolean }) {
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        ...config,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore saveConfig error:', err);
    }
  },

  async getConfig(): Promise<{ sheetId: string; sheetName: string; liveSync: boolean } | null> {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const configItem = snap.docs.find(d => d.id === 'config');
      return configItem ? (configItem.data() as any) : null;
    } catch (err) {
      console.warn('Firestore getConfig error:', err);
      return null;
    }
  },

  async saveDemoRequest(data: {
    name: string;
    email: string;
    hotel: string;
    plan: string;
    notes: string;
  }) {
    try {
      await addDoc(collection(db, 'demoRequests'), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore saveDemoRequest error:', err);
      throw err;
    }
  }
};

import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function loginWithGoogle(): Promise<AuthResponse> {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  
  const res = await fetch(`${API_URL}/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la connexion Google');
  }
  
  const data = await res.json();
  persistSession(data);
  return data;
}
