import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredMinRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  VISITOR: 0,
  CLIENT: 1,
  HOTEL: 2,
  SUPER_ADMIN: 3,
};

export const ProtectedRoute = ({ children, requiredRoles, requiredMinRole }: Props) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification par rôles explicites
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <ForbiddenView requiredRoles={requiredRoles} currentRole={user.role} />;
  }

  // Vérification par hiérarchie
  if (requiredMinRole && ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[requiredMinRole]) {
    return <ForbiddenView requiredRoles={[requiredMinRole]} currentRole={user.role} />;
  }

  return <>{children}</>;
};

const ForbiddenView = ({ requiredRoles, currentRole }: { requiredRoles: UserRole[]; currentRole: UserRole }) => {
  const required = requiredRoles.join(' ou ');
  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-mesh-gradient">
      <div className="max-w-md text-center glass-strong rounded-2xl p-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Accès refusé</h2>
        <p className="text-slate-400">
          Cette section nécessite le rôle :{' '}
          <strong className="text-zaphir-400">{required}</strong>
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Votre rôle actuel : <strong>{currentRole}</strong>
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Button onClick={() => window.history.back()} variant="ghost">Retour</Button>
          <Button onClick={() => window.location.href = '/login'} variant="primary">
            <LogIn className="w-4 h-4 mr-2" />
            Changer de compte
          </Button>
        </div>
      </div>
    </div>
  );
};
