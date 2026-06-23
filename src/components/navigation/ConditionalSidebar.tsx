import { NavLink, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getAccessibleTabs, TAB_CLEARANCE, TabKey } from '../../lib/clearance';
import { ROLE_LABELS, UserRole } from '../../types';

export const ConditionalSidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const role = user.role as UserRole;
  const accessibleTabs = getAccessibleTabs(role);

  return (
    <nav className="px-4 space-y-1">
      {accessibleTabs.map((tabKey) => {
        const tab = TAB_CLEARANCE[tabKey];
        const isActive = location.pathname.startsWith(tab.path);

        return (
          <NavLink
            key={tabKey}
            to={tab.path}
            className={({ isActive: navActive }) => `
              flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all
              ${(isActive || navActive)
                ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                : 'text-slate-300 hover:bg-slate-800/50'
              }
            `}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium text-sm">{tab.label}</span>
            </span>
          </NavLink>
        );
      })}

      {/* Indicateur sections verrouillées */}
      <LockedTabsIndicator accessibleTabs={accessibleTabs} />
    </nav>
  );
};

/**
 * Affiche les onglets NON accessibles (verrouillés)
 * pour transparence utilisateur.
 */
const LockedTabsIndicator = ({ accessibleTabs }: { accessibleTabs: TabKey[] }) => {
  const { user } = useAuthStore();
  if (!user) return null;

  const lockedTabs = (Object.keys(TAB_CLEARANCE) as TabKey[])
    .filter((tab) => !accessibleTabs.includes(tab));

  if (lockedTabs.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <div className="flex items-center gap-2 px-4 mb-2 text-xs text-slate-500 uppercase tracking-wide">
        <Lock className="w-3 h-3" />
        Sections verrouillées
      </div>
      {lockedTabs.map((tabKey) => (
        <div
          key={tabKey}
          className="flex items-center gap-3 px-4 py-2 text-slate-500 text-sm cursor-not-allowed"
          title={`Réservé aux rôles ${TAB_CLEARANCE[tabKey].allowedRoles.map((r) => ROLE_LABELS[r]).join(', ')}`}
        >
          <Lock className="w-3 h-3" />
          <span className="opacity-50">{TAB_CLEARANCE[tabKey].label}</span>
        </div>
      ))}
    </div>
  );
};
