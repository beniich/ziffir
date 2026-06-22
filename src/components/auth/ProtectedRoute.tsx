import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LockScreen } from '../security/LockScreen';
import { canAccessTab, TabKey } from '../../lib/clearance';
import type { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  tab?: TabKey;
  requiredRoles?: UserRole[];
  requiredMinRole?: UserRole;
}

export const ProtectedRoute = ({ children, tab, requiredRoles, requiredMinRole }: Props) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification par TAB_CLEARANCE (prioritaire si `tab` fourni)
  if (tab && !canAccessTab(tab, user.role as UserRole)) {
    return <LockScreen tab={tab} />;
  }

  // Vérification par rôles explicites
  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    return <LockScreen tab={tab || 'management'} />;
  }

  // Vérification par hiérarchie
  if (requiredMinRole) {
    const ROLE_HIERARCHY = { VISITOR: 0, CLIENT: 1, HOTEL: 2, SUPER_ADMIN: 3 };
    if (ROLE_HIERARCHY[user.role as UserRole] < ROLE_HIERARCHY[requiredMinRole]) {
      return <LockScreen tab={tab || 'management'} />;
    }
  }

  return <>{children}</>;
};
