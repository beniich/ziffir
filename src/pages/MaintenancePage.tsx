// @ts-nocheck
// src/pages/MaintenancePage.tsx
import React from 'react';
import { MaintenanceTab } from '../components/MaintenanceTab';

export default function MaintenancePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <MaintenanceTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
