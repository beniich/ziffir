import { motion } from 'framer-motion';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';
import { NewsletterWidget } from '../../components/newsletter/NewsletterWidget';

type ChangeType = 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';

interface Change {
  type: ChangeType;
  description: string;
}

interface Release {
  version: string;
  date: string;
  name?: string;
  highlights: string[];
  changes: Change[];
}

const RELEASES: Release[] = [
  {
    version: '1.4.0',
    date: '2024-12-01',
    name: 'Wine Cellar IA & Roadmap publique',
    highlights: [
      'Recommandations de vins contextuelles par IA',
      'Roadmap publique avec système de votes',
      'Nouveau design system accessible (WCAG AA)',
    ],
    changes: [
      { type: 'feature', description: 'Wine Cellar : recommandations IA selon menu, météo, occasion' },
      { type: 'feature', description: 'Roadmap publique : votez pour vos fonctionnalités préférées' },
      { type: 'feature', description: 'Page Carrières avec 8 postes ouverts' },
      { type: 'feature', description: 'Composant CookieSettingsButton dans le profil' },
      { type: 'improvement', description: 'Performance : bundle réduit de 23% grâce au tree-shaking' },
      { type: 'improvement', description: 'Accessibilité : navigation clavier complète, skip links' },
      { type: 'security', description: 'Migration complète vers cookies HTTP-only (immunisé XSS)' },
      { type: 'security', description: 'Webhooks Slack pour alertes incidents temps réel' },
      { type: 'fix', description: 'Correction du bug de scroll sur iOS Safari 17' },
    ],
  },
  {
    version: '1.3.0',
    date: '2024-11-15',
    name: 'War Room & Arrivals VIP',
    highlights: [
      'War Room : coordination temps réel des arrivées VIP',
      'Suivi des vols en temps réel (FlightAware)',
      '6 équipes orchestrées automatiquement',
    ],
    changes: [
      { type: 'feature', description: 'Module Arrivals VIP avec planificateur de tâches intelligent' },
      { type: 'feature', description: 'War Room : dashboard manager avec alertes critiques' },
      { type: 'feature', description: 'Webhooks externes : vols, chauffeurs, météo' },
      { type: 'feature', description: 'Statut multi-hôtels pour les utilisateurs multi-propriétés' },
      { type: 'improvement', description: 'Latence Socket.IO réduite de 45% grâce à Redis adapter' },
      { type: 'improvement', description: 'Audit log : conservation étendue à 5 ans' },
      { type: 'fix', description: 'Correction de la timezone pour les hôtels hors France' },
    ],
  },
  {
    version: '1.2.0',
    date: '2024-11-01',
    name: 'Hospitality Manager',
    highlights: [
      'Control Center temps réel agrégant tous les modules',
      'Indicateur de live par hôtel',
      'KPIs temps réel',
    ],
    changes: [
      { type: 'feature', description: 'Hospitality Manager : dashboard unifié temps réel' },
      { type: 'feature', description: 'Indicateur LIVE dans le header' },
      { type: 'improvement', description: 'Refresh automatique toutes les 60 secondes' },
      { type: 'improvement', description: 'Graphiques de performances en SVG natif (zéro dépendance)' },
    ],
  },
  {
    version: '1.1.0',
    date: '2024-10-15',
    name: 'Suite Controls temps réel',
    highlights: [
      'Premier module temps réel : Suite Controls',
      'Socket.IO avec authentification JWT',
      'Optimistic locking sur les modifications',
    ],
    changes: [
      { type: 'feature', description: 'Suite Controls : température, lumière, volets, musique' },
      { type: 'feature', description: '7 scènes prédéfinies (IDLE, WELCOME, NIGHT…)' },
      { type: 'feature', description: 'Mode Do Not Disturb synchronisé' },
      { type: 'feature', description: 'Indicateur de version pour éviter les conflits' },
      { type: 'improvement', description: 'Latence moyenne < 100ms pour les updates' },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-10-01',
    name: 'Lancement public',
    highlights: [
      'Première version publique de Ziffir',
      'Authentification + multi-tenancy',
      'Plan Premium et Platinium disponibles',
    ],
    changes: [
      { type: 'feature', description: 'Inscription self-serve avec essai 14 jours' },
      { type: 'feature', description: 'Authentification JWT avec cookies HTTP-only' },
      { type: 'feature', description: 'Multi-tenancy : isolation par hôtel' },
      { type: 'feature', description: 'RBAC granulaire : 9 rôles hôtel' },
      { type: 'feature', description: 'Système d\'invitations par email' },
      { type: 'feature', description: 'Webhooks Stripe pour la facturation' },
      { type: 'security', description: 'Conformité RGPD dès le jour 1' },
    ],
  },
];

const TYPE_CONFIG: Record<ChangeType, { label: string; icon: string; color: string }> = {
  feature: { label: 'Nouvelle fonctionnalité', icon: '✨', color: '#10b981' },
  improvement: { label: 'Amélioration', icon: '⚡', color: '#3b82f6' },
  fix: { label: 'Correction', icon: '🐛', color: '#f59e0b' },
  security: { label: 'Sécurité', icon: '🔒', color: '#ef4444' },
  breaking: { label: 'Breaking change', icon: '⚠️', color: '#dc2626' },
};

export function ChangelogPage() {
  return (
    <PublicLayout
      title="Changelog"
      description="Toutes les nouveautés, améliorations, et corrections de Ziffir. Historique public des releases."
    >
      <SEO 
        title="Changelog Ziffir"
        description="Historique des releases Ziffir : nouvelles fonctionnalités, améliorations, et corrections."
        url="/changelog"
      />

      <main id="main-content" className="p-6 max-w-4xl mx-auto text-slate-200">
        <Breadcrumb items={[
          { label: 'Accueil', path: '/' },
          { label: 'Changelog' },
        ]} />

        <motion.section 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">📋 Nouveautés</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Toutes les évolutions de Ziffir. Nous publions une release majeure 
            toutes les 2 semaines et des correctifs en continu.
          </p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/ziffir/changelog" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
              ⭐ Star sur GitHub
            </a>
            <a href="/blog" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
              📝 Lire le blog
            </a>
          </div>
        </motion.section>

        {/* FEED RSS */}
        <section className="text-center mb-16 text-slate-500 text-sm">
          <p>📡 Suivez nos releases : <a href="/changelog.xml" className="text-[#D4AF37] hover:underline">flux RSS</a> · <a href="https://twitter.com/ziffir" className="text-[#D4AF37] hover:underline">@ziffir sur Twitter</a></p>
        </section>

        {/* TIMELINE */}
        <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 md:before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
          {RELEASES.map((release, i) => (
            <motion.article
              key={release.version}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#020306] bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 text-xs">
                v{release.version.split('.')[0]}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/20 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">
                      <a href={`#v${release.version}`} id={`v${release.version}`} className="hover:text-[#D4AF37] transition">
                        v{release.version}
                      </a>
                    </h2>
                    {release.version === RELEASES[0].version && (
                      <span className="text-xs font-bold px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded">Dernière version</span>
                    )}
                  </div>
                  <time dateTime={release.date} className="text-slate-500 font-mono text-sm">
                    {new Date(release.date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </time>
                </header>
                
                {release.name && <h3 className="text-xl font-bold text-[#D4AF37] mb-4">{release.name}</h3>}
                
                {release.highlights.length > 0 && (
                  <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-300 mb-2">🎯 Points clés</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      {release.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Détails ({release.changes.length})</h4>
                  <ul className="space-y-3">
                    {release.changes.map((change, idx) => {
                      const config = TYPE_CONFIG[change.type];
                      return (
                        <li key={idx} className="flex items-start gap-3 text-slate-400 text-sm">
                          <span 
                            className="inline-flex items-center justify-center w-6 h-6 rounded shrink-0 bg-slate-800"
                            title={config.label}
                          >
                            {config.icon}
                          </span>
                          <span className="pt-0.5">{change.description}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* NOTIFICATIONS */}
        <motion.section 
          className="mt-24 p-8 bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-xl mx-auto">
            <NewsletterWidget source="changelog" title="Soyez notifié des nouvelles versions" description="Recevez un email à chaque release majeure." />
          </div>
        </motion.section>
      </main>
    </PublicLayout>
  );
}
