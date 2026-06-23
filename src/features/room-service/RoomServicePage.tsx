// src/features/room-service/RoomServicePage.tsx

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Utensils, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { useOrders, useAdvanceOrder } from './hooks/useOrders';
import { OrderCard } from './components/OrderCard';
import { useTranslation } from 'react-i18next';
import type { RoomOrder } from './services/orderService';

type StatusFilter = 'all' | RoomOrder['status'];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',              label: 'Tous les statuts' },
  { value: 'Preparation',      label: '🔥 Préparation' },
  { value: 'Quality Check',    label: '✓ Contrôle qualité' },
  { value: 'Out for Delivery', label: '🛎 En livraison' },
  { value: 'Delivered',        label: '✅ Livrée' },
];

export default function RoomServicePage() {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useOrders();
  const advanceMutation = useAdvanceOrder();
  const [selectedOrder, setSelectedOrder] = useState<RoomOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');

  const handleAdvance = (id: string) => {
    advanceMutation.mutate(id, {
      onSuccess: () => {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      },
    });
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const activeCount = orders.filter((o) => o.status !== 'Delivered').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <Card variant="glass-strong" padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Utensils className="w-8 h-8 text-zaphir-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-100">{t('nav.roomService', 'Room Service')}</h1>
              <p className="text-sm text-slate-400">
                {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
                {activeCount > 0 && (
                  <span className="ml-2 text-amber-400 font-medium">• {activeCount} active{activeCount !== 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              disabled={isFetching}
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="px-3 py-2 rounded-lg bg-obsidian-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zaphir-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button leftIcon={<Plus className="w-4 h-4" />} variant="primary">
              Nouvelle commande
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="spinner" size="xl" label="Chargement des commandes..." />
        </div>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Erreur de chargement"
          description={(error as Error)?.message || 'Impossible de récupérer les commandes. Vérifiez que le backend est démarré.'}
          action={
            <Button onClick={() => refetch()} variant="primary">
              Réessayer
            </Button>
          }
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Aucune commande"
          description={
            filterStatus === 'all'
              ? 'Aucune commande active pour le moment'
              : `Aucune commande avec le statut "${filterStatus}"`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={() => handleAdvance(order.id)}
              onViewDetails={() => setSelectedOrder(order)}
              isAdvancing={advanceMutation.isPending && advanceMutation.variables === order.id}
            />
          ))}
        </div>
      )}

      {/* Modal détails */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Commande #${selectedOrder.orderRef}` : ''}
        description={
          selectedOrder
            ? `${selectedOrder.roomNumber} • ${selectedOrder.guestName}${selectedOrder.guestVIP ? ' ⭐' : ''}`
            : ''
        }
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm text-slate-400">
              <span>Statut : <strong className="text-slate-200">{selectedOrder.status}</strong></span>
              <span>Priorité : <strong className="text-slate-200">{selectedOrder.priority}</strong></span>
            </div>

            {selectedOrder.notes && (
              <p className="text-sm text-slate-400 italic border-l-2 border-zaphir-500/40 pl-3">
                {selectedOrder.notes}
              </p>
            )}

            <ul className="space-y-2">
              {selectedOrder.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-200">{item.name} × {item.quantity}</span>
                  <span className="text-zaphir-400 font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                </li>
              ))}
            </ul>

            <div className="space-y-1 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{selectedOrder.subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>TVA</span>
                <span>{selectedOrder.vat.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Service</span>
                <span>{selectedOrder.serviceCharge.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-100 pt-2 border-t border-slate-700">
                <span>Total</span>
                <span className="text-zaphir-400">{selectedOrder.total.toFixed(2)}€</span>
              </div>
            </div>

            {selectedOrder.status !== 'Delivered' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  handleAdvance(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                isLoading={advanceMutation.isPending}
              >
                Avancer la commande
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
