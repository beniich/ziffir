import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';

interface Job {
  id: string;
  title: string;
  team: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  remote: 'Full remote' | 'Hybride' | 'Paris';
  description: string;
  missions: string[];
  profile: string[];
  perks: string[];
  applyUrl: string;
}

const JOBS: Job[] = [
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    team: 'Engineering',
    location: 'Paris ou Full remote',
    type: 'CDI',
    remote: 'Full remote',
    description: 'Vous concevrez les interfaces qui équipent les plus beaux palaces du monde.',
    missions: [
      'Architecturer les nouvelles features de notre plateforme React/TypeScript',
      'Concevoir des composants UI réutilisables et accessibles',
      'Optimiser les performances (Core Web Vitals)',
      'Mentorer les devs plus juniors',
    ],
    profile: [
      '5+ ans en React/TypeScript en production',
      'Maîtrise de Vite, Framer Motion, et des design systems',
      'Sensibilité UX/UI forte',
      'Expérience avec les outils de test (Vitest, Playwright)',
    ],
    perks: ['Full remote possible', 'BSPCE', 'Budget conférences 2k€/an', 'MacBook Pro M3'],
    applyUrl: '/careers/apply/senior-frontend',
  },
  {
    id: 'backend-engineer',
    title: 'Backend Engineer (Node.js/PostgreSQL)',
    team: 'Engineering',
    location: 'Paris ou Hybride',
    type: 'CDI',
    remote: 'Hybride',
    description: 'Vous construirez les API temps réel qui orchestrent les opérations des palaces.',
    missions: [
      'Concevoir des APIs REST et WebSocket performantes',
      'Optimiser les requêtes PostgreSQL à grande échelle',
      'Mettre en place des pipelines temps réel (Socket.IO, Redis)',
      'Garantir la sécurité et la conformité RGPD',
    ],
    profile: [
      '4+ ans en Node.js/TypeScript backend',
      'Maîtrise de PostgreSQL et Prisma',
      'Expérience avec Redis, Socket.IO, ou équivalents',
      'Connaissances en architecture cloud (AWS)',
    ],
    perks: ['Hybride 2j/semaine', 'BSPCE', 'Mutuelle Alan', 'Tickets restaurant'],
    applyUrl: '/careers/apply/backend-engineer',
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer (LLM/MLOps)',
    team: 'AI',
    location: 'Paris ou Full remote',
    type: 'CDI',
    remote: 'Full remote',
    description: 'Vous développerez les IA contextuelles qui recommandent les vins et optimisent les opérations.',
    missions: [
      'Entraîner et fine-tuner des modèles LLM et ML',
      'Concevoir des pipelines MLOps (entraînement, déploiement, monitoring)',
      'Prototyper de nouvelles features IA (recommandation, prédiction)',
      'Mesurer et améliorer la qualité des modèles',
    ],
    profile: [
      '3+ ans en IA/ML appliqué en production',
      'Maîtrise de Python, PyTorch, Hugging Face',
      'Expérience avec les API OpenAI/Anthropic et le prompt engineering',
      'Connaissances en RAG et embeddings',
    ],
    perks: ['Full remote', 'Budget GPU cloud', 'Veille IA financée', 'Publications encouragées'],
    applyUrl: '/careers/apply/ai-engineer',
  },
  {
    id: 'product-designer',
    title: 'Senior Product Designer',
    team: 'Design',
    location: 'Paris',
    type: 'CDI',
    remote: 'Paris',
    description: 'Vous définirez l\'expérience de notre plateforme pour les directeurs de palaces.',
    missions: [
      'Mener les recherches utilisateurs (interviews, tests)',
      'Concevoir les flows complexes (War Room, Hospitality Manager)',
      'Faire évoluer notre design system',
      'Collaborer étroitement avec engineering et product',
    ],
    profile: [
      '5+ ans en product design B2B/SaaS',
      'Portfolio démontrant des produits complexes',
      'Maîtrise de Figma et des principes d\'accessibilité',
      'Expérience en design system',
    ],
    perks: ['Design system dédié', 'Budget outils 1k€/an', 'Visites palaces clients', 'Swag premium'],
    applyUrl: '/careers/apply/product-designer',
  },
  {
    id: 'sales-bdm',
    title: 'Business Developer Hôtellerie de Luxe',
    team: 'Sales',
    location: 'Paris + déplacements',
    type: 'CDI',
    remote: 'Paris',
    description: 'Vous développerez notre portefeuille de palaces, hôtels 5★, et groupes hôteliers en Europe.',
    missions: [
      'Prospecter les palaces et groupes hôteliers haut de gamme',
      'Conduire les démos personnalisées',
      'Négocier les contrats Enterprise (6-7 chiffres)',
      'Participer aux salons (IHF, ITB, etc.)',
    ],
    profile: [
      '5+ ans en vente B2B dans l\'hôtellerie de luxe',
      'Réseau existant chez les directeurs d\'hôtels 5★',
      'Excellente présentation et sens du relationnel',
      'Anglais courant',
    ],
    perks: ['Variable déplafonné', 'BSPCE', 'Déplacements haut de gamme', 'Tickets premium'],
    applyUrl: '/careers/apply/sales-bdm',
  },
  {
    id: 'customer-success',
    title: 'Customer Success Manager',
    team: 'Customer Success',
    location: 'Paris + remote',
    type: 'CDI',
    remote: 'Hybride',
    description: 'Vous serez le garant de la satisfaction et de la rétention de nos clients palaces.',
    missions: [
      'Onboarder les nouveaux clients (formation, configuration)',
      'Suivre la santé des comptes et anticiper le churn',
      'Collecter les feedbacks et prioriser les demandes',
      'Organiser les QBR (Quarterly Business Reviews)',
    ],
    profile: [
      '3+ ans en Customer Success B2B',
      'Expérience en hôtellerie ou SaaS complexe',
      'Excellente communication écrite et orale',
      'Anglais bilingue',
    ],
    perks: ['Variable sur rétention', 'BSPCE', 'Visites clients sur site', 'Formation continue'],
    applyUrl: '/careers/apply/customer-success',
  },
  {
    id: 'stage-product',
    title: 'Stage Product Manager (6 mois)',
    team: 'Product',
    location: 'Paris',
    type: 'Stage',
    remote: 'Paris',
    description: 'Vous travaillerez en binôme avec un Senior PM sur la roadmap produit.',
    missions: [
      'Mener des user researches',
      'Rédiger les specs fonctionnelles',
      'Suivre les KPIs produit',
      'Coordonner avec engineering et design',
    ],
    profile: [
      'Étudiant(e) en école de commerce ou d\'ingénieur (M1/M2)',
      'Premier expérience en startup ou conseil',
      'Esprit analytique et orienté utilisateur',
      'Anglais courant',
    ],
    perks: ['Indemnité stage 1500€/mois', 'BSPCE si conversion', 'Mentorat Senior PM', 'Possibilité CDI'],
    applyUrl: '/careers/apply/stage-product',
  },
];

