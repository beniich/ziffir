// src/auth/guards.tsx
// ============================================================================
// AuthGuard & RoleGuard - protège le rendu, pas seulement la navigation
// ============================================================================

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Permission } from './permissions';

// ----------------------------------------------------------------------------
// AuthGuard : exige une session valide
// ----------------------------------------------------------------------------
interface AuthGuardProps {
  children: ReactNode;
  /** Où rediriger si pas authentifié (défaut: /login) */
  redirectTo?: string;
  /** Afficher un loader pendant la vérif initiale */
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = '/login',
  fallback = null,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <>{fallback}</>;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}

// ----------------------------------------------------------------------------
// RoleGuard : exige une permission atomique
// ----------------------------------------------------------------------------
interface RoleGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  children: ReactNode;
  /** Comportement si accès refusé */
  onDenied?: 'redirect' | 'hide' | 'forbidden';
  redirectTo?: string;
  fallback?: ReactNode;
}

export function RoleGuard({
  permission,
  anyOf,
  allOf,
  children,
  onDenied = 'redirect',
  redirectTo = '/forbidden',
  fallback = null,
}: RoleGuardProps) {
  const { can, canAny, canAll, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowed =
    (permission ? can(permission) : true) &&
    (anyOf ? canAny(anyOf) : true) &&
    (allOf ? canAll(allOf) : true);

  if (allowed) return <>{children}</>;

  switch (onDenied) {
    case 'hide':
      return <>{fallback}</>;
    case 'forbidden':
      return <ForbiddenScreen />;
    case 'redirect':
    default:
      return <Navigate to={redirectTo} replace />;
  }
}

// ----------------------------------------------------------------------------
// ForbiddenScreen : page 403
// ----------------------------------------------------------------------------
export function ForbiddenScreen() {
  return (
    <div
      role="alert"
      style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-muted, #888)',
      }}
    >
      <h2>🔒 Accès refusé</h2>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// withRoleGuard : HOC pour composants standalone
// ----------------------------------------------------------------------------
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard {...guardProps}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
