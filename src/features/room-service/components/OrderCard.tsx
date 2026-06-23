// src/features/room-service/components/OrderCard.tsx

import { ChevronRight, Eye } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { RoomOrder } from '../services/orderService';

interface Props {
  order: RoomOrder;
  onAdvance: () => void;
  onViewDetails: () => void;
  isAdvancing?: boolean;
}

const STATUS_CONFIG: Record<RoomOrder['status'], { variant: 'warning' | 'info' | 'success'; icon: string }> = {
  'Preparation':      { variant: 'warning', icon: '🔥' },
  'Quality Check':    { variant: 'info',    icon: '✓' },
  'Out for Delivery': { variant: 'info',    icon: '🛎' },
  'Delivered':        { variant: 'success', icon: '✓' },
};

export const OrderCard = ({ order, onAdvance, onViewDetails, isAdvancing }: Props) => {
  const config = STATUS_CONFIG[order.status] ?? { variant: 'info' as const, icon: '•' };

  return (
    <article className="p-5 rounded-2xl bg-obsidian-900/60 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5">
      <header className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-100">{order.roomNumber}</h3>
          <p className="text-sm text-slate-400">
            {order.guestName}
            {order.guestVIP && <span className="ml-2 text-zaphir-400">⭐ VIP</span>}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">#{order.orderRef}</p>
        </div>
        <Badge variant={config.variant}>
          {config.icon} {order.status}
        </Badge>
      </header>

      <ul className="text-sm text-slate-300 space-y-1 mb-3">
        {order.items.slice(0, 2).map((item, i) => (
          <li key={i} className="flex justify-between">
            <span className="truncate">{item.name} × {item.quantity}</span>
            <span className="text-slate-400 ml-2 shrink-0">{(item.price * item.quantity).toFixed(2)}€</span>
          </li>
        ))}
        {order.items.length > 2 && (
          <li className="text-xs text-slate-500">+ {order.items.length - 2} autres articles</li>
        )}
      </ul>

      {order.notes && (
        <p className="text-xs text-slate-500 italic mb-3 border-l-2 border-slate-700 pl-2">
          {order.notes}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <span className="text-lg font-bold text-zaphir-400">{order.total.toFixed(2)}€</span>

        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onViewDetails} leftIcon={<Eye className="w-3 h-3" />}>
            Détails
          </Button>

          {order.status !== 'Delivered' && (
            <Button
              size="sm"
              variant="primary"
              onClick={onAdvance}
              isLoading={isAdvancing}
              rightIcon={!isAdvancing ? <ChevronRight className="w-3 h-3" /> : undefined}
            >
              Avancer
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
