// @ts-nocheck
// src/pages/RegisterPage.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

export default function RegisterPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  return <AuthContext {...appCtx} {...authCtx} currentUser={authCtx.user} sessionRole={authCtx.role} />;
}
