import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, TokenManager } from '../shared/api/client';
import type { User, UserRole } from '../types';
import { googleSignIn, logout as firebaseLogout } from '../firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authProvider: 'email' | 'google' | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { email: string; username: string; password: string; role?: UserRole }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  hasHigherRole: (role: UserRole) => boolean;
  setUser: (user: User) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authProvider: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      // ── Connexion email / password (backend JWT classique) ──
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.auth.login(email, password);
          TokenManager.set(data.tokens.accessToken, data.tokens.refreshToken);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: 'email',
          });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      // ── Connexion Google via Firebase → idToken → backend /auth/firebase-verify ──
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await googleSignIn();
          if (!result) throw new Error('Connexion Google annulée.');

          const idToken = await result.user.getIdToken();

          // Échange l'idToken Firebase contre un JWT métier (avec rôle RBAC)
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/firebase-verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            }
          );

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Vérification Firebase échouée');
          }

          const { data } = await res.json();
          TokenManager.set(data.tokens.accessToken, data.tokens.refreshToken);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: 'google',
          });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.auth.register(data);
          return await get().login(data.email, data.password);
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { authProvider } = get();
        if (authProvider === 'google') {
          await firebaseLogout();
        } else {
          await api.auth.logout();
        }
        get().reset();
      },

      refreshUser: async () => {
        try {
          const { data } = await api.auth.me();
          set({ user: data });
        } catch {
          get().reset();
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      hasHigherRole: (role) => {
        const { user } = get();
        if (!user) return false;
        const ROLE_HIERARCHY = { VISITOR: 0, CLIENT: 1, HOTEL: 2, SUPER_ADMIN: 3 };
        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
      },

      reset: () => {
        TokenManager.clear();
        set({ user: null, isAuthenticated: false, error: null, authProvider: null });
      },
    }),
    {
      name: 'zaphir-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
      }),
    },
  ),
);

// Selectors utilitaires
export const selectCurrentRole = (state: AuthState) => state.user?.role || 'VISITOR';
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
