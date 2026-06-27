// @ts-nocheck
// src/pages/MarketingPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { MarketingWebsite } from '../components/MarketingWebsite';

export default function MarketingPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <MarketingWebsite
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
