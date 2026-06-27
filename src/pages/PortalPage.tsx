// @ts-nocheck
// src/pages/PortalPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { PrestigePortalTab } from '../components/PrestigePortalTab';

export default function PortalPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <PrestigePortalTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