const PERKS_GLOBAL = [
  { icon: '💰', title: 'BSPCE', description: 'Tous les employés sont actionnaires de Ziffir' },
  { icon: '🏥', title: 'Mutuelle Alan', description: 'Couverture premium pour vous et votre famille' },
  { icon: '🏠', title: 'Full remote', description: 'Travaillez d\'où vous voulez, avec 2 jours/semaine au choix' },
  { icon: '📚', title: 'Veille & formation', description: '2k€/an de budget conférences, livres, et formations' },
  { icon: '🌴', title: 'Congés illimités', description: 'Liberté de prendre le temps dont vous avez besoin' },
  { icon: '🛠️', title: 'Matériel premium', description: 'MacBook Pro M3, écran 4K, et tout le nécessaire' },
  { icon: '✈️', title: 'Offsites', description: '2-3 séminaires d\'équipe par an dans des lieux d\'exception' },
  { icon: '👶', title: 'Parentalité', description: '16 semaines de congé maternité/paternité, retour flexible' },
  { icon: '🍽️', title: 'Tickets resto', description: 'Swile 9€/jour, 60% pris en charge' },
];

const VALUES_CULTURE = [
  { icon: '🚀', title: 'Excellence pragmatique', description: 'On cherche la perfection, mais on ship' },
  { icon: '🤝', title: 'Ownership', description: 'Chacun est responsable de son impact' },
  { icon: '📖', title: 'Transparence', description: 'On partage tout, y compris les chiffres difficiles' },
  { icon: '🎉', title: 'Plaisir', description: 'Le travail doit rester fun' },
];

