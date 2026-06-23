import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../shared/api/client';
import { ROLE_LABELS, type UserRole } from '../../types';
import { Search } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter],
    queryFn: () => api.admin.users({ role: roleFilter === 'ALL' ? undefined : roleFilter }),
  });

  const filtered = users.filter((u: any) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Utilisateurs</h1>
        <p className="text-slate-400 mt-1">{users.length} utilisateurs</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Rechercher par email ou username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          options={[
            { value: 'ALL', label: 'Tous les rôles' },
            { value: 'VISITOR', label: 'Visiteur' },
            { value: 'CLIENT', label: 'Client' },
            { value: 'HOTEL', label: 'Hôtel' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
        />
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Utilisateurs ({filtered.length})</CardTitle></CardHeader>
        {isLoading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="Aucun utilisateur" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 border-b border-slate-700">
              <tr>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Rôle</th>
                <th className="text-left py-2">Hôtel</th>
                <th className="text-left py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-800">
                  <td className="py-3 text-slate-100">{u.username}</td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <Badge variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'HOTEL' ? 'gold' : 'info'}>
                      {ROLE_LABELS[u.role as UserRole]}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">{u.hotelId?.slice(0, 8) || '—'}</td>
                  <td className="py-3">
                    <Badge variant={u.isActive ? 'success' : 'neutral'} dot>
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
