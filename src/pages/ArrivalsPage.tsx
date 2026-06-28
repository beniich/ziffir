// @ts-nocheck
// src/pages/ArrivalsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { ArrivalsTab } from '../domains/reservation/components/ArrivalsTab';

export default function ArrivalsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <ArrivalsTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
