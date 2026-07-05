import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';

const INTEGRATIONS = [
  {
    name: 'Mews',
    category: 'PMS',
    description: 'Synchronisation bidirectionnelle avec Mews PMS',
    logo: '/integrations/mews.svg',
    status: 'available',
    features: ['Sync réservations', 'Push check-in', 'Loyalty mapping'],
  },
  {
    name: 'Cloudbeds',
    category: 'PMS',
    description: 'Webhooks temps réel avec Cloudbeds',
    logo: '/integrations/cloudbeds.svg',
    status: 'available',
  },
  {
    name: 'Opera (Oracle)',
    category: 'PMS',
    description: 'Connecteur Opera Cloud via OPERA WebSocket API',
    logo: '/integrations/opera.svg',
    status: 'beta',
  },
  {
    name: 'Stripe',
    category: 'Payment',
    description: 'Paiements et facturation',
    logo: '/integrations/stripe.svg',
    status: 'available',
  },
  {
    name: 'FlightAware',
    category: 'External',
    description: 'Suivi des vols en temps réel',
    logo: '/integrations/flightaware.svg',
    status: 'available',
  },
  {
    name: 'Slack',
    category: 'Communication',
    description: 'Notifications incidents et alertes',
    logo: '/integrations/slack.svg',
    status: 'available',
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    description: 'Sync profils guests et marketing',
    logo: '/integrations/hubspot.svg',
    status: 'roadmap',
  },
  {
    name: 'Zapier',
    category: 'Automation',
    description: 'Connectez 5000+ apps sans code',
    logo: '/integrations/zapier.svg',
    status: 'roadmap',
  },
];

function Section({ title, items }: { title: string; items: typeof INTEGRATIONS }) {
  if (items.length === 0) return null;
  
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((integration, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#111318] border border-white/10 rounded-xl p-6 hover:border-[#D4AF37] transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔌</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{integration.name}</h3>
                <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">{integration.category}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">{integration.description}</p>
            {integration.features && (
              <ul className="text-xs text-slate-500 space-y-1">
                {integration.features.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function IntegrationsPage() {
  const available = INTEGRATIONS.filter(i => i.status === 'available');
  const beta = INTEGRATIONS.filter(i => i.status === 'beta');
  const roadmap = INTEGRATIONS.filter(i => i.status === 'roadmap');
  
  return (
    <PublicLayout title="Intégrations" description="Connectez Ziffir à votre écosystème : PMS, paiements, vols, communication.">
      <SEO title="Intégrations Ziffir" description="Mews, Cloudbeds, Opera, Stripe, FlightAware, Slack : connectez Ziffir à votre stack existant." url="/integrations" />
      
      <main id="main-content" className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <section className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🔌 Intégrations
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Ziffir se connecte à votre écosystème existant : PMS, paiements, vols, communication. Pas besoin de tout remplacer.
          </motion.p>
        </section>
        
        <Section title="✅ Disponibles" items={available} />
        <Section title="🚧 Bêta" items={beta} />
        <Section title="📅 Roadmap" items={roadmap} />
        
        <section className="mt-20 text-center bg-[#111318] border border-white/10 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-4">Besoin d'une intégration spécifique ?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Notre API publique vous permet de connecter Ziffir à n'importe quel système de manière fluide et sécurisée.</p>
          <Link to="/docs/api" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">
            Voir la documentation API →
          </Link>
        </section>
      </main>
    </PublicLayout>
  );
}
