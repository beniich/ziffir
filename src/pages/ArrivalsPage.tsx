// @ts-nocheck
// src/pages/ArrivalsPage.tsx
import React from 'react';
import { ArrivalsTab } from '../components/ArrivalsTab';
import { useAppContext } from '../contexts/AppContext';

export default function ArrivalsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <ArrivalsTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
