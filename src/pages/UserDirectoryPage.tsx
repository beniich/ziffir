// @ts-nocheck
// src/pages/UserDirectoryPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { UserManagerSuite } from '../domains/identity/components/UserManagerSuite';

export default function UserDirectoryPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return (
    <UserManagerSuite
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
    />
  );
}
