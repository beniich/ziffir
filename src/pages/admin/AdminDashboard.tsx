import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Globe, Building2, Users, Shield } from 'lucide-react';
import { api } from '../../shared/api/client';

export default function AdminDashboard() {
  const { data: hotels = [], isLoading: hLoading } = useQuery({
    queryKey: ['admin', 'hotels'],
    queryFn: () => api.admin.hotels(),
  });

  const { data: users = [], isLoading: uLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.users(),
  });

  if (hLoading || uLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  const activeHotels = hotels.filter((h: any) => h.isActive);
  const activeUsers  = users.filter((u: any) => u.isActive);

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-slate-100">🌐 Super Admin</h1>
        <p className="text-slate-400 mt-1">Vue d'ensemble de la plateforme Zaphir</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="cyber" padding="lg">
          <Building2 className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-sm text-slate-400">Hôtels actifs</div>
          <div className="text-3xl font-bold text-cyan-300">{activeHotels.length}</div>
        </Card>
        <Card variant="cyber" padding="lg">
          <Users className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-sm text-slate-400">Utilisateurs actifs</div>
          <div className="text-3xl font-bold text-purple-300">{activeUsers.length}</div>
        </Card>
        <Card variant="cyber" padding="lg">
          <Shield className="w-8 h-8 text-amber-400 mb-2" />
          <div className="text-sm text-slate-400">Super Admins</div>
          <div className="text-3xl font-bold text-amber-300">
            {users.filter((u: any) => u.role === 'SUPER_ADMIN').length}
          </div>
        </Card>
        <Card variant="cyber" padding="lg">
          <Globe className="w-8 h-8 text-emerald-400 mb-2" />
          <div className="text-sm text-slate-400">Clients</div>
          <div className="text-3xl font-bold text-emerald-300">
            {users.filter((u: any) => u.role === 'CLIENT').length}
          </div>
        </Card>
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hôtels de la plateforme</CardTitle>
            <Link to="/admin/hotels" className="text-cyan-400 text-sm">Voir tous →</Link>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {activeHotels.slice(0, 10).map((hotel: any) => (
            <div key={hotel.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <div className="font-bold text-slate-100">{hotel.name}</div>
                <div className="text-xs text-slate-400">{hotel.slug} • {hotel.city}</div>
              </div>
              <Badge variant={hotel.isActive ? 'success' : 'neutral'}>
                {hotel.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
