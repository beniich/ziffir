// @ts-nocheck
// src/pages/VaultPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { VaultTab } from '../components/VaultTab';

export default function VaultPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <VaultTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
