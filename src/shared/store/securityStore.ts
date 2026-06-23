import { create } from 'zustand';
import type { UserRole } from '../../types';

interface SecurityState {
  userRole: UserRole;
  userName: string;
  isAuthenticated: boolean;

  fingerprintHash: string | null;
  scanningActive: boolean;
  scanProgress: number;

  overrideActive: boolean;
  overrideBy: string | null;
  overrideReason: string | null;

  authenticate: (name: string, role: UserRole) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;

  startScan: () => void;
  updateScanProgress: (progress: number) => void;
  completeScan: (hash: string) => void;
  resetScan: () => void;

  activateOverride: (by: string, reason: string) => void;
  deactivateOverride: () => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  userRole: 'operator',
  userName: '',
  isAuthenticated: false,
  fingerprintHash: null,
  scanningActive: false,
  scanProgress: 0,
  overrideActive: false,
  overrideBy: null,
  overrideReason: null,

  authenticate: (userName, userRole) =>
    set({ userName, userRole, isAuthenticated: true }),

  logout: () =>
    set({
      isAuthenticated: false,
      overrideActive: false,
      overrideBy: null,
      overrideReason: null,
    }),

  setUserRole: (userRole) => set({ userRole }),
  setUserName: (userName) => set({ userName }),

  startScan: () => set({ scanningActive: true, scanProgress: 0 }),

  updateScanProgress: (scanProgress) => set({ scanProgress }),

  completeScan: (fingerprintHash) =>
    set({ fingerprintHash, scanningActive: false, scanProgress: 100 }),

  resetScan: () => set({ scanningActive: false, scanProgress: 0, fingerprintHash: null }),

  activateOverride: (overrideBy, overrideReason) =>
    set({ overrideActive: true, overrideBy, overrideReason }),

  deactivateOverride: () =>
    set({ overrideActive: false, overrideBy: null, overrideReason: null }),
}));
