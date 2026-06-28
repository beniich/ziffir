// @ts-nocheck
// src/pages/MarketingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../auth/useAuth';
import { MarketingWebsite } from '../components/MarketingWebsite';

export default function MarketingPage() {
  const appCtx = useAppContext();
  const authCtx = useAuth();
  const navigate = useNavigate();

  const handleEnterDashboard = () => {
    if (authCtx.isAuthenticated) {
      navigate('/nexus/overview');
    } else {
      navigate('/login');
    }
  };

  return (
    <MarketingWebsite
      {...appCtx}
      {...(authCtx as any)}
      currentUser={authCtx.user as any}
      sessionRole={(authCtx as any).role}
      onEnterDashboard={handleEnterDashboard}
    />
  );
}
