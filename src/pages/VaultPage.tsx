// @ts-nocheck
// src/pages/VaultPage.tsx
import React from 'react';
import { VaultTab } from '../components/VaultTab';
import { useAppContext } from '../contexts/AppContext';

export default function VaultPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <VaultTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
