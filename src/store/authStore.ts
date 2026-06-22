import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, TokenManager } from '../shared/api/client';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
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

      setUser: (user) => set({ user, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.auth.login(email, password);
          TokenManager.set(data.tokens.accessToken, data.tokens.refreshToken);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
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
          // Auto-login
          return await get().login(data.email, data.password);
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        await api.auth.logout();
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
        set({ user: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: 'zaphir-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selector utilitaire
export const selectCurrentRole = (state: AuthState) => state.user?.role || 'VISITOR';
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
