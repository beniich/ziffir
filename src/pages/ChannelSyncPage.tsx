// @ts-nocheck
// src/pages/ChannelSyncPage.tsx
import React from 'react';
import { ChannelSyncTab } from '../components/ChannelSyncTab';
import { useAppContext } from '../contexts/AppContext';

export default function ChannelSyncPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <ChannelSyncTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
