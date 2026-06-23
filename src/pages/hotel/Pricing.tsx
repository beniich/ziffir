import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../components/ui/Toast';
import { api } from '../../shared/api/client';
import { RefreshCw, Zap } from 'lucide-react';

export default function HotelPricing() {
  const qc = useQueryClient();
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['hotel', 'pricing'],
    queryFn: () => api.hotel.pricing(),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.hotel.syncPricing?.() ?? Promise.resolve(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel', 'pricing'] });
      toast.success('Synchronisation lancée');
    },
  });

  if (isLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  const synced = rules.filter((r: any) => r.status === 'synced').length;
  const pending = rules.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Tarification & Sync</h1>
          <p className="text-slate-400 mt-1">{rules.length} règles • {synced} synchronisées • {pending} en attente</p>
        </div>
        <Button variant="primary" leftIcon={<Zap className="w-4 h-4" />} onClick={() => syncMutation.mutate()} isLoading={syncMutation.isPending}>
          Sync All
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rules.map((rule: any) => {
          const multipliers = typeof rule.channelMultipliers === 'string'
            ? JSON.parse(rule.channelMultipliers)
            : rule.channelMultipliers || {};
          return (
            <Card key={rule.id} variant="glass-strong" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-100">{rule.suite}</h3>
                <Badge variant={rule.status === 'synced' ? 'success' : rule.status === 'pending' ? 'warning' : 'danger'}>
                  {rule.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-zaphir-400 mb-4">{rule.basePrice}€</div>
              <div className="space-y-1 text-sm">
                {Object.entries(multipliers).map(([channel, mult]) => (
                  <div key={channel} className="flex justify-between">
                    <span className="text-slate-400">{channel}</span>
                    <span className="text-slate-200">×{mult as number}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                Dernière sync: {new Date(rule.lastSync).toLocaleString('fr-FR')}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
