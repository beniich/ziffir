import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { useToast } from '../hooks/useToast';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  _count: { rooms: number; orders: number; reservations: number };
}

export function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const navigate = useNavigate();
  const toast = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (planFilter) params.set('plan', planFilter);
    
    fetch(`/api/admin/hotels?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setHotels(data.data?.hotels || []));
  }, [search, planFilter]);
  
  const columns: Column<Hotel>[] = [
    {
      key: 'name',
      label: 'Hôtel',
      sortable: true,
      render: (h) => (
        <Link to={`/admin/hotels/${h.id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>
          {h.name}
        </Link>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: true,
      render: (h) => <PlanBadge plan={h.plan} trialEndsAt={h.trialEndsAt} />,
    },
    {
      key: '_count',
      label: 'Activité',
      render: (h) => (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {h._count.rooms} ch. · {h._count.orders} cmd · {h._count.reservations} rés.
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (h) => (
        <span className={`badge ${h.isActive ? 'badge-success' : 'badge-danger'}`}>
          {h.isActive ? '● Actif' : '○ Désactivé'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      sortable: true,
      render: (h) => new Date(h.createdAt).toLocaleDateString('fr-FR'),
    },
  ];
  
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">🏨 Hôtels</h1>
        <span style={{ color: 'var(--text-muted)' }}>{hotels.length} au total</span>
      </div>
      
      <DataTable
        data={hotels}
        columns={columns}
        searchKeys={['name', 'slug']}
        pageSize={50}
        toolbar={
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="">Tous les plans</option>
            <option value="FREE_TRIAL">Free Trial</option>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
            <option value="PLATINIUM">Platinium</option>
            <option value="GOLDEN">Golden</option>
          </select>
        }
      />
    </div>
  );
}

function PlanBadge({ plan, trialEndsAt }: { plan: string; trialEndsAt: string | null }) {
  const colors: Record<string, string> = {
    FREE_TRIAL: 'badge-info',
    FREE: 'badge-neutral',
    PREMIUM: 'badge-info',
    PLATINIUM: 'badge-warning',
    GOLDEN: 'badge-success',
  };
  
  let label = plan;
  if (plan === 'FREE_TRIAL' && trialEndsAt) {
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000);
    label = `TRIAL ${daysLeft}j`;
  }
  
  return <span className={`badge ${colors[plan] || 'badge-neutral'}`}>{label}</span>;
}
