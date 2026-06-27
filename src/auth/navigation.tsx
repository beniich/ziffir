// src/auth/navigation.tsx
// ============================================================================
// Sidebar & router qui s'appuient sur le RBAC unifié
// ============================================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { canAccessTab, listAllowedTabs } from './permissions';

interface NavItem {
  tab: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}

// ⚠️ Adapter cette liste à vos tabs réels
const NAV_ITEMS: NavItem[] = [
  { tab: 'prestige-portal', label: 'Prestige Portal', path: '/portal' },
  { tab: 'arrivals', label: 'Arrivées', path: '/arrivals' },
  { tab: 'room-service', label: 'Room Service', path: '/room-service' },
  { tab: 'controls', label: 'Contrôles', path: '/controls' },
  { tab: 'channel-sync', label: 'Channel Sync', path: '/channel-sync' },
  { tab: 'vault', label: 'Coffre', path: '/vault' },
  { tab: 'memberships', label: 'Memberships', path: '/memberships' },
  { tab: 'billing', label: 'Billing', path: '/billing' },
  { tab: 'maintenance', label: 'Maintenance', path: '/maintenance' },
  { tab: 'omni-stream', label: 'Omni Stream', path: '/omni-stream' },
  { tab: 'ledger', label: 'Ledger', path: '/ledger' },
  { tab: 'management', label: 'Management', path: '/management' },
  { tab: 'user-directory', label: 'Annuaire', path: '/users' },
  { tab: 'hospitality-manager', label: 'Hospitality', path: '/hospitality' },
  { tab: 'wine-cellar', label: 'Cave à vin', path: '/wine-cellar' },
  { tab: 'profile', label: 'Profil', path: '/profile' },
  { tab: 'settings', label: 'Paramètres', path: '/settings' },
  { tab: 'design-showcase', label: 'Design System', path: '/design' },
];

export function Sidebar() {
  const { role } = useAuth();

  // On filtre à la source plutôt que de tout rendre et cacher via CSS
  const visibleItems = NAV_ITEMS.filter((item) => canAccessTab(role, item.tab));

  return (
    <nav aria-label="Navigation principale">
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleItems.map((item) => (
          <li key={item.tab}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.5rem 1rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                color: isActive ? 'var(--color-primary)' : 'inherit',
              })}
            >
              {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Hook de navigation sécurisée.
 * Remplace navigateToTab() : bloque la navigation ET affiche une notif.
 */
export function useSecureNavigate() {
  const { role, canTab } = useAuth();
  const navigate = useNavigate();

  return (tab: string, path: string) => {
    if (!canTab(tab)) {
      console.warn(`[nav] Refus: rôle "${role}" sans permission pour "${tab}"`);
      // Optionnel : déclencher un toast
      return false;
    }
    navigate(path);
    return true;
  };
}

// Export pour debug / tests
export { listAllowedTabs };
