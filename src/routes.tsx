import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AbilityProvider } from './components/auth/Can';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuthStore } from './store/authStore';
import { ROLE_HIERARCHY } from './types';
import { Spinner } from './components/ui/Spinner';

// ════════════════════════════════════════════════════════════
// PAGES PUBLIQUES
// ════════════════════════════════════════════════════════════
const HeroPage     = lazy(() => import('./pages/public/HeroPage'));
const AboutPage    = lazy(() => import('./pages/public/AboutPage'));
const SecurityPage = lazy(() => import('./pages/public/SecurityPage'));
const LoginPage    = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

const ForbiddenPage = lazy(() => import('./pages/errors/ForbiddenPage'));

// ════════════════════════════════════════════════════════════
// PAGES CLIENT
// ════════════════════════════════════════════════════════════
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const MyOrders        = lazy(() => import('./pages/client/MyOrders'));
const MyInvoices      = lazy(() => import('./pages/client/MyInvoices'));
const Activities      = lazy(() => import('./pages/client/Activities'));

// ════════════════════════════════════════════════════════════
// PAGES HOTEL
// ════════════════════════════════════════════════════════════
const HotelDashboard    = lazy(() => import('./pages/hotel/HotelDashboard'));
const HotelRoomService  = lazy(() => import('./pages/hotel/RoomService'));
const HotelStaff        = lazy(() => import('./pages/hotel/Staff'));
const HotelAnalytics    = lazy(() => import('./pages/hotel/Analytics'));
const HotelVault        = lazy(() => import('./pages/hotel/Vault'));
const HotelControls     = lazy(() => import('./pages/hotel/Controls'));
const HotelPricing      = lazy(() => import('./pages/hotel/Pricing'));

// ════════════════════════════════════════════════════════════
// PAGES ADMIN
// ════════════════════════════════════════════════════════════
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminHotels          = lazy(() => import('./pages/admin/Hotels'));
const AdminUsers           = lazy(() => import('./pages/admin/Users'));
const AdminGlobalAnalytics = lazy(() => import('./pages/admin/GlobalAnalytics'));
const AdminBilling         = lazy(() => import('./pages/admin/Billing'));

// ════════════════════════════════════════════════════════════
// NOUVEAUX COMPOSANTS-ONGLETS
// ════════════════════════════════════════════════════════════
const WineCellarTab         = lazy(() => import('./components/WineCellarTab').then(m => ({ default: m.WineCellarTab ?? m.default })));
const PrestigePortalTab     = lazy(() => import('./components/PrestigePortalTab').then(m => ({ default: m.PrestigePortalTab ?? m.default })));
const SaaSBillingTab        = lazy(() => import('./components/SaaSBillingTab').then(m => ({ default: m.SaaSBillingTab ?? m.default })));
const SettingsTab           = lazy(() => import('./components/SettingsTab').then(m => ({ default: m.SettingsTab ?? m.default })));
const ProfileTab            = lazy(() => import('./components/ProfileTab').then(m => ({ default: m.ProfileTab ?? m.default })));
const UserManagerSuite      = lazy(() => import('./components/UserManagerSuite').then(m => ({ default: m.UserManagerSuite ?? m.default })));
const RoomFloorplanController = lazy(() => import('./components/RoomFloorplanController').then(m => ({ default: m.RoomFloorplanController ?? m.default })));
const DesignSystemShowcase  = lazy(() => import('./components/DesignSystemShowcase'));

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner variant="spinner" size="xl" label="Chargement..." />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

/**
 * Composant de redirection intelligent : redirige l'utilisateur
 * connecté vers son dashboard selon son rôle.
 */
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'CLIENT':       return <Navigate to="/me" replace />;
    case 'HOTEL':        return <Navigate to="/hotel" replace />;
    case 'SUPER_ADMIN':  return <Navigate to="/admin" replace />;
    default:             return <Navigate to="/" replace />;
  }
};

// ════════════════════════════════════════════════════════════
// ROUTER
// ════════════════════════════════════════════════════════════

