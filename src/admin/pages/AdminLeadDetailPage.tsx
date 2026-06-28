import React from 'react';
import { useParams } from 'react-router-dom';

export function AdminLeadDetailPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="admin-page-title">Détail du Lead {id}</h1>
      <p style={{ color: 'var(--text-muted)' }}>Page de détail d'un lead (À implémenter)</p>
    </div>
  );
}
