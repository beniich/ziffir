// src/auth/permissions.ts
// ============================================================================
// Modèle RBAC unifié - Ziffir
// Une seule source de vérité : sessionRole + permissions granulaires
// ============================================================================

export type SessionRole = 'administrateur' | 'client' | 'hotel';

/**
 * Permissions atomiques du système.
 * Convention : `<ressource>.<action>`
 */
export type Permission =
  // Portail & profil
  | 'portal.view'
  | 'profile.view'
  | 'profile.edit'
  // Arrivées / départs
  | 'arrivals.view'
  | 'arrivals.check_in'
  | 'arrivals.check_out'
  // Room service
  | 'room_service.view'
  | 'room_service.create'
  | 'room_service.update'
  // Contrôles & canaux
  | 'controls.view'
  | 'controls.edit'
  | 'channel_sync.view'
  | 'channel_sync.edit'
  // Coffre & accès sensibles
  | 'vault.view'
  | 'vault.edit'
  // Memberships & billing
  | 'memberships.view'
  | 'memberships.invite'
  | 'billing.view'
  | 'billing.manage'
  // Maintenance
  | 'maintenance.view'
  | 'maintenance.create'
  | 'maintenance.resolve'
  // Streaming & ledger
  | 'omni_stream.view'
  | 'ledger.view'
  // Management
  | 'management.view'
  | 'user_directory.view'
  // Hospitality
  | 'hospitality.view'
  | 'hospitality.edit'
  // Cave à vin
  | 'wine_cellar.view'
  | 'wine_cellar.edit'
  // Admin
  | 'settings.view'
  | 'settings.edit'
  | 'design_showcase.view';

// ----------------------------------------------------------------------------
// Matrice de permissions par rôle
// ----------------------------------------------------------------------------
const ROLE_PERMISSIONS: Record<SessionRole, ReadonlySet<Permission>> = {
  administrateur: new Set<Permission>([
    'portal.view', 'profile.view', 'profile.edit',
    'arrivals.view', 'arrivals.check_in', 'arrivals.check_out',
    'room_service.view', 'room_service.create', 'room_service.update',
    'controls.view', 'controls.edit',
    'channel_sync.view', 'channel_sync.edit',
    'vault.view', 'vault.edit',
    'memberships.view', 'memberships.invite',
    'billing.view', 'billing.manage',
    'maintenance.view', 'maintenance.create', 'maintenance.resolve',
    'omni_stream.view',
    'ledger.view',
    'management.view', 'user_directory.view',
    'hospitality.view', 'hospitality.edit',
    'wine_cellar.view', 'wine_cellar.edit',
    'settings.view', 'settings.edit',
    'design_showcase.view',
  ]),

  hotel: new Set<Permission>([
    'portal.view', 'profile.view', 'profile.edit',
    'arrivals.view', 'arrivals.check_in', 'arrivals.check_out',
    'room_service.view', 'room_service.create', 'room_service.update',
    'controls.view', // autorisé lecture seule
    'maintenance.view', 'maintenance.create', 'maintenance.resolve',
    'ledger.view',
    'hospitality.view', 'hospitality.edit',
    'wine_cellar.view', 'wine_cellar.edit',
  ]),

  client: new Set<Permission>([
    'portal.view', 'profile.view', 'profile.edit',
    'room_service.view', 'room_service.create',
    'controls.view',
    'memberships.view', 'memberships.invite',
    'wine_cellar.view',
  ]),
};

// ----------------------------------------------------------------------------
// API publique
// ----------------------------------------------------------------------------
export function hasPermission(
  role: SessionRole | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].has(permission);
}

export function hasAnyPermission(
  role: SessionRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: SessionRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Mapping tab → permission requise.
 * Remplace l'ancienne TAB_CLEARANCE.
 */
export const TAB_PERMISSION: Record<string, Permission> = {
  'prestige-portal': 'portal.view',
  'arrivals': 'arrivals.view',
  'room-service': 'room_service.view',
  'controls': 'controls.view',
  'channel-sync': 'channel_sync.view',
  'vault': 'vault.view',
  'memberships': 'memberships.view',
  'billing': 'billing.view',
  'maintenance': 'maintenance.view',
  'omni-stream': 'omni_stream.view',
  'ledger': 'ledger.view',
  'management': 'management.view',
  'user-directory': 'user_directory.view',
  'hospitality-manager': 'hospitality.view',
  'wine-cellar': 'wine_cellar.view',
  'profile': 'profile.view',
  'settings': 'settings.view',
  'design-showcase': 'design_showcase.view',
};

export function canAccessTab(
  role: SessionRole | null | undefined,
  tab: string
): boolean {
  const perm = TAB_PERMISSION[tab];
  if (!perm) {
    console.warn(`[rbac] Tab inconnu: "${tab}" — refus par défaut`);
    return false;
  }
  return hasPermission(role, perm);
}

export function listAllowedTabs(role: SessionRole | null | undefined): string[] {
  if (!role) return [];
  return Object.entries(TAB_PERMISSION)
    .filter(([, perm]) => hasPermission(role, perm))
    .map(([tab]) => tab);
}
