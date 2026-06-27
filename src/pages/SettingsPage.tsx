// @ts-nocheck
// src/pages/SettingsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { SettingsTab } from '../components/SettingsTab';

export default function SettingsPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <SettingsTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
