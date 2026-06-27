// @ts-nocheck
// src/pages/LedgerPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { LedgerTab } from '../components/LedgerTab';

export default function LedgerPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <LedgerTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
