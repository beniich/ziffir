import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
// Note: Adapting to basic UI components since the exact internal UI library may differ
import { api } from '../shared/api/client';

const PLANS = [
  { id: 'FREE', name: 'Free', price: 0, features: ['Dashboard basique', '3 chambres', 'Email support'] },
  { id: 'PREMIUM', name: 'Premium', price: 49, popular: false, features: ['Toutes Free', '20 chambres', 'Room Service', 'Support 48h'] },
  { id: 'PLATINIUM', name: 'Platinium', price: 149, popular: true, features: ['Toutes Premium', '100 chambres', 'Analytics', 'AI Sommelier'] },
  { id: 'GOLDEN', name: 'Golden', price: 499, popular: false, features: ['Toutes Platinium', 'Illimité', 'Multi-hôtels', 'SLA 99.99%'] },
];

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      api.billing.verifySession(sessionId)
        .then(({ data }: any) => {
          if (data.paid) {
            alert(`Abonnement activé ! Plan ${data.plan}`);
          }
        })
        .catch(() => {
          alert('Vérification échouée. Contactez le support si le problème persiste');
        });
    }
  }, [sessionId]);

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => api.billing.createCheckout(plan),
    onSuccess: ({ data }: any) => {
      window.location.href = data.url;
    },
    onError: (err: any) => alert(`Erreur: ${err.message}`),
  });

  const portalMutation = useMutation({
    mutationFn: () => api.billing.createPortal(),
    onSuccess: ({ data }: any) => {
      window.location.href = data.url;
    },
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">💰 Abonnement</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`p-6 rounded-xl border ${plan.popular ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
            {plan.popular && <span className="text-xs font-bold bg-yellow-500 text-black px-2 py-1 rounded">⭐ POPULAIRE</span>}
            <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
            <div className="my-4">
              <span className="text-4xl font-bold">{plan.price}€</span>
              <span className="text-slate-400 text-sm">/mois</span>
            </div>
            <ul className="space-y-2 mb-6 min-h-[140px]">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.id === 'FREE' ? (
              <button disabled className="w-full py-2 bg-slate-700 text-slate-400 rounded cursor-not-allowed">Plan actuel</button>
            ) : (
              <button
                className={`w-full py-2 rounded font-bold ${plan.popular ? 'bg-yellow-500 text-black' : 'border border-slate-500 text-white'}`}
                onClick={() => checkoutMutation.mutate(plan.id)}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Chargement...' : 'Choisir'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <button className="text-slate-400 hover:text-white underline" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
          Gérer mon abonnement
        </button>
      </div>
    </div>
  );
}
