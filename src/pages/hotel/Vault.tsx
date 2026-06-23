import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { api } from '../../shared/api/client';
import { Lock, Plus, Fingerprint } from 'lucide-react';

export default function HotelVault() {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['hotel', 'vault'],
    queryFn: () => api.hotel.vault(),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Lock className="w-8 h-8 text-zaphir-400" />
            Coffre-Fort
          </h1>
          <p className="text-slate-400 mt-1">{docs.length} documents sous protection</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Déposer</Button>
      </header>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Documents actifs</CardTitle></CardHeader>
        {isLoading ? <Spinner /> : docs.length === 0 ? (
          <EmptyState icon="🔐" title="Aucun document" description="Le coffre est vide" />
        ) : (
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zaphir-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-zaphir-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{doc.name}</div>
                    <div className="text-sm text-slate-400">{doc.owner} • {doc.room}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{doc.category}</Badge>
                  {doc.fingerprint && (
                    <Badge variant="success" icon={<Fingerprint className="w-3 h-3" />}>Secured</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
