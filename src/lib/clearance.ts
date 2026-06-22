import type { UserRole } from '../types';

/**
 * Matrice d'autorisation centrale.
 * Définit pour chaque onglet :
 * - Les rôles autorisés à le voir
 * - Les rôles autorisés à agir (write)
 */
export type TabKey =
  | 'arrivals'
  | 'room-service'
  | 'controls'
  | 'channel-sync'
  | 'vault'
  | 'memberships'
  | 'maintenance'
  | 'omni-stream'
  | 'ledger'
  | 'management'
  | 'hospitality'
  | 'pos'
  | 'analytics';

export const TAB_CLEARANCE: Record<TabKey, {
  label: string;
  icon: string;
  path: string;
  allowedRoles: UserRole[];
  canWrite: UserRole[];
  readOnlyFor: UserRole[];
  description: string;
}> = {
  // ─── Espaces Publics / Client ───────────────────────
  'arrivals': {
    label: 'Arrivées',
    icon: '✈',
    path: '/arrivals',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: [],
    description: 'Gestion des arrivées et départs',
  },
  'room-service': {
    label: 'Room Service',
    icon: '🍽',
    path: '/room-service',
    allowedRoles: ['CLIENT', 'HOTEL', 'SUPER_ADMIN'],
    canWrite: ['CLIENT', 'HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: [],
    description: 'Commandes en chambre',
  },
  'controls': {
    label: 'Contrôles Suites',
    icon: '🎛',
    path: '/controls',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: [],
    description: 'Climatisation, lumières, rideaux',
  },

  // ─── Espaces Réservés Hôtel/Admin ────────────────────
  'channel-sync': {
    label: 'Synchro Canaux',
    icon: '🌐',
    path: '/channel-sync',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Synchronisation des canaux de distribution',
  },
  'vault': {
    label: 'Coffre Sécurisé',
    icon: '🔐',
    path: '/vault',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Documents et valeurs sous protection',
  },
  'memberships': {
    label: 'Club VIP',
    icon: '👑',
    path: '/memberships',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Gestion des membres Elite',
  },
  'maintenance': {
    label: 'Maintenance 3D',
    icon: '🔧',
    path: '/maintenance',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Suivi des interventions techniques',
  },
  'omni-stream': {
    label: 'Omni Stream',
    icon: '📡',
    path: '/omni-stream',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Communications centralisées',
  },
  'ledger': {
    label: 'Grand Livre',
    icon: '📚',
    path: '/ledger',
    allowedRoles: ['CLIENT', 'HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'], // Client voit seulement SES factures
    description: 'Comptabilité et facturation',
  },

  // ─── Réservé SUPER_ADMIN ─────────────────────────────
  'management': {
    label: 'Supervision',
    icon: '👥',
    path: '/management',
    allowedRoles: ['SUPER_ADMIN'],
    canWrite: ['SUPER_ADMIN'],
    readOnlyFor: ['CLIENT', 'HOTEL'],
    description: 'Gestion du personnel et des habilitations',
  },
  'hospitality': {
    label: 'Hôtellerie',
    icon: '🏨',
    path: '/hospitality',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: [],
    description: 'Opérations hôtelières complètes',
  },
  'pos': {
    label: 'Caisse',
    icon: '💳',
    path: '/pos',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: [],
    description: 'Point de vente tactile',
  },
  'analytics': {
    label: 'Analytics',
    icon: '📊',
    path: '/analytics',
    allowedRoles: ['HOTEL', 'SUPER_ADMIN'],
    canWrite: ['HOTEL', 'SUPER_ADMIN'],
    readOnlyFor: ['CLIENT'],
    description: 'Tableaux de bord et KPIs',
  },
};

// ─── Helpers de consultation ─────────────────────────────

export function canAccessTab(tab: TabKey, role: UserRole): boolean {
  return TAB_CLEARANCE[tab].allowedRoles.includes(role);
}

export function canWriteTab(tab: TabKey, role: UserRole): boolean {
  return TAB_CLEARANCE[tab].canWrite.includes(role);
}

export function isReadOnlyForRole(tab: TabKey, role: UserRole): boolean {
  return TAB_CLEARANCE[tab].readOnlyFor.includes(role);
}

export function getAccessibleTabs(role: UserRole): TabKey[] {
  return (Object.keys(TAB_CLEARANCE) as TabKey[]).filter((tab) =>
    canAccessTab(tab, role)
  );
}
