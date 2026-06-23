import { useState } from 'react';
import { ChevronDown, UserCog } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRoleSimulation } from '../../lib/role-simulation';
import { ROLE_LABELS, UserRole } from '../../types';

const ROLES: UserRole[] = ['CLIENT', 'HOTEL', 'SUPER_ADMIN'];

export const RoleSwitcher = () => {
  const { user } = useAuthStore();
  const switchRole = useRoleSimulation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700"
      >
        <UserCog className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-slate-200">{ROLE_LABELS[user.role as UserRole]}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-amber-500/30 shadow-xl z-20 animate-fade-in">
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wide">
                Simuler un rôle (démo)
              </div>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${user.role === role
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-300 hover:bg-slate-800'}
                  `}
                >
                  {ROLE_LABELS[role]}
                  {user.role === role && (
                    <span className="ml-2 text-xs text-amber-400">✓ Actif</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
