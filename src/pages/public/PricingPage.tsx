import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Ziffir',
  description: 'Plateforme SaaS pour hôtellerie de luxe',
  brand: { '@type': 'Brand', name: 'Ziffir' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '49',
    highPrice: '499',
    offerCount: 4,
    offers: [
      { '@type': 'Offer', name: 'Premium', price: '49' },
      { '@type': 'Offer', name: 'Platinium', price: '149' },
      { '@type': 'Offer', name: 'Golden', price: '499' },
    ],
  },
};

const plans = [
  {
    name: 'Premium',
    price: '49',
    desc: 'Pour les hôtels boutique et établissements 4★.',
    featured: false,
    href: '/register?plan=PREMIUM',
    features: ['Jusqu\'à 50 chambres','5 utilisateurs','Suite Controls','Room Service','Ledger basique','Support email (24h)','Mises à jour incluses'],
  },
  {
    name: 'Platinium',
    price: '149',
    desc: 'Pour les palaces et hôtels 5★ exigeants.',
    featured: true,
    href: '/register?plan=PLATINIUM',
    features: ['Tout Premium','Jusqu\'à 200 chambres','20 utilisateurs','Wine Cellar IA','Arrivals VIP','Hospitality Manager','Support prioritaire (4h)','Account manager dédié'],
  },
  {
    name: 'Golden',
    price: '499',
    desc: 'Pour les groupes hôteliers et chaînes de luxe.',
    featured: false,
    href: '/register?plan=GOLDEN',
    features: ['Tout Platinium','Chambres illimitées','Utilisateurs illimités','Vault (coffre-fort)','Channel Sync','API publique + webhooks','SSO SAML / OIDC','SLA 99.9% garanti'],
  },
];

const faqs = [
  { q: 'Y a-t-il des frais d\'installation ?', a: 'Non. Ziffir est 100% cloud, accessible immédiatement après inscription. Aucun frais d\'installation, aucun matériel à acheter.' },
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. L\'upgrade prend effet immédiatement avec prorata calculé automatiquement. Un downgrade prend effet à la fin de la période en cours.' },
  { q: 'Comment fonctionne la facturation ?', a: 'Facturation mensuelle ou annuelle. La facturation annuelle bénéficie de 15% de réduction. Paiements sécurisés via Stripe (Visa, Mastercard, Amex, SEPA).' },
  { q: 'Que se passe-t-il si je dépasse les limites ?', a: 'Vous recevez une notification à 80% et 100% d\'utilisation. En cas de dépassement, un upgrade automatique vous est proposé. Aucune interruption de service.' },
  { q: 'Y a-t-il une période d\'engagement ?', a: 'Non. Annulez à tout moment et conservez l\'accès jusqu\'à la fin de la période payée. Vos données sont exportables en JSON à tout moment.' },
];

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout title="Tarifs | Ziffir" description="Tarifs transparents pour les palaces et hôtels de luxe. Plan Premium 49€/mois, Platinium 149€/mois, Golden 499€/mois. 14 jours d'essai gratuit." jsonLd={pricingJsonLd}>
      <div className="ambient-glow glow-1" /><div className="ambient-glow glow-2" />

      {/* HERO */}
      <section className="text-center py-24 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Tarification</span>
          <h1 className="text-5xl font-extrabold text-slate-100 mb-6">Tarifs transparents.<br/><span className="text-[#D4AF37]">Sans frais cachés.</span></h1>
          <p className="text-xl text-slate-400">Choisissez le plan adapté à votre établissement. Changez ou annulez à tout moment.</p>
        </motion.div>
      </section>

      {/* PLANS */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <motion.article key={plan.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${plan.featured ? 'bg-gradient-to-b from-[#D4AF37]/10 to-transparent border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.12)] scale-105' : 'bg-slate-900/40 border-slate-700/40'}`}>
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#D4AF37] text-slate-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Le plus populaire</span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-100 mb-1">{plan.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-slate-100">{plan.price}€</span>
                <span className="text-slate-500 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2 text-slate-300 text-sm">
                    <span className="text-[#D4AF37] shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to={plan.href} className={`w-full text-center py-3 rounded-xl font-bold transition ${plan.featured ? 'bg-[#D4AF37] text-slate-950 hover:bg-[#c19a6b] shadow-lg' : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>
                Choisir {plan.name}
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Enterprise */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-8 p-8 bg-slate-900/40 border border-slate-700/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">Enterprise — Sur devis</h2>
            <p className="text-slate-400">Multi-propriétés, déploiement on-premise, intégrations sur mesure, formation équipes, SLA personnalisé.</p>
          </div>
          <a href="mailto:contact@ziffir.com" className="shrink-0 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-6 py-3 rounded-xl font-bold transition">Nous contacter →</a>
        </motion.div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-10">Comparaison détaillée</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-semibold">Fonctionnalité</th>
                {['Premium','Platinium','Golden'].map(n=><th key={n} className="p-4 text-center text-slate-300 font-bold">{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Chambres','Jusqu\'à 50','Jusqu\'à 200','Illimité'],
                ['Utilisateurs','5','20','Illimité'],
                ['Suite Controls','✓','✓','✓'],
                ['Room Service','✓','✓','✓'],
                ['Wine Cellar IA','—','✓','✓'],
                ['Arrivals VIP','—','✓','✓'],
                ['Hospitality Manager','—','✓','✓'],
                ['Vault','—','—','✓'],
                ['Channel Sync','—','—','✓'],
                ['API publique','—','Limitée','Complète'],
                ['SSO','—','—','✓'],
                ['SLA','Best effort','99.5%','99.9%'],
                ['Support','Email (24h)','Prioritaire (4h)','Dédié (1h)'],
              ].map(([feat,...vals])=>(
                <tr key={feat} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                  <td className="p-4 text-slate-400 font-medium">{feat}</td>
                  {vals.map((v,i)=><td key={i} className={`p-4 text-center ${v==='✓'?'text-green-400':v==='—'?'text-slate-600':'text-slate-300'}`}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-10">Questions fréquentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-700/50 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left text-slate-200 font-medium hover:bg-slate-800/30 transition">
                {faq.q}
                <span className="text-[#D4AF37] text-lg shrink-0 ml-4">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-4 border-t border-[#D4AF37]/10">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Prêt à transformer votre établissement ?</h2>
        <Link to="/register" className="btn-primary btn-marketing btn-marketing-lg glow-btn">Démarrer 14 jours gratuits</Link>
      </section>
    </PublicLayout>
  );
}
