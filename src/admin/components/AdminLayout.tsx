import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAdmin(data.data));
  }, []);
  
  const logout = async () => {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/admin/login');
  };
  
  const navItems = [
    { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
    { to: '/admin/leads', icon: '📩', label: 'Leads' },
    { to: '/admin/hotels', icon: '🏨', label: 'Hôtels' },
    { to: '/admin/users', icon: '👥', label: 'Utilisateurs' },
    { to: '/admin/audit', icon: '🔍', label: 'Audit' },
    { to: '/admin/settings', icon: '⚙️', label: 'Paramètres' },
  ];
  
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span>🛡️</span>
          <span>Ziffir Admin</span>
        </div>
        
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {admin && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            padding: '0.75rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
          }}>
            <div style={{ fontWeight: 600 }}>{admin.displayName}</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{admin.email}</div>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
              Déconnexion
            </button>
          </div>
        )}
      </aside>
      
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
