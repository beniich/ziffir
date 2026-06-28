import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; suffix?: string };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: string;
}

export function KpiCard({ label, value, trend, variant = 'default', icon }: KpiCardProps) {
  const trendUp = trend && trend.value > 0;
  const trendDown = trend && trend.value < 0;
  
  return (
    <div className={`kpi-card ${variant !== 'default' ? variant : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="kpi-label">{label}</div>
        {icon && <span style={{ fontSize: '20px', opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trendUp ? 'up' : trendDown ? 'down' : ''}`}>
          <span>{trendUp ? '↑' : trendDown ? '↓' : '→'}</span>
          <span>{Math.abs(trend.value)}{trend.suffix || '%'}</span>
          <span style={{ color: 'var(--text-muted)' }}>vs mois dernier</span>
        </div>
      )}
    </div>
  );
}
