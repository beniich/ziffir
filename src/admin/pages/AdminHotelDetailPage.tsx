import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { useToast } from '../hooks/useToast';

export function AdminHotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [hotel, setHotel] = useState<any>(null);
  const [impersonateModal, setImpersonateModal] = useState(false);
  const [impersonateResult, setImpersonateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const load = () => {
    fetch(`/api/admin/hotels/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setHotel(d.data));
  };
  
  useEffect(load, [id]);
  
  if (!hotel) return <p>Chargement…</p>;
  
  const impersonate = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/hotels/${id}/impersonate`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      toast.push(data.error?.message || 'Erreur', 'error');
      return;
    }
    
    setImpersonateResult(data.data);
  };
  
  const updatePlan = async (newPlan: string) => {
    const res = await fetch(`/api/admin/hotels/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: newPlan }),
    });
    
    if (res.ok) {
      toast.push(`Plan mis à jour : ${newPlan}`, 'success');
      load();
    } else {
      toast.push('Erreur', 'error');
    }
  };
  
  const toggleActive = async () => {
    const res = await fetch(`/api/admin/hotels/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !hotel.isActive }),
    });
    
    if (res.ok) {
      toast.push(hotel.isActive ? 'Hôtel désactivé' : 'Hôtel activé', 'success');
      load();
    }
  };
  
  return (
    <div>
      <button onClick={() => navigate('/admin/hotels')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
        ← Retour à la liste
      </button>
      
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{hotel.name}</h1>
          <code style={{ color: 'var(--text-muted)' }}>{hotel.slug}</code>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setImpersonateModal(true)} className="btn btn-warning">
            🎭 Impersonate
          </button>
          <button onClick={toggleActive} className={`btn ${hotel.isActive ? 'btn-danger' : 'btn-success'}`}>
            {hotel.isActive ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Plan actuel</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{hotel.plan}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Chambres</div>
          <div className="kpi-value">{hotel._count?.rooms || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Commandes</div>
          <div className="kpi-value">{hotel._count?.orders || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Réservations</div>
          <div className="kpi-value">{hotel._count?.reservations || 0}</div>
        </div>
      </div>
      
      {/* Actions plan */}
      <div className="chart-container">
        <div className="chart-title">Changer le plan</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['FREE_TRIAL', 'FREE', 'PREMIUM', 'PLATINIUM', 'GOLDEN'].map(plan => (
            <button
              key={plan}
              onClick={() => updatePlan(plan)}
              disabled={hotel.plan === plan}
              className={`btn ${hotel.plan === plan ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>
      
      {/* Membres */}
      <div className="chart-container">
        <div className="chart-title">👥 Membres ({hotel.memberships?.length || 0})</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Rejoint</th>
            </tr>
          </thead>
          <tbody>
            {hotel.memberships?.map((m: any) => (
              <tr key={m.id}>
                <td>{m.user.email}</td>
                <td>{m.user.displayName}</td>
                <td><span className="badge badge-info">{m.role}</span></td>
                <td>{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal Impersonate */}
      <Modal
        isOpen={impersonateModal}
        onClose={() => { setImpersonateModal(false); setImpersonateResult(null); }}
        title="🎭 Impersonate"
      >
        {!impersonateResult ? (
          <>
            <p>Vous allez vous connecter en tant que <strong>{hotel.memberships?.[0]?.user?.email || 'Admin'}</strong>.</p>
            <p style={{ color: 'var(--warning)', fontSize: '13px' }}>
              ⚠️ Cette action est enregistrée dans l'audit log. La session expire dans 1 heure.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setImpersonateModal(false)}>
                Annuler
              </button>
              <button className="btn btn-warning" onClick={impersonate} disabled={loading}>
                {loading ? 'Génération…' : 'Confirmer'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--success)' }}>✅ Token généré</p>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              wordBreak: 'break-all',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {impersonateResult.accessToken}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Ouvrez la console et exécutez :
            </p>
            <pre style={{
              background: 'var(--bg-tertiary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
            }}>
{`document.cookie = "zafir_access_token=${impersonateResult.accessToken.match(/^([^.]+)/)?.[0] || ''}..."; path=/";`}
            </pre>
          </>
        )}
      </Modal>
    </div>
  );
}
