// @ts-nocheck
// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { AuthContext } from '../auth/AuthContext';
import { useContext } from 'react';

export default function LoginPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <useAuth {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
