// @ts-nocheck
// src/pages/BillingPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { SaaSBillingTab } from '../domains/billing/components/SaaSBillingTab';

export default function BillingPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <SaaSBillingTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
