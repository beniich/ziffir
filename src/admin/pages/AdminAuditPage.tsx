import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '../components/DataTable';

interface AuditEntry {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  actor: string;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  superAdmin: { email: string; displayName: string } | null;
}

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (actorFilter) params.set('adminId', actorFilter);
    params.set('limit', '200');
    
    fetch(`/api/admin/audit?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setLogs(d.data?.logs || []));
  }, [actionFilter, actorFilter]);
  
  const columns: Column<AuditEntry>[] = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (l) => (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {new Date(l.createdAt).toLocaleString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'superAdmin',
      label: 'Acteur',
      render: (l) => l.superAdmin?.displayName || <em>system</em>,
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (l) => <code style={{ fontSize: '12px', color: 'var(--accent)' }}>{l.action}</code>,
    },
    {
      key: 'targetType',
      label: 'Cible',
      render: (l) => l.targetType
        ? <span style={{ fontSize: '12px' }}>{l.targetType}:<code>{l.targetId?.slice(0, 12)}…</code></span>
        : '—',
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: (l) => <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.ipAddress || '—'}</code>,
    },
    {
      key: 'metadata',
      label: 'Détails',
      render: (l) => l.metadata && Object.keys(l.metadata).length > 0 ? (
        <details>
          <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}>
            Voir JSON
          </summary>
          <pre style={{
            fontSize: '10px',
            background: 'var(--bg-tertiary)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            marginTop: '0.25rem',
            overflow: 'auto',
            maxWidth: '400px',
          }}>
            {JSON.stringify(l.metadata, null, 2)}
          </pre>
        </details>
      ) : '—',
    },
  ];
  
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">🔍 Audit Log</h1>
        <span style={{ color: 'var(--text-muted)' }}>{logs.length} entrées</span>
      </div>
      
      <DataTable
        data={logs}
        columns={columns}
        searchKeys={['action', 'targetType', 'targetId']}
        pageSize={50}
        toolbar={
          <>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="">Toutes les actions</option>
              <option value="admin.login">Login admin</option>
              <option value="lead.convert">Conversion lead</option>
              <option value="lead.reject">Rejet lead</option>
              <option value="hotel.update">Modification hôtel</option>
              <option value="hotel.impersonate">Impersonate</option>
            </select>
          </>
        }
      />
    </div>
  );
}
