// src/auth/useAuth.ts
// ============================================================================
// Hook d'authentification - source unique de vérité pour le frontend
// ============================================================================

import { useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessTab,
  type Permission,
  type SessionRole,
} from './permissions';

export interface AuthState {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: SessionRole;
    activeHotelId: string | null;
    plan: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState & {
  role: SessionRole | null;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canTab: (tab: string) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
} {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }

  const { user, isLoading, signIn, signUp, signOut } = ctx;

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      role: user?.role ?? null,
      can: (permission: Permission) => hasPermission(user?.role, permission),
      canAny: (permissions: Permission[]) =>
        hasAnyPermission(user?.role, permissions),
      canAll: (permissions: Permission[]) =>
        hasAllPermissions(user?.role, permissions),
      canTab: (tab: string) => canAccessTab(user?.role, tab),
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
  );
}
