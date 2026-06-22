import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

/**
 * Permet de switcher de "session simulée" depuis le header.
 * Utilisé pour la démo Elena Petrova multi-rôles.
 */
export function setupRoleSimulation() {
  if (typeof window === 'undefined') return;

  window.addEventListener('simulateRole', (event: any) => {
    const role = event.detail as UserRole;
    const { user, setUser } = useAuthStore.getState();
    if (user) {
      setUser({ ...user, role });
      // Log d'audit côté frontend
      console.info(`[RBAC] Role switched to ${role}`);
    }
  });
}

// Helper hook React
export function useRoleSimulation() {
  return (role: UserRole) => {
    window.dispatchEvent(new CustomEvent('simulateRole', { detail: role }));
  };
}
