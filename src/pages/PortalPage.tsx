// @ts-nocheck
// src/pages/PortalPage.tsx
import React from 'react';
import { PrestigePortalTab } from '../components/PrestigePortalTab';

export default function PortalPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <PrestigePortalTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
