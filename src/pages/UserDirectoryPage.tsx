// @ts-nocheck
// src/pages/UserDirectoryPage.tsx
import React from 'react';
import { UserManagerSuite } from '../components/UserManagerSuite';

export default function UserDirectoryPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <UserManagerSuite {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
