// @ts-nocheck
// src/pages/LedgerPage.tsx
import React from 'react';
import { LedgerTab } from '../components/LedgerTab';
import { useAppContext } from '../contexts/AppContext';

export default function LedgerPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <LedgerTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
