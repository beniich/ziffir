// @ts-nocheck
// src/pages/ProfilePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { ProfileTab } from '../components/ProfileTab';

export default function ProfilePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <ProfileTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
