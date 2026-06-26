// ============================================================
// firebase.ts — Auth Motelix JWT (Remplacement Firebase)
// Firebase SDK conservé uniquement pour Firestore/Sheets config
// ============================================================

// ─── URL de l'API — dynamique en prod via VITE_API_URL ───────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── JWT Auth Motelix (remplace Firebase Auth) ───────────────

export const initAuth = (
  onAuthSuccess?: (user: any, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  const token = localStorage.getItem('zafir_auth_token');
  if (token) {
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        const user = { ...data.user, displayName: data.user.firstName, photoURL: null };
        // Store user ID globally for Stripe
        (window as any).__zaphirUserId = data.user.id;
        localStorage.setItem('zafir_user_id', data.user.id);
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else {
        localStorage.removeItem('zafir_auth_token');
        localStorage.removeItem('zafir_user_id');
        if (onAuthFailure) onAuthFailure();
      }
    })
    .catch(() => {
      localStorage.removeItem('zafir_auth_token');
      localStorage.removeItem('zafir_user_id');
      if (onAuthFailure) onAuthFailure();
    });
  } else {
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<any> => {
  const [firstName, ...lastNames] = displayName.split(' ');
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password, firstName,
      lastName: lastNames.join(' ') || 'User',
      hotelId: 'cm54k8p5k000108l41234abcd',
      role: 'ADMIN'
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  if (data.token) localStorage.setItem('zafir_auth_token', data.token);
  if (data.user?.id) {
    (window as any).__zaphirUserId = data.user.id;
    localStorage.setItem('zafir_user_id', data.user.id);
  }
  return { ...data.user, displayName: data.user?.firstName, photoURL: null };
};

export const loginWithEmail = async (email: string, password: string): Promise<any> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await res.json();
  if (data.token) localStorage.setItem('zafir_auth_token', data.token);
  if (data.user?.id) {
    (window as any).__zaphirUserId = data.user.id;
    localStorage.setItem('zafir_user_id', data.user.id);
  }
  return { ...data.user, displayName: data.user?.firstName, photoURL: null };
};

export const googleSignIn = async (): Promise<any> => {
  throw new Error('Google Sign-In désactivé. Utilisez Email/Mot de passe Motelix.');
};

export const logout = async () => {
  localStorage.removeItem('zafir_auth_token');
  localStorage.removeItem('zafir_user_id');
  delete (window as any).__zaphirUserId;
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  }).catch(() => {});
};

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
