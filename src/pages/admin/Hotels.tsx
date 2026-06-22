import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../shared/api/client';
import { Plus, Building2 } from 'lucide-react';

export default function AdminHotels() {
  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin', 'hotels'],
    queryFn: () => api.admin.hotels(),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestion des Hôtels</h1>
          <p className="text-slate-400 mt-1">{hotels.length} hôtels enregistrés</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Nouvel hôtel</Button>
      </header>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Liste complète</CardTitle></CardHeader>
        {isLoading ? (
          <Spinner />
        ) : hotels.length === 0 ? (
          <EmptyState icon="🏨" title="Aucun hôtel" />
        ) : (
          <div className="space-y-2">
            {hotels.map((hotel: any) => (
              <div key={hotel.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{hotel.name}</div>
                    <div className="text-sm text-slate-400">{hotel.slug} • {hotel.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={hotel.isActive ? 'success' : 'neutral'}>
                    {hotel.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Button size="sm" variant="ghost">Gérer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
