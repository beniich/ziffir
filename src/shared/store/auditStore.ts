import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog } from '../../types';
import { useSecurityStore } from './securityStore';
import { apiFetch } from '../api/client';
interface AuditState {
  audits: AuditLog[];
  fetchAudits: () => Promise<void>;
  logAudit: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'hash'>) => Promise<void>;
  clearAudits: () => void;
  filterByAction: (action: string) => AuditLog[];
  filterByUser: (user: string) => AuditLog[];
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      audits: [],

      fetchAudits: async () => {
        try {
          const data = await apiFetch<AuditLog[]>('/audits');
          set({ audits: data });
        } catch (error) {
          console.error('Failed to fetch audits:', error);
        }
      },

      logAudit: async (entry) => {
        try {
          const newAudit = await apiFetch<AuditLog>('/audits', {
            method: 'POST',
            body: entry,
          });
          set((state) => ({
            audits: [newAudit, ...state.audits].slice(0, 500),
          }));
        } catch (error) {
          console.error('Failed to log audit:', error);
        }
      },

      clearAudits: () => set({ audits: [] }),

      filterByAction: (action) =>
        get().audits.filter((a) => a.action === action),

      filterByUser: (user) =>
        get().audits.filter((a) => a.user === user),
    }),
    { name: 'zaphir-audit-storage' }
  )
);

import { sanitizeText } from './../utils/sanitize';

export function useAddAuditLog() {
  const logAudit = useAuditStore(state => state.logAudit);
  const { userRole, userName } = useSecurityStore();

  return (action: string, details: string, status: string = 'AUTHORIZED', roleOverride?: string) => {
    logAudit({
      user: userName ? sanitizeText(userName) : 'System',
      role: roleOverride || userRole || 'operator',
      action: sanitizeText(action),
      details: sanitizeText(details),
      status: status
    });
  };
}
