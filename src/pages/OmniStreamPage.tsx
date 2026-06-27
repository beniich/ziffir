// @ts-nocheck
// src/pages/OmniStreamPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { OmniStreamTab } from '../components/OmniStreamTab';

export default function OmniStreamPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <OmniStreamTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
