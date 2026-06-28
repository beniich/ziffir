import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './auth/AuthContext';

import { AdminApp } from './admin/AdminApp';

const path = window.location.pathname;
const RootApp = path.startsWith('/admin') ? AdminApp : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path.startsWith('/admin') ? (
      <RootApp />
    ) : (
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    )}
  </React.StrictMode>
);

