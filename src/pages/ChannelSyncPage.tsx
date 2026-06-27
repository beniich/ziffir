// @ts-nocheck
// src/pages/ChannelSyncPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { ChannelSyncTab } from '../components/ChannelSyncTab';

export default function ChannelSyncPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <ChannelSyncTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
