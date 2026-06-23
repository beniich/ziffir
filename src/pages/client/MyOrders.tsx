import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../shared/api/client';
import { Plus } from 'lucide-react';

export default function MyOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['client', 'orders'],
    queryFn: () => api.client.myOrders(),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mes Commandes</h1>
          <p className="text-slate-400 mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Nouvelle commande</Button>
      </header>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Historique complet</CardTitle></CardHeader>

        {isLoading ? (
          <Spinner variant="spinner" label="Chargement..." />
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" title="Aucune commande" description="Vos commandes apparaîtront ici" />
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-slate-100">{o.roomNumber}</div>
                    <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={o.status === 'DELIVERED' ? 'success' : 'info'}>{o.status}</Badge>
                    <div className="text-lg font-bold text-zaphir-400">{o.total?.toFixed(2)}€</div>
                  </div>
                </div>
                {o.items && (
                  <div className="text-sm text-slate-400">
                    {o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
