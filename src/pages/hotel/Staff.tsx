import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../shared/api/client';

export default function HotelStaff() {
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['hotel', 'staff'],
    queryFn: () => api.hotel.staff(),
  });

  const active = staff.filter((s: any) => s.active);

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Personnel</h1>
        <p className="text-slate-400 mt-1">{active.length} membres actifs</p>
      </header>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Équipe</CardTitle></CardHeader>
        {isLoading ? <Spinner /> : staff.length === 0 ? (
          <EmptyState icon="👥" title="Aucun personnel" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staff.map((member: any) => (
              <div key={member.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-slate-100">{member.name}</div>
                    <div className="text-sm text-slate-400">{member.department}</div>
                  </div>
                  <Badge variant={member.active ? 'success' : 'neutral'} dot>
                    {member.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gold">L{member.clearanceLevel}</Badge>
                  <Badge variant="info">{member.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
