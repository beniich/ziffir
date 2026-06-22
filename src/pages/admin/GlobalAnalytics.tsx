import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../shared/api/client';
import { TrendingUp, Globe, Building2 } from 'lucide-react';

export default function AdminGlobalAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.admin.globalAnalytics(),
  });

  if (isLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Analytics Globale</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="cyber" padding="lg">
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
          <div className="text-sm text-slate-400">Revenu global</div>
          <div className="text-3xl font-bold text-emerald-300">{data?.revenue?.total?.toFixed(0) || 0}€</div>
        </Card>
        <Card variant="cyber" padding="lg">
          <Building2 className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-sm text-slate-400">Occupation moyenne</div>
          <div className="text-3xl font-bold text-cyan-300">{data?.occupancy?.rate || 0}%</div>
        </Card>
        <Card variant="cyber" padding="lg">
          <Globe className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-sm text-slate-400">Commandes totales</div>
          <div className="text-3xl font-bold text-purple-300">{data?.orders?.total || 0}</div>
        </Card>
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Performance multi-hôtels</CardTitle></CardHeader>
        <div className="text-center py-8 text-slate-400">
          📊 Graphiques détaillés disponibles après configuration Grafana
        </div>
      </Card>
    </div>
  );
}
