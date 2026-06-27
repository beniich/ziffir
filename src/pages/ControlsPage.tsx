// @ts-nocheck
// src/pages/ControlsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { ControlsTab } from '../components/ControlsTab';

export default function ControlsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <ControlsTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
