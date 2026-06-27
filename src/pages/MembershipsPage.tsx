// @ts-nocheck
// src/pages/MembershipsPage.tsx
import React from 'react';
import { MembershipsTab } from '../components/MembershipsTab';

export default function MembershipsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <MembershipsTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
