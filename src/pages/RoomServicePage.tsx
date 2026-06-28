// @ts-nocheck
// src/pages/RoomServicePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { RoomServiceTab } from '../domains/restaurant/components/RoomServiceTab';

export default function RoomServicePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <RoomServiceTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
