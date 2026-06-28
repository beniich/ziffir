import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/KpiCard';
import { PlanDistributionChart } from '../components/PlanDistributionChart';

interface Kpis {
  totalHotels: number;
  activeHotels: number;
  trialHotels: number;
  paidHotels: number;
  totalUsers: number;
  newLeadsLast30d: number;
  convertedLeadsLast30d: number;
  conversionRate: number;
  mrr: number;
  planDistribution: Record<string, number>;
}

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentAudit, setRecentAudit] = useState<any[]>([]);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard/kpis', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/leads', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/audit?limit=10', { credentials: 'include' }).then(r => r.json()),
    ]).then(([k, l, a]) => {
      setKpis(k.data);
      setRecentLeads((l.data || []).slice(0, 5));
      setRecentAudit(a.data?.logs || []);
    });
  }, []);
  
  if (!kpis) return <p>Chargement…</p>;
  
  const planData = Object.entries(kpis.planDistribution).map(([plan, count]) => ({
    plan,
    count,
    color: {
      FREE_TRIAL: '#06b6d4',
      FREE: '#64748b',
      PREMIUM: '#3b82f6',
      PLATINIUM: '#8b5cf6',
      GOLDEN: '#f59e0b',
    }[plan] || '#64748b',
  }));
  
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">📊 Vue d'ensemble</h1>
        <span style={{ color: 'var(--text-muted)' }}>
          Mis à jour {new Date().toLocaleTimeString('fr-FR')}
        </span>
      </div>
      
      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard label="MRR estimé" value={`${kpis.mrr.toLocaleString('fr-FR')} €`} icon="💰" variant="success" trend={{ value: 12 }} />
        <KpiCard label="Hôtels actifs" value={kpis.activeHotels} icon="🏨" trend={{ value: 8 }} />
        <KpiCard label="Hôtels payants" value={kpis.paidHotels} icon="💎" variant="success" />
        <KpiCard label="Trials en cours" value={kpis.trialHotels} icon="⏳" variant="warning" />
        <KpiCard label="Utilisateurs" value={kpis.totalUsers} icon="👥" trend={{ value: 15 }} />
        <KpiCard label="Nouveaux leads (30j)" value={kpis.newLeadsLast30d} icon="📩" />
        <KpiCard label="Conversion (30j)" value={`${kpis.conversionRate}%`} icon="🎯" variant={kpis.conversionRate > 20 ? 'success' : 'warning'} />
        <KpiCard label="Conversions (30j)" value={kpis.convertedLeadsLast30d} icon="✅" variant="success" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Graphique */}
        <PlanDistributionChart data={planData} />
        
        {/* Leads récents */}
        <div className="chart-container">
          <div className="chart-title">📩 Leads récents</div>
          {recentLeads.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucun lead</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentLeads.map(lead => (
                <Link
                  key={lead.id}
                  to={`/admin/leads/${lead.id}`}
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{lead.contactName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{lead.email}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Activité récente */}
      <div className="chart-container" style={{ marginTop: '1.5rem' }}>
        <div className="chart-title">🔍 Activité admin récente</div>
        {recentAudit.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucune activité</p>
        ) : (
          <table className="admin-table" style={{ marginTop: '0.5rem' }}>
            <thead>
              <tr>
                <th>Quand</th>
                <th>Qui</th>
                <th>Action</th>
                <th>Cible</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.map(log => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td>{log.superAdmin?.displayName || 'system'}</td>
                  <td><code style={{ fontSize: '12px' }}>{log.action}</code></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {log.targetType && `${log.targetType}:${log.targetId?.slice(0, 8)}…`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
