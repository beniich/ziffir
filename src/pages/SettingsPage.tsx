// @ts-nocheck
// src/pages/SettingsPage.tsx
import React from 'react';
import { SettingsTab } from '../components/SettingsTab';
import { useAppContext } from '../contexts/AppContext';

export default function SettingsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <SettingsTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
