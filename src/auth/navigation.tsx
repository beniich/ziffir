// src/auth/navigation.tsx
// ============================================================================
// Sidebar & router qui s'appuient sur le RBAC unifié
// ============================================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { canAccessTab, listAllowedTabs } from './permissions';
import { HotelSwitcher } from '../components/HotelSwitcher';

interface NavItem {
  tab: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}

// ⚠️ Adapter cette liste à vos tabs réels
const NAV_ITEMS: NavItem[] = [
  { tab: 'prestige-portal', label: 'Prestige Portal', path: '/nexus/overview' },
  { tab: 'arrivals', label: 'Arrivées', path: '/flow/inbound' },
  { tab: 'room-service', label: 'Room Service', path: '/concierge/requests' },
  { tab: 'controls', label: 'Contrôles', path: '/systems/override' },
  { tab: 'channel-sync', label: 'Channel Sync', path: '/matrix/sync' },
  { tab: 'vault', label: 'Coffre', path: '/secure-node' },
  { tab: 'memberships', label: 'Memberships', path: '/circle/roster' },
  { tab: 'billing', label: 'Billing', path: '/ops/financial-stream' },
  { tab: 'maintenance', label: 'Maintenance', path: '/ops/infrastructure' },
  { tab: 'omni-stream', label: 'Omni Stream', path: '/matrix/stream' },
  { tab: 'ledger', label: 'Ledger', path: '/ops/ledger-node' },
  { tab: 'management', label: 'Management', path: '/director/board' },
  { tab: 'user-directory', label: 'Annuaire', path: '/director/directory' },
  { tab: 'hospitality-manager', label: 'Hospitality', path: '/guest-ops/hub' },
  { tab: 'wine-cellar', label: 'Cave à vin', path: '/reserve/cellar' },
  { tab: 'profile', label: 'Profil', path: '/identity/profile' },
  { tab: 'settings', label: 'Paramètres', path: '/identity/settings' },
  { tab: 'design-showcase', label: 'Design System', path: '/nexus/design' },
];

export function Sidebar() {
  const { role } = useAuth();

  // On filtre à la source plutôt que de tout rendre et cacher via CSS
  const visibleItems = NAV_ITEMS.filter((item) => canAccessTab(role, item.tab));

  return (
    <nav aria-label="Navigation principale" className="w-64 flex-shrink-0 flex flex-col bg-slate-900 border-r border-white/5 h-full relative z-20">
      <div className="p-4 border-b border-white/5">
        <HotelSwitcher />
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }} className="flex-1 overflow-y-auto">
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
