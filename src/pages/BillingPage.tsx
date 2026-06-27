// @ts-nocheck
// src/pages/BillingPage.tsx
import React from 'react';
import { SaaSBillingTab } from '../components/SaaSBillingTab';

export default function BillingPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <SaaSBillingTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
