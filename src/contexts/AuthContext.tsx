import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'CLIENT' | 'HOTEL' | 'ADMIN';
export type HotelRole = 'OWNER' | 'MANAGER' | 'SOMMELIER' | 'CONCIERGE' | 'RECEPTION' | 'HOUSEKEEPING' | 'KITCHEN' | 'STAFF' | 'VIEWER';
export type Plan = 'FREE_TRIAL' | 'FREE' | 'PREMIUM' | 'PLATINIUM' | 'GOLDEN' | 'ENTERPRISE';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'INCOMPLETE';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface HotelContext {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  role: HotelRole;
  permissions: string[];
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
}

export interface AuthState {
  user: User | null;
  activeHotel: HotelContext | null;
  availableHotels: Array<{ id: string; name: string; role: HotelRole }>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  switchHotel: (hotelId: string) => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  hotelName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    activeHotel: null,
    availableHotels: [],
    isAuthenticated: false,
    isLoading: true,
  });
  
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setState(s => ({ ...s, isLoading: false, isAuthenticated: false }));
        return;
      }
      const { data } = await res.json();
      setState({
        user: data.user,
        activeHotel: data.activeHotel,
        availableHotels: data.availableHotels,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      setState(s => ({ ...s, isLoading: false, isAuthenticated: false }));
    }
  }, []);
  
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  const login = useCallback(async (email: string, password: string, totpCode?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, totpCode }),
    });
    const json = await res.json();
    
    if (!res.ok) throw new Error(json.error?.message || 'Erreur');
    if (json.data?.requiresTotp) throw new Error('2FA_REQUIRED');
    
    setState({
      user: json.data.user,
      activeHotel: json.data.activeHotel,
      availableHotels: json.data.availableHotels,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);
  
  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Erreur');
    
    setState({
      user: json.data.user,
      activeHotel: json.data.activeHotel,
      availableHotels: json.data.availableHotels,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);
  
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setState({
      user: null,
      activeHotel: null,
      availableHotels: [],
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);
  
  const switchHotel = useCallback(async (hotelId: string) => {
    const res = await fetch(`/api/auth/team/hotels/${hotelId}/switch`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Erreur');
    
    setState(s => ({
      ...s,
      activeHotel: json.data.activeHotel,
    }));
  }, []);
  
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.activeHotel) return false;
    const perms = state.activeHotel.permissions;
    if (perms.includes('*')) return true;
    if (perms.includes(permission)) return true;
    const [scope] = permission.split('.');
    if (perms.includes(`${scope}.*`)) return true;
    return false;
  }, [state.activeHotel]);
  
  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      switchHotel,
      refresh,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
