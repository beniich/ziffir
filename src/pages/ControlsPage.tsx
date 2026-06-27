// @ts-nocheck
// src/pages/ControlsPage.tsx
import React from 'react';
import { ControlsTab } from '../components/ControlsTab';
import { useAppContext } from '../contexts/AppContext';

export default function ControlsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <ControlsTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
