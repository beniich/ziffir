// @ts-nocheck
// src/pages/ProfilePage.tsx
import React from 'react';
import { ProfileTab } from '../components/ProfileTab';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';

export default function ProfilePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <ProfileTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
