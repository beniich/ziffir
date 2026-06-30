// src/components/dashboard/ApiManagerView.tsx
// ============================================================================
// API & Token Manager - Panneau de contrôle des quotas
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface TokenQuota {
  id: string;
  hotelId: string;
  actorId: string;
  actorType: string;
  dailyLimit: number;
  consumedToday: number;
  isSuspended: boolean;
  suspendReason: string | null;
}

export function ApiManagerView() {
  const [quotas, setQuotas] = useState<TokenQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadQuotas = () => {
    setLoading(true);
    fetch('/api/tokens', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuotas(data.data);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuotas();
    // Auto-refresh pour la démo
    const interval = setInterval(loadQuotas, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleSuspend = async (quota: TokenQuota) => {
    try {
      const res = await fetch(`/api/tokens/${quota.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isSuspended: !quota.isSuspended,
          suspendReason: !quota.isSuspended ? 'Suspended via Dashboard' : null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.push(`Account ${quota.actorId} ${!quota.isSuspended ? 'suspended' : 'reactivated'}`, 'success');
        setQuotas(prev => prev.map(q => q.id === quota.id ? data.data : q));
      } else {
        toast.push(data.error?.message || 'Error', 'error');
      }
    } catch (e) {
      toast.push('Network error', 'error');
    }
  };

  if (loading && quotas.length === 0) return <div style={{ color: '#fff' }}>Loading security data...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 300, color: '#fff' }}>
        Security Envelope: API Token Quotas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {quotas.map(quota => {
          const percentage = Math.min(100, Math.round((quota.consumedToday / quota.dailyLimit) * 100));
          const isDanger = percentage > 85;

          return (
            <div key={quota.id} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: quota.actorType === 'system' ? '#3b82f6' : '#8b5cf6',
                    color: '#fff'
                  }}>
                    {quota.actorType.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#fff' }}>{quota.actorId}</span>
                  {quota.isSuspended && (
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>⚠️ SUSPENDED</span>
                  )}
                </div>
                
                {/* Jauge de consommation */}
                <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    backgroundColor: quota.isSuspended ? '#ef4444' : (isDanger ? '#fbbf24' : '#34d399'),
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#a3a3a3', marginTop: '4px' }}>
                  {quota.consumedToday.toLocaleString()} / {quota.dailyLimit.toLocaleString()} tokens
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => toggleSuspend(quota)}
                  style={{
                    backgroundColor: quota.isSuspended ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${quota.isSuspended ? '#34d399' : '#ef4444'}`,
                    color: quota.isSuspended ? '#34d399' : '#ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {quota.isSuspended ? 'REACTIVATE' : 'KILL SWITCH'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
