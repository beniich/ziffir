// src/AppRouter.tsx
// ============================================================================
// Configuration du routeur avec guards RBAC + layout authentifié
// ============================================================================

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthGuard, RoleGuard } from './auth/guards';
import { useAuth } from './auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import { canAccessTab } from './auth/permissions';
import { Sidebar } from './auth/navigation';

// Lazy-load des pages (code splitting)
const MarketingPage = lazy(() => import('./pages/MarketingPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const LoginPage = lazy(() => import('./pages/LoginPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const PortalPage = lazy(() => import('./pages/PortalPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ArrivalsPage = lazy(() => import('./pages/ArrivalsPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const RoomServicePage = lazy(() => import('./pages/RoomServicePage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ControlsPage = lazy(() => import('./pages/ControlsPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ChannelSyncPage = lazy(() => import('./pages/ChannelSyncPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const VaultPage = lazy(() => import('./pages/VaultPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const MembershipsPage = lazy(() => import('./pages/MembershipsPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const BillingPage = lazy(() => import('./pages/BillingPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const OmniStreamPage = lazy(() => import('./pages/OmniStreamPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const LedgerPage = lazy(() => import('./pages/LedgerPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ManagementPage = lazy(() => import('./pages/ManagementPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const UserDirectoryPage = lazy(() => import('./pages/UserDirectoryPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const HospitalityPage = lazy(() => import('./pages/HospitalityPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const WineCellarPage = lazy(() => import('./pages/WineCellarPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const DesignShowcasePage = lazy(() => import('./pages/DesignShowcasePage').catch(() => ({ default: () => <div>Not implemented yet</div> })));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage').catch(() => ({ default: () => <div>Not implemented yet</div> })));

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>Chargement…</p>
    </div>
  );
}

/**
 * Layout authentifié : sidebar + outlet
 */
function AuthenticatedLayout() {
  const { themeMode } = useAppContext();
  
  return (
    <div className={`min-h-screen flex w-full transition-colors duration-300 ${
      themeMode === 'light' ? 'bg-[#fcfaf2]' : 'bg-[#050b16]'
    }`}>
      {/* Sidebar - Fixe à gauche */}
      <Sidebar />
      
      {/* Contenu principal */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Routes publiques */}
            <Route path="/" element={<MarketingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes protégées */}
            <Route
              element={
                <AuthGuard>
                  <AuthenticatedLayout />
                </AuthGuard>
              }
            >
              <Route
                path="/portal"
                element={
                  <RoleGuard permission="portal.view">
                    <PortalPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/arrivals"
                element={
                  <RoleGuard permission="arrivals.view">
                    <ArrivalsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/room-service"
                element={
                  <RoleGuard permission="room_service.view">
                    <RoomServicePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/controls"
                element={
                  <RoleGuard permission="controls.view">
                    <ControlsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/channel-sync"
                element={
                  <RoleGuard permission="channel_sync.view">
                    <ChannelSyncPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/vault"
                element={
                  <RoleGuard permission="vault.view">
                    <VaultPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/memberships"
                element={
                  <RoleGuard permission="memberships.view">
                    <MembershipsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/billing"
                element={
                  <RoleGuard permission="billing.view">
                    <BillingPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <RoleGuard permission="maintenance.view">
                    <MaintenancePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/omni-stream"
                element={
                  <RoleGuard permission="omni_stream.view">
                    <OmniStreamPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/ledger"
                element={
                  <RoleGuard permission="ledger.view">
                    <LedgerPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/management"
                element={
                  <RoleGuard permission="management.view">
                    <ManagementPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <RoleGuard permission="user_directory.view">
                    <UserDirectoryPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/hospitality"
                element={
                  <RoleGuard permission="hospitality.view">
                    <HospitalityPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/wine-cellar"
                element={
                  <RoleGuard permission="wine_cellar.view">
                    <WineCellarPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <RoleGuard permission="profile.view">
                    <ProfilePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleGuard permission="settings.view">
                    <SettingsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/design"
                element={
                  <RoleGuard permission="design_showcase.view">
                    <DesignShowcasePage />
                  </RoleGuard>
                }
              />
            </Route>

            {/* 403 & fallback */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
