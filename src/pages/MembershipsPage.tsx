// @ts-nocheck
// src/pages/MembershipsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { MembershipsTab } from '../components/MembershipsTab';

export default function MembershipsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <MembershipsTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
