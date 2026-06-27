// @ts-nocheck
// src/pages/MaintenancePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { MaintenanceTab } from '../components/MaintenanceTab';

export default function MaintenancePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <MaintenanceTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
