import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

// Custom storage utilisant SecureStore (chiffré)
const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.auth.login(email, password);
          await SecureStore.setItemAsync('access_token', data.tokens.accessToken);
          await SecureStore.setItemAsync('refresh_token', data.tokens.refreshToken);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.error || err.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try { await api.auth.logout(); } catch {}
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await api.auth.me();
          set({ user: data });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'zaphir-auth-mobile',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
