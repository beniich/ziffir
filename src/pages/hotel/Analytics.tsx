import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../shared/api/client';
import { TrendingUp, Users, Building2, DollarSign } from 'lucide-react';

export default function HotelAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['hotel', 'analytics'],
    queryFn: () => api.hotel.analytics(),
  });

  if (isLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass-strong" padding="lg">
          <DollarSign className="w-8 h-8 text-emerald-400 mb-2" />
          <div className="text-sm text-slate-400">Revenu total</div>
          <div className="text-3xl font-bold text-emerald-300">{analytics?.revenue?.total?.toFixed(0)}€</div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-sm text-slate-400">Panier moyen</div>
          <div className="text-3xl font-bold text-cyan-300">{analytics?.revenue?.average?.toFixed(0)}€</div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Building2 className="w-8 h-8 text-zaphir-400 mb-2" />
          <div className="text-sm text-slate-400">Taux d'occupation</div>
          <div className="text-3xl font-bold text-zaphir-300">{analytics?.occupancy?.rate}%</div>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Users className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-sm text-slate-400">Commandes</div>
          <div className="text-3xl font-bold text-purple-300">{analytics?.orders?.total}</div>
        </Card>
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Performance sur {analytics?.period?.days} jours</CardTitle></CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-6 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">Total commandes</div>
            <div className="text-3xl font-bold text-cyan-300 mt-2">{analytics?.orders?.total}</div>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">Terminées</div>
            <div className="text-3xl font-bold text-emerald-300 mt-2">{analytics?.orders?.completed}</div>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">En cours</div>
            <div className="text-3xl font-bold text-amber-300 mt-2">{analytics?.orders?.pending}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
