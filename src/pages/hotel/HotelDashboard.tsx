import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Building2, Users, TrendingUp, Utensils, BarChart3 } from 'lucide-react';
import { api } from '../../shared/api/client';

export default function HotelDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['hotel', 'analytics'],
    queryFn: () => api.hotel.analytics(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['hotel', 'orders'],
    queryFn: () => api.hotel.orders(),
  });

  if (isLoading) return <Spinner variant="spinner" size="xl" fullScreen label="Chargement..." />;

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-slate-100">Tableau de bord Hôtel</h1>
        <p className="text-slate-400 mt-1">Vue d'ensemble de votre établissement</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass-strong" padding="lg">
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
          <div className="text-sm text-slate-400">Revenus ({analytics?.period?.days || 7}j)</div>
          <div className="text-2xl font-bold text-emerald-300">
            {analytics?.revenue?.total?.toFixed(0) || 0}€
          </div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Building2 className="w-8 h-8 text-zaphir-400 mb-2" />
          <div className="text-sm text-slate-400">Occupation</div>
          <div className="text-2xl font-bold text-zaphir-300">{analytics?.occupancy?.rate || 0}%</div>
          <div className="text-xs text-slate-500">{analytics?.occupancy?.occupied}/{analytics?.occupancy?.total} chambres</div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Utensils className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-sm text-slate-400">Commandes</div>
          <div className="text-2xl font-bold text-cyan-300">{analytics?.orders?.total || 0}</div>
          <div className="text-xs text-slate-500">{analytics?.orders?.completed || 0} terminées</div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Users className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-sm text-slate-400">Staff actif</div>
          <div className="text-2xl font-bold text-purple-300">{analytics?.staff?.active || 0}</div>
        </Card>
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commandes récentes</CardTitle>
            <Link to="/hotel/room-service"><BarChart3 className="w-4 h-4 text-zaphir-400" /></Link>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {orders.slice(0, 10).map((order: any) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <div className="font-medium text-slate-100">{order.roomNumber}</div>
                <div className="text-sm text-slate-400">{order.guestName}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-zaphir-400">{order.total?.toFixed(2)}€</div>
                <div className="text-xs text-slate-500">{order.status}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
