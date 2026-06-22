import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AbilityProvider } from './components/auth/Can';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuthStore } from './store/authStore';
import { ROLE_HIERARCHY } from './types';
import { Spinner } from './components/ui/Spinner';
import { ToastContainer } from './components/ui/Toast';

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
    element: (
      <>
        {withSuspense(LoginPage)}
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/register',
    element: (
      <>
        {withSuspense(RegisterPage)}
        <ToastContainer />
      </>
    ),
  },
  { path: '/403', element: withSuspense(ForbiddenPage) },

  // ═══ CLIENT (/me/*) ═══
  {
    path: '/me',
    element: (
      <ProtectedRoute requiredRoles={['CLIENT']}>
        <AbilityProvider>
          <DashboardLayout variant="client" />
          <ToastContainer />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(ClientDashboard) },
      { path: 'orders', element: withSuspense(MyOrders) },
      { path: 'invoices', element: withSuspense(MyInvoices) },
      { path: 'activities', element: withSuspense(Activities) },
    ],
  },

  // ═══ HOTEL (/hotel/*) ═══
  {
    path: '/hotel',
    element: (
      <ProtectedRoute requiredRoles={['HOTEL', 'SUPER_ADMIN']}>
        <AbilityProvider>
          <DashboardLayout variant="hotel" />
          <ToastContainer />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(HotelDashboard) },
      { path: 'room-service', element: withSuspense(HotelRoomService) },
      { path: 'staff', element: withSuspense(HotelStaff) },
      { path: 'analytics', element: withSuspense(HotelAnalytics) },
      { path: 'vault', element: withSuspense(HotelVault) },
      { path: 'controls', element: withSuspense(HotelControls) },
      { path: 'pricing', element: withSuspense(HotelPricing) },
    ],
  },

  // ═══ ADMIN (/admin/*) ═══
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
        <AbilityProvider>
          <DashboardLayout variant="admin" />
          <ToastContainer />
        </AbilityProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'hotels', element: withSuspense(AdminHotels) },
      { path: 'users', element: withSuspense(AdminUsers) },
      { path: 'analytics', element: withSuspense(AdminGlobalAnalytics) },
      { path: 'billing', element: withSuspense(AdminBilling) },
    ],
  },

  // ═══ REDIRECTS ═══
  { path: '/dashboard', element: <RoleBasedRedirect /> },
  { path: '*', element: <RoleBasedRedirect /> },
]);
