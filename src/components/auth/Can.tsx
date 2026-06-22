import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { AppAbility, defineAbilityFor } from '../../lib/ability';

// Context
const AbilityContext = createContext<AppAbility>(undefined!);
export { AbilityContext };

// Provider
export const AbilityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();

  const ability = defineAbilityFor({
    userId: user?.id || '',
    role: user?.role || 'VISITOR',
    hotelId: user?.hotelId,
  });

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

// Hook
export const useAbility = () => useContext(AbilityContext);

// Composant <Can> — implémentation sans createContextualCan
interface CanProps {
  I: string;
  a: string;
  children: ReactNode;
  not?: boolean;
  fallback?: ReactNode;
}

export const Can = ({ I: action, a: subject, children, not = false, fallback = null }: CanProps) => {
  const ability = useAbility();
  if (!ability) return <>{fallback}</>;
  const allowed = ability.can(action as any, subject as any);
  return <>{(not ? !allowed : allowed) ? children : fallback}</>;
};

// Helper hook
export const useCan = (action: string, subject: string) => {
  const ability = useAbility();
  return ability?.can(action as any, subject as any) ?? false;
};
