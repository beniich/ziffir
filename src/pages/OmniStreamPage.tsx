// @ts-nocheck
// src/pages/OmniStreamPage.tsx
import React from 'react';
import { OmniStreamTab } from '../components/OmniStreamTab';

export default function OmniStreamPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <OmniStreamTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
