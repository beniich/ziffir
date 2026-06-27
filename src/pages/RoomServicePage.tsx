// @ts-nocheck
// src/pages/RoomServicePage.tsx
import React from 'react';
import { RoomServiceTab } from '../components/RoomServiceTab';
import { useAppContext } from '../contexts/AppContext';

export default function RoomServicePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <RoomServiceTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
