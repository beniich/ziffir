// @ts-nocheck
// src/pages/HospitalityPage.tsx
import React from 'react';
import { HospitalityManagerTab } from '../components/HospitalityManagerTab';

export default function HospitalityPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <HospitalityManagerTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
