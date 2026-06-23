import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { api } from '../../shared/api/client';
import { ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';

const STATUS_VARIANT: Record<string, any> = {
  PREPARATION: 'warning',
  QUALITY_CHECK: 'info',
  OUT_FOR_DELIVERY: 'cyber',
  DELIVERED: 'success',
};

export default function HotelRoomService() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['hotel', 'orders'],
    queryFn: () => api.hotel.orders(),
  });

  const advanceMutation = useMutation({
    mutationFn: (id: string) => api.hotel.advanceOrder?.(id) ?? Promise.reject('TODO'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel', 'orders'] });
      toast.success('Commande avancée');
    },
  });

  const filtered = filter === 'ALL' ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Room Service</h1>
        <p className="text-slate-400 mt-1">{orders.length} commandes</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PREPARATION', 'QUALITY_CHECK', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === s ? 'bg-zaphir-500/30 text-zaphir-300 border border-zaphir-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {s === 'ALL' ? 'Toutes' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner variant="spinner" label="Chargement..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🍽️" title="Aucune commande" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order: any) => (
            <Card key={order.id} variant="glass-strong" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg text-slate-100">{order.roomNumber}</div>
                  <div className="text-sm text-slate-400">{order.guestName}</div>
                </div>
                <Badge variant={STATUS_VARIANT[order.status]}>{order.status.replace('_', ' ')}</Badge>
              </div>

              <div className="text-sm text-slate-300 mb-3">
                {order.items?.map((i: any) => `${i.quantity}× ${i.name}`).join(', ') || order.details}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className="font-bold text-zaphir-400">{order.total?.toFixed(2)}€</span>
                {order.status !== 'DELIVERED' && (
                  <Button size="sm" variant="primary" onClick={() => advanceMutation.mutate(order.id)} rightIcon={<ChevronRight className="w-3 h-3" />}>
                    Avancer
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
