// @ts-nocheck
// src/pages/WineCellarPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { WineCellarTab } from '../components/WineCellarTab';

export default function WineCellarPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <WineCellarTab
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