export function CareersPage() {
  const [filter, setFilter] = useState<'all' | string>('all');
  
  const filteredJobs = filter === 'all' 
    ? JOBS 
    : JOBS.filter(j => j.team === filter);
  
  const teams = Array.from(new Set(JOBS.map(j => j.team)));
  
  return (
    <PublicLayout
      title="Carrières"
      description="Rejoignez Ziffir : construisons l'avenir de l'hôtellerie de luxe. Postes en engineering, design, product, sales."
    >
      <SEO 
        title="Carrières"
        description="Rejoignez Ziffir : 8 postes ouverts en engineering, design, AI, product, sales. Full remote possible, BSPCE, mutuelle premium."
        url="/careers"
        jsonLd={careersJsonLd}
      />

      <main id="main-content" className="careers-page p-6 max-w-7xl mx-auto text-slate-200">
        <Breadcrumb items={[
          { label: 'Accueil', path: '/' },
          { label: 'Carrières' },
        ]} />

        {/* HERO */}
        <motion.section 
          className="careers-hero text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-mono text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/10">{JOBS.length} postes ouverts</span>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-6">Rejoignez l'aventure Ziffir</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Nous réinventons l'hôtellerie de luxe. Si vous voulez avoir un 
            impact concret sur l'expérience de milliers de clients dans les 
            plus beaux palaces du monde, vous êtes au bon endroit.
          </p>
          <a href="#openings" className="inline-block px-8 py-4 bg-[#D4AF37] text-slate-950 rounded-xl font-bold hover:bg-[#c19a6b] transition shadow-lg">
            Voir les postes ouverts ↓
          </a>
        </motion.section>

        {/* CULTURE & PERKS */}
        <motion.section 
          className="careers-culture py-20 border-t border-slate-800/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-serif font-bold text-center mb-16">Pourquoi nous rejoindre ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {VALUES_CULTURE.map((v, i) => (
              <motion.div 
                key={v.title}
                className="bg-slate-800/20 border border-slate-700/50 p-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-slate-400">{v.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERKS_GLOBAL.map((p, i) => (
              <motion.div 
                key={p.title}
                className="flex items-start gap-4 p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="text-3xl">{p.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-200">{p.title}</h4>
                  <p className="text-sm text-slate-400">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* OFFRES */}
        <section id="openings" className="careers-openings py-20 border-t border-slate-800/50">
          <header className="mb-12 text-center">
            <h2 className="text-3xl font-serif font-bold mb-8">Postes ouverts ({filteredJobs.length})</h2>
            
            <div className="flex flex-wrap justify-center gap-3" role="tablist">
              <button type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full border transition ${filter === 'all' ? 'bg-white text-black border-white' : 'border-slate-700 hover:border-slate-500 text-slate-300'}`}
                role="tab"
                aria-selected={filter === 'all'}
              >
                Tous
              </button>
              {teams.map(team => (
                <button type="button"
                  key={team}
                  onClick={() => setFilter(team)}
                  className={`px-4 py-2 rounded-full border transition ${filter === team ? 'bg-white text-black border-white' : 'border-slate-700 hover:border-slate-500 text-slate-300'}`}
                  role="tab"
                  aria-selected={filter === team}
                >
                  {team}
                </button>
              ))}
            </div>
          </header>
          
          {filteredJobs.length === 0 ? (
            <p className="text-center text-slate-500 italic py-10">Aucun poste dans cette catégorie pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job, i) => (
                <motion.article
                  key={job.id}
                  className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-2xl flex flex-col hover:border-[#D4AF37]/50 transition"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <header className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] px-2 py-1 bg-[#D4AF37]/10 rounded">{job.team}</span>
                    <span className="text-xs text-slate-400 px-2 py-1 border border-slate-700 rounded">{job.type}</span>
                  </header>
                  
                  <h3 className="text-2xl font-bold mb-3">{job.title}</h3>
                  <p className="text-slate-400 mb-6 flex-grow">{job.description}</p>
                  
                  <div className="flex gap-4 mb-6 text-sm text-slate-300 font-medium">
                    <span>📍 {job.location}</span>
                    <span>🏠 {job.remote}</span>
                  </div>
                  
                  <details className="mb-6 group cursor-pointer">
                    <summary className="text-[#D4AF37] font-medium hover:underline outline-none">Voir les détails</summary>
                    
                    <div className="mt-4 space-y-6 text-sm text-slate-400 pt-4 border-t border-slate-800">
                      <div>
                        <h4 className="font-bold text-slate-200 mb-2">🎯 Vos missions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.missions.map((m, idx) => <li key={idx}>{m}</li>)}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-200 mb-2">👤 Profil recherché</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.profile.map((p, idx) => <li key={idx}>{p}</li>)}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-200 mb-2">🎁 Avantages</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.perks.map((p, idx) => <li key={idx}>{p}</li>)}
                        </ul>
                      </div>
                    </div>
                  </details>
                  
                  <Link 
                    to={job.applyUrl}
                    className="w-full text-center py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition mt-auto"
                  >
                    Postuler →
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* SPONTANEOUS */}
        <motion.section 
          className="text-center py-20 bg-gradient-to-b from-transparent to-slate-900/50 rounded-3xl border border-slate-800/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-bold mb-4">Vous ne trouvez pas le poste idéal ?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Envoyez-nous une candidature spontanée. Nous sommes toujours à la 
            recherche de talents exceptionnels.
          </p>
          <Link to="/careers/apply/spontaneous" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition">
            Candidature spontanée
          </Link>
        </motion.section>
      </main>
    </PublicLayout>
  );
}

const careersJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Carrières Ziffir',
  description: 'Rejoignez l\'équipe Ziffir pour réinventer l\'hôtellerie de luxe',
  hiringOrganization: {
    '@type': 'Organization',
    name: 'Ziffir SAS',
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
  },
  employmentType: 'FULL_TIME',
};
