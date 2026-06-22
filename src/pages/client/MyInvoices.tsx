import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../shared/api/client';

export default function MyInvoices() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client', 'invoices'],
    queryFn: () => api.client.myInvoices(),
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Mes Factures</h1>

      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Historique de facturation</CardTitle></CardHeader>

        {isLoading ? (
          <Spinner variant="spinner" />
        ) : invoices.length === 0 ? (
          <EmptyState icon="💳" title="Aucune facture" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 border-b border-slate-700">
              <tr>
                <th className="text-left py-2">N°</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Montant</th>
                <th className="text-left py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-slate-800">
                  <td className="py-3 text-slate-100">{inv.id.slice(0, 8)}</td>
                  <td className="py-3 text-slate-400">{new Date(inv.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 text-zaphir-400 font-bold">{inv.total?.toFixed(2)}€</td>
                  <td className="py-3"><Badge variant="success">Payée</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
