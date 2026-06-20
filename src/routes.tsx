import { createBrowserRouter, Navigate, useOutletContext } from 'react-router-dom';
import { Layout } from './shared/ui/Layout';

// Original Components
import { ArrivalsTab } from './components/ArrivalsTab';
import { RoomServiceTab } from './components/RoomServiceTab';
import { ControlsTab } from './components/ControlsTab';
import { ChannelSyncTab } from './components/ChannelSyncTab';
import { VaultTab } from './components/VaultTab';
import { MembershipsTab } from './components/MembershipsTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { OmniStreamTab } from './components/OmniStreamTab';
import { LedgerTab } from './components/LedgerTab';
import { ManagementTab } from './components/ManagementTab';
import { HospitalityManagerTab } from './components/HospitalityManagerTab';
import { POSTab } from './components/POSTab';
import { AnalyticsTab } from './components/AnalyticsTab';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/arrivals" replace /> },
      { path: 'arrivals', element: <ArrivalsTab /> },
      { path: 'room-service', element: <RoomServiceTab /> },
      { path: 'controls', element: <ControlsTab /> },
      { path: 'channel-sync', element: <ChannelSyncTab /> },
      { path: 'vault', element: <VaultTab /> },
      { path: 'memberships', element: <MembershipsTab /> },
      { path: 'maintenance', element: <MaintenanceTab /> },
      { path: 'omni-stream', element: <OmniStreamTab /> },
      { path: 'ledger', element: <LedgerTab /> },
      { path: 'management', element: <ManagementTab /> },
      { path: 'hospitality-manager', element: <HospitalityManagerTab /> },
      { path: 'pos', element: <POSTab /> },
      { path: 'analytics', element: <AnalyticsTab /> },
      { path: '*', element: <Navigate to="/arrivals" replace /> },
    ],
  },
]);
