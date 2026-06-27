// @ts-nocheck
// src/pages/MarketingPage.tsx
import React from 'react';
import { MarketingWebsite } from '../components/MarketingWebsite';

export default function MarketingPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <MarketingWebsite {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
