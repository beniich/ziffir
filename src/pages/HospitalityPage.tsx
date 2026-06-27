// @ts-nocheck
// src/pages/HospitalityPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { HospitalityManagerTab } from '../components/HospitalityManagerTab';

export default function HospitalityPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <HospitalityManagerTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
