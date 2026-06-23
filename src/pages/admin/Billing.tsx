import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../shared/api/client';
import { useEffect } from 'react';

const PLAN_COLORS = {
  TRIAL: 'border-slate-500/30',
  STARTER: 'border-cyan-500/30',
  PROFESSIONAL: 'border-amber-500/50 shadow-glow-gold',
  ENTERPRISE: 'border-purple-500/30',
};

export default function BillingPage() {
  const [searchParams] = useSearchParams();

  // Toast pour retour de checkout
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Paiement réussi !', 'Votre abonnement est actif');
    }
    if (searchParams.get('canceled')) {
      toast.warning('Paiement annulé', 'Vous pouvez réessayer plus tard');
    }
  }, [searchParams]);

  const { data: plansResponse, isLoading: plansLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => api.billing.getPlans(),
  });
  const plans = plansResponse?.data || [];

  const { data: subscriptionResponse, isLoading: subLoading, refetch: refetchSub } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.billing.getSubscription(),
  });
  const subscription = subscriptionResponse?.data;

  const { data: usageResponse } = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => api.billing.getUsage(),
  });
  const usage = usageResponse?.data;

  const { data: invoicesResponse } = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.billing.getInvoices(),
  });
  const invoices = invoicesResponse?.data || [];

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.billing.createCheckout(planId),
    onSuccess: (data: any) => {
      window.location.href = data.data.url;
    },
    onError: (err: Error) => toast.error('Erreur checkout', err.message),
  });

  const portalMutation = useMutation({
    mutationFn: () => api.billing.createPortal(),
    onSuccess: (data: any) => {
      window.location.href = data.data.url;
    },
    onError: (err: Error) => toast.error('Erreur', err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.billing.cancel(),
    onSuccess: () => {
      toast.success('Annulation programmée', 'Votre abonnement se terminera à la fin de la période');
      refetchSub();
    },
    onError: (err: Error) => toast.error('Erreur', err.message),
  });

  if (plansLoading || subLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-100">💳 Facturation</h1>
          <p className="text-slate-400 mt-1">
            Plan actuel :{' '}
            <Badge variant={subscription?.status === 'ACTIVE' ? 'success' : 'warning'}>
              {subscription?.plan || 'TRIAL'}
            </Badge>
          </p>
        </div>
        {subscription?.stripeCustomerId && (
          <Button
            variant="primary"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            onClick={() => portalMutation.mutate()}
            isLoading={portalMutation.isPending}
          >
            Portail Stripe
          </Button>
        )}
      </header>

      {/* Usage actuel */}
      {usage && (
        <Card variant="glass-strong" padding="lg">
          <CardHeader><CardTitle>📊 Usage actuel vs limites</CardTitle></CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <UsageBar
              label="Chambres"
              current={usage.current.rooms}
              limit={usage.limits.rooms}
            />
            <UsageBar
              label="Staff"
              current={usage.current.staff}
              limit={usage.limits.staff}
            />
            <UsageBar
              label="API calls (mois)"
              current={usage.current.apiCalls}
              limit={usage.limits.apiCallsPerMonth}
            />
            <UsageBar
              label="Stockage (GB)"
              current={usage.current.storageGb}
              limit={usage.limits.storageGb}
            />
          </div>
        </Card>
      )}

      {/* Plans */}
      <Card variant="glass-strong" padding="lg">
        <CardHeader><CardTitle>Plans tarifaires</CardTitle></CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {plans.map((plan: any) => {
            const isCurrent = subscription?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative p-5 rounded-2xl border-2 ${
                  plan.popular ? PLAN_COLORS.PROFESSIONAL : PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS]
                } bg-slate-900/40`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gold">⭐ POPULAIRE</Badge>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-100 mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-100">
                    {plan.monthlyPrice}€
                  </span>
                  <span className="text-slate-400 text-sm">/mois</span>
                </div>

                <ul className="space-y-2 mb-6 min-h-[180px]">
                  {plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" fullWidth disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => checkoutMutation.mutate(plan.id)}
                    isLoading={checkoutMutation.isPending}
                  >
                    {plan.monthlyPrice === 0 ? 'Démarrer' : 'Choisir'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Invoices */}
      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📄 Factures</CardTitle>
            {subscription?.cancelAt && (
              <Badge variant="warning">
                ⚠️ Annulation programmée le{' '}
                {new Date(subscription.cancelAt).toLocaleDateString('fr-FR')}
              </Badge>
            )}
          </div>
        </CardHeader>

        {invoices.length === 0 ? (
          <EmptyState icon="📭" title="Aucune facture" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 border-b border-slate-700">
              <tr>
                <th className="text-left py-2">N°</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Montant</th>
                <th className="text-left py-2">Statut</th>
                <th className="text-left py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-slate-800">
                  <td className="py-3 font-mono text-slate-300">{inv.number}</td>
                  <td className="py-3 text-slate-400">
                    {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-amber-400 font-bold">
                    {Number(inv.amount).toFixed(2)} {inv.currency.toUpperCase()}
                  </td>
                  <td className="py-3">
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {inv.pdfUrl ? (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-xs hover:underline"
                      >
                        Télécharger
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Actions abonnement */}
        {subscription?.status === 'ACTIVE' && !subscription.cancelAt && (
          <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('Annuler votre abonnement à la fin de la période ?')) {
                  cancelMutation.mutate();
                }
              }}
              isLoading={cancelMutation.isPending}
            >
              Annuler l'abonnement
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Composant UsageBar
function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === -1;
  const percent = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="p-4 rounded-xl bg-slate-800/50">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-100">
          {current} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${percent}%` }} />
        </div>
      )}
      {percent > 80 && !isUnlimited && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          Proche de la limite
        </div>
      )}
    </div>
  );
}
