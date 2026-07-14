import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const trialJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Offer',
  name: 'Essai gratuit Ziffir - 14 jours',
  description: 'Testez Ziffir gratuitement pendant 14 jours sans carte bancaire',
  price: '0',
  priceCurrency: 'EUR',
  availability: 'https://schema.org/InStock',
  url: 'https://www.ziffir.com/trial',
  validFrom: '2024-01-01',
  priceValidUntil: '2030-12-31',
};

const benefits = [
  { icon: '🎯', title: 'Accès complet Platinium', desc: 'Pendant 14 jours, vous avez accès à toutes les fonctionnalités du plan Platinium (149€/mois) : domotique, room service, arrivées VIP, cave IA, hospitality manager.' },
  { icon: '💳', title: 'Sans carte bancaire', desc: 'Aucune carte requise pour démarrer. Vous ne serez débité que si vous décidez de continuer après les 14 jours.' },
  { icon: '⚡', title: 'Setup en 5 minutes', desc: 'Créez votre hôtel, ajoutez vos chambres, invitez votre équipe. Ziffir est opérationnel en 5 minutes chrono.' },
  { icon: '👥', title: '3 utilisateurs inclus', desc: 'Invitez jusqu\'à 3 collaborateurs pour tester ensemble. Aucune limitation sur les rôles.' },
  { icon: '🏨', title: '5 chambres configurables', desc: 'Configurez jusqu\'à 5 suites pour tester la domotique, le room service, et les scénarios personnalisés.' },
  { icon: '🎓', title: 'Onboarding personnalisé', desc: 'Un spécialiste Ziffir vous contacte sous 24h pour vous accompagner dans la configuration optimale.' },
];

const faqs = [
  { q: 'Dois-je fournir un moyen de paiement ?', a: 'Non. Aucun moyen de paiement n\'est requis pour démarrer l\'essai gratuit. Vous ne serez invité à saisir vos informations de facturation qu\'au moment où vous décidez de continuer.' },
  { q: 'Que se passe-t-il à la fin des 14 jours ?', a: 'Votre compte passe en mode lecture seule. Vous pouvez exporter toutes vos données au format JSON à tout moment. Si vous décidez de continuer, choisissez simplement un plan.' },
  { q: 'Puis-je prolonger mon essai ?', a: 'Oui, sur demande à hello@ziffir.com. Nous offrons généralement 14 jours supplémentaires pour les établissements qui ont besoin de plus de temps.' },
  { q: 'Mes données sont-elles conservées après l\'essai ?', a: 'Oui, votre compte et vos données sont conservés 30 jours après la fin de l\'essai. Passé ce délai, ils sont supprimés conformément à notre politique de confidentialité.' },
  { q: 'Y a-t-il une démo personnalisée disponible ?', a: 'Oui, pour les groupes hôteliers et les établissements de plus de 100 chambres, nous proposons des démos personnalisées de 30 minutes avec un de nos experts. Demandez une démo via la page Contact.' },
];

export function TrialPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout title="Essai gratuit | Ziffir" description="Testez Ziffir gratuitement pendant 14 jours. Toutes les fonctionnalités, sans carte bancaire, sans engagement. Setup en 5 minutes." jsonLd={trialJsonLd}>
      <div className="ambient-glow glow-1" /><div className="ambient-glow glow-2" />

      {/* HERO */}
      <section className="text-center py-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">14 jours offerts</span>
          <h1 className="text-5xl font-extrabold text-slate-100 mb-6 leading-tight">14 jours. Toutes les fonctionnalités.<br/><span className="text-[#D4AF37]">Zéro engagement.</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Créez votre compte en 2 minutes et découvrez comment Ziffir transforme votre établissement.</p>
        </motion.div>
      </section>

      {/* BENEFITS */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">Ce qui est inclus dans votre essai</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.article key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 bg-slate-900/40 border border-slate-700/40 rounded-2xl hover:border-[#D4AF37]/30 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{b.icon}</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{b.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* BIG CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-24 text-center">
        <div className="p-10 bg-gradient-to-b from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-3xl relative overflow-hidden">
          {/* Noise effect removed to fix build error */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"></div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4 relative z-10">Démarrez votre essai maintenant</h2>
          <p className="text-slate-400 mb-8 relative z-10 max-w-lg mx-auto">Vous avez juste besoin d'une adresse email professionnelle. Le reste peut attendre.</p>
          <Link to="/register" className="btn-primary btn-marketing btn-marketing-lg glow-btn relative z-10">Créer mon hôtel →</Link>
          <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest relative z-10 font-mono">Aucun engagement · Annulation en 1 clic · Export JSON</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
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
    </PublicLayout>
  );
}
