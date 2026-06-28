import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

export function useTenant() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useTenant must be used inside AuthProvider');

  const { user, memberships, refresh } = ctx;

  const currentMembership = memberships.find((m) => m.hotelId === user?.activeHotelId);

  return {
    hotelId: user?.activeHotelId ?? null,
    plan: user?.plan ?? 'FREE_TRIAL',
    memberships,
    currentRole: currentMembership?.role ?? null,
    
    hasPlan: (requiredPlan: string) => {
      const plans = ['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
      const userPlanIdx = plans.indexOf(user?.plan ?? 'TRIAL');
      const reqPlanIdx = plans.indexOf(requiredPlan);
      return userPlanIdx >= reqPlanIdx;
    },

    switchHotel: async (hotelId: string) => {
      // Pour changer d'hôtel, on ferait un appel API puis on rafraîchirait la session
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/switch-hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zafir_auth_token')}`,
        },
        body: JSON.stringify({ hotelId }),
      });
      if (res.ok) {
        await refresh();
      }
    }
  };
}
