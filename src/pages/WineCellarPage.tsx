// @ts-nocheck
// src/pages/WineCellarPage.tsx
import React from 'react';
import { WineCellarTab } from '../components/WineCellarTab';

export default function WineCellarPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <WineCellarTab {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
