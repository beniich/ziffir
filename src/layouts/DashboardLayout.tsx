import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Badge } from '../components/ui/Badge';
import { ROLE_LABELS } from '../types';
import { ConditionalSidebar } from '../components/navigation/ConditionalSidebar';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';

interface Props {
  variant: 'client' | 'hotel' | 'admin';
}

const NAV_BY_VARIANT = {
  client: [
    { to: '/me', label: 'Tableau de bord', icon: '🏠' },
    { to: '/me/orders', label: 'Mes commandes', icon: '🍽️' },
    { to: '/me/invoices', label: 'Mes factures', icon: '💳' },
    { to: '/me/activities', label: 'Activités', icon: '✨' },
    { to: '/me/profile', label: 'Mon Profil', icon: '👤' },
  ],
  hotel: [
    { to: '/hotel', label: 'Tableau de bord', icon: '🏨' },
    { to: '/hotel/room-service', label: 'Room Service', icon: '🍽️' },
    { to: '/hotel/staff', label: 'Personnel', icon: '👥' },
    { to: '/hotel/controls', label: 'Suites', icon: '🎛️' },
    { to: '/hotel/floorplan', label: 'Plan des étages', icon: '🏗️' },
    { to: '/hotel/wine-cellar', label: 'Cave à vins', icon: '🍷' },
    { to: '/hotel/pricing', label: 'Tarification', icon: '💰' },
    { to: '/hotel/vault', label: 'Coffre', icon: '🔐' },
    { to: '/hotel/analytics', label: 'Analytics', icon: '📊' },
    { to: '/hotel/prestige', label: 'Portail Prestige', icon: '👑' },
    { to: '/hotel/settings', label: 'Paramètres', icon: '⚙️' },
    { to: '/hotel/profile', label: 'Profil', icon: '👤' },
  ],
  admin: [
    { to: '/admin', label: 'Vue d\'ensemble', icon: '🌐' },
    { to: '/admin/hotels', label: 'Hôtels', icon: '🏨' },
    { to: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { to: '/admin/user-manager', label: 'Gestion Utilisateurs', icon: '🛡️' },
    { to: '/admin/saas-billing', label: 'Facturation SaaS', icon: '💳' },
    { to: '/admin/analytics', label: 'Analytics globale', icon: '📊' },
    { to: '/admin/design-system', label: 'Design System', icon: '🎨' },
    { to: '/admin/profile', label: 'Profil', icon: '👤' },
  ],
};

const HEADER_CONFIG = {
  client: { title: 'Espace Client', color: 'from-cyan-500 to-blue-500' },
  hotel: { title: 'Espace Hôtel', color: 'from-zaphir-500 to-orange-500' },
  admin: { title: 'Super Admin', color: 'from-red-500 to-purple-500' },
};

export const DashboardLayout = ({ variant }: Props) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = NAV_BY_VARIANT[variant];
  const header = HEADER_CONFIG[variant];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-r border-amber-500/20 z-20">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${header.color} flex items-center justify-center shadow-lg`}>
              <span className="text-xl">⚜</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">{header.title}</h1>
              <p className="text-xs text-slate-400">{user.username}</p>
            </div>
          </Link>
        </div>

        <ConditionalSidebar />

        {/* User card */}
        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zaphir-500 to-zaphir-700 flex items-center justify-center text-obsidian-950 font-bold text-sm flex-shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-100 truncate">{user.username}</div>
                <Badge variant={user.role === 'SUPER_ADMIN' ? 'danger' : user.role === 'HOTEL' ? 'gold' : 'info'}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md flex items-center justify-end px-6 sticky top-0 z-10">
          <RoleSwitcher />
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