export const router = createBrowserRouter([
  // ═══ PUBLIC ═══
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: withSuspense(HeroPage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'security', element: withSuspense(SecurityPage) },
    ],
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/register',
    element: withSuspense(RegisterPage),
  },
  { path: '/403', element: withSuspense(ForbiddenPage) },

  // ═══ CLIENT (/me/*) ═══
  {
    path: '/me',
    element: (
      <ProtectedRoute requiredRoles={['CLIENT']}>
        <AbilityProvider>
          <DashboardLayout variant="client" />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(ClientDashboard) },
      { path: 'orders', element: <ProtectedRoute tab="room-service">{withSuspense(MyOrders)}</ProtectedRoute> },
      { path: 'invoices', element: <ProtectedRoute tab="ledger">{withSuspense(MyInvoices)}</ProtectedRoute> },
      { path: 'activities', element: withSuspense(Activities) },
      { path: 'profile', element: <ProtectedRoute tab="profile">{withSuspense(ProfileTab)}</ProtectedRoute> },
    ],
  },

  // ═══ HOTEL (/hotel/*) ═══
  {
    path: '/hotel',
    element: (
      <ProtectedRoute requiredRoles={['HOTEL', 'SUPER_ADMIN']}>
        <AbilityProvider>
          <DashboardLayout variant="hotel" />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(HotelDashboard) },
      { path: 'room-service', element: <ProtectedRoute tab="room-service">{withSuspense(HotelRoomService)}</ProtectedRoute> },
      { path: 'staff', element: <ProtectedRoute tab="management">{withSuspense(HotelStaff)}</ProtectedRoute> },
      { path: 'analytics', element: <ProtectedRoute tab="analytics">{withSuspense(HotelAnalytics)}</ProtectedRoute> },
      { path: 'vault', element: <ProtectedRoute tab="vault">{withSuspense(HotelVault)}</ProtectedRoute> },
      { path: 'controls', element: <ProtectedRoute tab="controls">{withSuspense(HotelControls)}</ProtectedRoute> },
      { path: 'pricing', element: withSuspense(HotelPricing) },
      // ── Nouveaux onglets ──
      { path: 'wine-cellar', element: <ProtectedRoute tab="wine-cellar">{withSuspense(WineCellarTab)}</ProtectedRoute> },
      { path: 'floorplan', element: <ProtectedRoute tab="floorplan">{withSuspense(RoomFloorplanController)}</ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute tab="settings">{withSuspense(SettingsTab)}</ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute tab="profile">{withSuspense(ProfileTab)}</ProtectedRoute> },
      { path: 'prestige', element: <ProtectedRoute tab="prestige-portal">{withSuspense(PrestigePortalTab)}</ProtectedRoute> },
    ],
  },

  // ═══ ADMIN (/admin/*) ═══
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
        <AbilityProvider>
          <DashboardLayout variant="admin" />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'hotels', element: <ProtectedRoute tab="hospitality">{withSuspense(AdminHotels)}</ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute tab="management">{withSuspense(AdminUsers)}</ProtectedRoute> },
      { path: 'analytics', element: <ProtectedRoute tab="analytics">{withSuspense(AdminGlobalAnalytics)}</ProtectedRoute> },
      { path: 'billing', element: <ProtectedRoute tab="ledger">{withSuspense(AdminBilling)}</ProtectedRoute> },
      // ── Nouveaux onglets admin ──
      { path: 'user-manager', element: <ProtectedRoute tab="user-manager">{withSuspense(UserManagerSuite)}</ProtectedRoute> },
      { path: 'saas-billing', element: <ProtectedRoute tab="saas-billing">{withSuspense(SaaSBillingTab)}</ProtectedRoute> },
      { path: 'design-system', element: withSuspense(DesignSystemShowcase) },
      { path: 'profile', element: <ProtectedRoute tab="profile">{withSuspense(ProfileTab)}</ProtectedRoute> },
    ],
  },

  // ═══ REDIRECTS ═══
  { path: '/dashboard', element: <RoleBasedRedirect /> },
  { path: '*', element: <RoleBasedRedirect /> },
]);
