// src/auth/AuthContext.tsx
// ============================================================================
// Contexte d'authentification - mounting + initialisation
// ============================================================================

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { initAuth, loginWithEmail, logout, registerWithEmail, loginWithGoogle } from '../firebase';
import type { SessionRole } from './permissions';

export interface AuthContextValue {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: SessionRole;
    activeHotelId: string | null;
    plan: string;
  } | null;
  memberships: Array<{ hotelId: string; hotelName: string; role: string }>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [memberships, setMemberships] = useState<AuthContextValue['memberships']>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ──────────────────────────────────────────────────────────────
  // Initialisation : vérif session au mount
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await initAuth();
        if (cancelled) return;
        if (result) {
          setUser(result.user as any);
          setMemberships(result.memberships);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Sync multi-onglets : si un autre onglet logout, on déconnecte ici
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'zafir_auth_token' && !e.newValue) {
        setUser(null);
        setMemberships([]);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const u = await loginWithEmail(email, password);
    setUser(u as any);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const u = await registerWithEmail(email, password, displayName);
      setUser(u as any);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const res = await loginWithGoogle();
    setUser(res.user as any);
    setMemberships(res.memberships || []);
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setMemberships([]);
  }, []);

  const refresh = useCallback(async () => {
    const result = await initAuth();
    if (result) {
      setUser(result.user as any);
      setMemberships(result.memberships);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      memberships,
      isLoading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      refresh,
    }),
    [user, memberships, isLoading, signIn, signUp, signOut, signInWithGoogle, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
