import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../shared/api/client';
import { ArrowRight, Receipt, Sparkles, Utensils, Calendar } from 'lucide-react';

export default function ClientDashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['client', 'orders'],
    queryFn: () => api.client.myOrders(),
  });

  const activeOrders = orders.filter((o: any) => o.status !== 'DELIVERED');

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-slate-100">Bienvenue 👋</h1>
        <p className="text-slate-400 mt-1">Découvrez nos services et activités</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass-strong" padding="lg" hoverable>
          <Utensils className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="font-bold text-lg mb-2">Room Service</h3>
          <p className="text-sm text-slate-400 mb-4">Commandez depuis votre chambre</p>
          <Link to="/me/orders"><Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Voir</Button></Link>
        </Card>

        <Card variant="glass-strong" padding="lg" hoverable>
          <Receipt className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-bold text-lg mb-2">Mes Factures</h3>
          <p className="text-sm text-slate-400 mb-4">Consultez votre historique</p>
          <Link to="/me/invoices"><Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Voir</Button></Link>
        </Card>

        <Card variant="glass-strong" padding="lg" hoverable>
          <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-bold text-lg mb-2">Activités</h3>
          <p className="text-sm text-slate-400 mb-4">Événements & expériences</p>
          <Link to="/me/activities"><Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Voir</Button></Link>
        </Card>
      </div>

      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <CardTitle>Commandes en cours</CardTitle>
        </CardHeader>
        {isLoading ? (
          <Spinner variant="spinner" label="Chargement..." />
        ) : activeOrders.length === 0 ? (
          <EmptyState icon="🍽️" title="Aucune commande en cours" description="Passez commande depuis Room Service" />
        ) : (
          <div className="space-y-2">
            {activeOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <div className="font-medium text-slate-100">{order.roomNumber}</div>
                  <div className="text-sm text-slate-400">
                    {order.items?.map((i: any) => i.name).join(', ') || order.details}
                  </div>
                </div>
                <Badge variant="info">{order.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
