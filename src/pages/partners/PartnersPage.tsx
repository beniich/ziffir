import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';
import { NewsletterWidget } from '../../components/newsletter/NewsletterWidget';

const TIERS = [
  {
    name: 'Revendeur',
    icon: '🤝',
    commission: '15%',
    description: 'Idéal pour les consultants indépendants et agences digitales.',
    benefits: [
      'Commission 15% récurrente à vie',
      'Accès au portail partenaire',
      'Formations certifiantes',
      'Support email dédié',
      'Co-marketing limité',
    ],
    requirements: ['Minimum 2 clients/an', 'Certification Level 1'],
    cta: 'Devenir Revendeur',
    color: '#64748b',
  },
  {
    name: 'Gold Partner',
    icon: '⭐',
    commission: '20%',
    description: 'Pour les intégrateurs PMS et sociétés de conseil hôtelier.',
    benefits: [
      'Commission 20% récurrente à vie',
      'Portail partenaire avancé',
      'Sandbox de développement',
      'Support téléphonique prioritaire',
      'Co-marketing étendu',
      'Listing sur notre site',
      'Webinaires partenaires mensuels',
    ],
    requirements: ['Minimum 5 clients/an', 'Certification Level 2', 'Référence client'],
    cta: 'Devenir Gold Partner',
    color: '#D4AF37',
    featured: true,
  },
  {
    name: 'Platinum Partner',
    icon: '💎',
    commission: '25%',
    description: 'Pour les grandes intégrateurs et groupes hôteliers.',
    benefits: [
      'Commission 25% récurrente à vie',
      'API partenaire dédiée',
      'Sandbox multi-environnements',
      'Account manager dédié',
      'Co-développement features',
      'Co-branding possible',
      'Événements VIP exclusifs',
      'White-label disponible',
    ],
    requirements: ['Minimum 15 clients/an', 'Certification Platinum', 'Audit annuel'],
    cta: 'Contacter notre équipe',
    color: '#94a3b8',
  },
];

const CURRENT_PARTNERS = [
  { name: 'Opera Cloud PMS', logo: '🏨', category: 'PMS Integration' },
  { name: 'Mews Systems', logo: '🔗', category: 'PMS Integration' },
  { name: 'Apaleo', logo: '⚙️', category: 'PMS Integration' },
  { name: 'Duetto', logo: '📊', category: 'Revenue Management' },
  { name: 'ReviewPro', logo: '⭐', category: 'Guest Experience' },
  { name: 'Artyzen Hospitality', logo: '🌟', category: 'Gold Partner' },
];

const FAQS = [
  {
    q: 'Comment fonctionne la commission ?',
    a: 'Vous recevez votre commission récurrente chaque mois, aussi longtemps que votre client est abonné. Elle est calculée sur le montant HT de l\'abonnement mensuel.',
  },
  {
    q: 'Y a-t-il un minimum d\'engagement ?',
    a: 'Non, pas de minimum d\'engagement. Vous pouvez rejoindre le programme et commencer à recommander Ziffir dès aujourd\'hui.',
  },
  {
    q: 'Comment suivre mes commissions ?',
    a: 'Vous disposez d\'un portail partenaire avec un tableau de bord en temps réel : clients actifs, commissions dues, historique des paiements.',
  },
  {
    q: 'Quand sont versées les commissions ?',
    a: 'Les commissions sont versées le 1er de chaque mois par virement SEPA pour les commissions du mois précédent.',
  },
];

