// @ts-nocheck
// src/pages/ManagementPage.tsx
import React from 'react';
import { ManagementTab } from '../components/ManagementTab';

export default function ManagementPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <ManagementTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
