// @ts-nocheck
// src/pages/DesignShowcasePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import DesignSystemShowcase from '../components/DesignSystemShowcase';

export default function DesignShowcasePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <DesignSystemShowcase
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