export function PartnersPage() {
  return (
    <PublicLayout
      title="Programme Partenaires"
      description="Devenez partenaire Ziffir : commission 20% récurrente, support dédié, co-marketing. Intégrateurs PMS, consultants hôteliers, revendeurs."
    >
      <SEO
        title="Programme Partenaires Ziffir"
        description="Rejoignez notre réseau de partenaires : 20% de commission récurrente, support dédié, co-marketing. Idéal pour intégrateurs PMS et consultants hôteliers."
        url="/partners"
      />

      <main id="main-content" className="max-w-6xl mx-auto px-6 py-12 text-slate-200">
        <Breadcrumb items={[
          { label: 'Accueil', path: '/' },
          { label: 'Partenaires' },
        ]} />

        {/* HERO */}
        <motion.section
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-semibold rounded-full border border-[#D4AF37]/20 mb-6">
            🤝 Programme Partenaires 2025
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Grandissez avec Ziffir
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Rejoignez notre réseau de partenaires certifiés et touchez jusqu'à{' '}
            <strong className="text-[#D4AF37]">25% de commission récurrente</strong>{' '}
            sur chaque client que vous nous apportez.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#apply" className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c19a6b] transition shadow-lg">
              Rejoindre le programme →
            </a>
            <a href="mailto:partners@ziffir.com" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
              Parler à notre équipe
            </a>
          </div>

          {/* Chiffres clés */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[
              { value: '47', label: 'Partenaires actifs' },
              { value: '25%', label: 'Commission max.' },
              { value: '€0', label: 'Frais d\'entrée' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* TIERS */}
        <section className="py-20" aria-labelledby="tiers-heading">
          <h2 id="tiers-heading" className="text-3xl font-serif font-bold text-center text-white mb-4">Niveaux de partenariat</h2>
          <p className="text-center text-slate-400 mb-12">Choisissez le niveau adapté à votre activité</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TIERS.map((tier, i) => (
              <motion.article
                key={tier.name}
                className={`relative p-8 rounded-3xl border ${tier.featured ? 'border-[#D4AF37]/40 bg-gradient-to-b from-[#D4AF37]/5 to-transparent' : 'border-slate-700/50 bg-slate-800/20'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full">
                    LE PLUS POPULAIRE
                  </span>
                )}
                <header className="mb-6">
                  <span className="text-3xl">{tier.icon}</span>
                  <h3 className="text-xl font-bold text-white mt-2">{tier.name}</h3>
                  <p className="text-4xl font-bold mt-3" style={{ color: tier.color }}>{tier.commission}</p>
                  <p className="text-sm text-slate-500">commission récurrente</p>
                  <p className="text-slate-400 text-sm mt-3">{tier.description}</p>
                </header>

                <ul className="space-y-2.5 mb-8">
                  {tier.benefits.map(b => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-slate-900/50 rounded-xl mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prérequis</p>
                  <ul className="space-y-1">
                    {tier.requirements.map(r => (
                      <li key={r} className="text-xs text-slate-500 flex items-center gap-2">
                        <span>·</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#apply"
                  className={`block w-full text-center py-3 rounded-xl font-bold transition ${
                    tier.featured
                      ? 'bg-[#D4AF37] text-black hover:bg-[#c19a6b]'
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {tier.cta}
                </a>
              </motion.article>
            ))}
          </div>
        </section>

        {/* PARTENAIRES ACTUELS */}
        <section className="py-16 border-t border-slate-800" aria-labelledby="current-partners-heading">
          <h2 id="current-partners-heading" className="text-2xl font-serif font-bold text-center text-white mb-10">Nos partenaires de confiance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {CURRENT_PARTNERS.map(partner => (
              <div key={partner.name} className="flex items-center gap-4 p-5 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
                <span className="text-3xl">{partner.logo}</span>
                <div>
                  <p className="font-medium text-white">{partner.name}</p>
                  <p className="text-xs text-slate-500">{partner.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-slate-800" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-serif font-bold text-center text-white mb-10">Questions fréquentes</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="group p-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-white list-none">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform text-slate-400">▾</span>
                </summary>
                <p className="mt-4 text-slate-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section id="apply" className="py-16 border-t border-slate-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center text-white mb-4">Rejoindre le programme</h2>
            <p className="text-center text-slate-400 mb-10">Nous vous répondrons dans les 48 heures ouvrées.</p>

            <form
              className="space-y-6 p-8 bg-slate-800/20 border border-slate-700/50 rounded-3xl"
              onSubmit={e => { e.preventDefault(); alert('Candidature envoyée ! Nous vous contacterons sous 48h.'); }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="partner-name" className="block text-sm text-slate-400 mb-1.5">Nom complet *</label>
                  <input id="partner-name" required type="text" placeholder="Jean Dupont"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none transition" />
                </div>
                <div>
                  <label htmlFor="partner-company" className="block text-sm text-slate-400 mb-1.5">Société *</label>
                  <input id="partner-company" required type="text" placeholder="Hôtel Excellence SAS"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label htmlFor="partner-email" className="block text-sm text-slate-400 mb-1.5">Email professionnel *</label>
                <input id="partner-email" required type="email" placeholder="contact@excellence.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none transition" />
              </div>
              <div>
                <label htmlFor="partner-tier" className="block text-sm text-slate-400 mb-1.5">Niveau souhaité *</label>
                <select id="partner-tier" required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:outline-none transition">
                  <option value="">Choisir un niveau…</option>
                  {TIERS.map(t => <option key={t.name} value={t.name}>{t.name} — {t.commission}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="partner-clients" className="block text-sm text-slate-400 mb-1.5">Nombre de clients hôteliers potentiels</label>
                <select id="partner-clients"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:outline-none transition">
                  <option value="1-2">1-2 clients</option>
                  <option value="3-5">3-5 clients</option>
                  <option value="6-15">6-15 clients</option>
                  <option value="15+">15+ clients</option>
                </select>
              </div>
              <div>
                <label htmlFor="partner-message" className="block text-sm text-slate-400 mb-1.5">Présentez votre activité</label>
                <textarea id="partner-message" rows={4}
                  placeholder="Décrivez votre activité, vos clients type, et comment vous envisagez le partenariat…"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none transition resize-none" />
              </div>
              <button type="submit"
                className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c19a6b] transition shadow-lg text-lg">
                Envoyer ma candidature →
              </button>
              <p className="text-xs text-center text-slate-500">
                En soumettant ce formulaire, vous acceptez notre{' '}
                <Link to="/legal/privacy" className="underline hover:text-slate-300">politique de confidentialité</Link>.
              </p>
            </form>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="py-16 border-t border-slate-800">
          <div className="max-w-xl mx-auto">
            <NewsletterWidget
              source="partners"
              title="📧 Newsletter Partenaires"
              description="Recevez les nouvelles du programme, les mises à jour tarifaires, et les invitations aux webinaires."
            />
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
