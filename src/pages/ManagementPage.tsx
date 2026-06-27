// @ts-nocheck
// src/pages/ManagementPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { ManagementTab } from '../components/ManagementTab';

export default function ManagementPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <ManagementTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
