// @ts-nocheck
// src/pages/DesignShowcasePage.tsx
import React from 'react';
import DesignSystemShowcase from '../components/DesignSystemShowcase';

export default function DesignShowcasePage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <DesignSystemShowcase {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
