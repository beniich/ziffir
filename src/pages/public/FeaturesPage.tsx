import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const featuresJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Fonctionnalités Ziffir',
  description: 'Liste complète des fonctionnalités de la plateforme Ziffir',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Domotique intelligente des suites', url: 'https://www.ziffir.com/features#suite-controls' },
    { '@type': 'ListItem', position: 2, name: 'Room service temps réel', url: 'https://www.ziffir.com/features#room-service' },
    { '@type': 'ListItem', position: 3, name: 'Orchestration des arrivées VIP', url: 'https://www.ziffir.com/features#arrivals' },
    { '@type': 'ListItem', position: 4, name: 'Cave à vin IA', url: 'https://www.ziffir.com/features#wine-cellar' },
    { '@type': 'ListItem', position: 5, name: 'Ledger auditable', url: 'https://www.ziffir.com/features#ledger' },
    { '@type': 'ListItem', position: 6, name: 'Hospitality Manager', url: 'https://www.ziffir.com/features#hospitality' },
    { '@type': 'ListItem', position: 7, name: 'Sécurité et conformité', url: 'https://www.ziffir.com/features#security' },
  ],
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

interface Feature { id: string; num: string; icon: string; title: string; tagline: string; body: React.ReactNode; }

const features: Feature[] = [
  {
    id: 'suite-controls', num: '01', icon: '🏠', title: 'Domotique intelligente des suites',
    tagline: 'Contrôle total, granularité maximale, latence inférieure à 50 ms.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Le module Suite Controls transforme chaque chambre en un espace réceptif. Température, éclairage, volets, musique, scénarios personnalisés : tout est orchestré en temps réel via une connexion WebSocket sécurisée.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Capacités principales</h3>
        <ul className="space-y-2 mb-6">
          {['Contrôle granulaire : température au demi-degré, éclairage en %, volets en position continue', 'Scènes prédéfinies : Accueil, Matin, Travail, Dîner, Nuit, Absent, ou sur mesure', 'Mode "Do Not Disturb" synchronisé avec le housekeeping', 'Suivi énergétique — économie moyenne observée : 23%', 'API ouverte : KNX, Crestron, Lutron, Zigbee via couche d\'abstraction'].map(i => (
            <li key={i} className="flex gap-2 text-slate-400"><span className="text-[#D4AF37] shrink-0">✦</span>{i}</li>
          ))}
        </ul>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Bénéfices mesurables</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{v:'-23%',l:'Consommation énergétique'},{v:'+18%',l:'Score NPS client'},{v:'-40%',l:'Interventions manuelles'}].map(s=>(
            <div key={s.l} className="text-center p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
              <p className="text-2xl font-bold text-[#D4AF37]">{s.v}</p>
              <p className="text-xs text-slate-400 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: 'room-service', num: '02', icon: '🍽️', title: 'Room service temps réel',
    tagline: 'De la commande à la livraison, chaque seconde compte.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Le module Room Service orchestre le cycle complet d'une commande : prise de commande, confirmation cuisine, préparation, livraison, facturation. Chaque transition est instantanée, tracée, notifiée.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Workflow automatisé</h3>
        <ol className="space-y-3 mb-6">
          {['Commande client : portail invité (Smart Mirror, app mobile, QR code) ou tablette serveur', 'Confirmation cuisine : notification push instantanée + file d\'attente affichée', 'Préparation : chronométrage, alertes retard, suggestions de vins (via module IA)', 'Prêt à servir : notification serveur + géolocalisation interne', 'Livraison : signature digitale, encaissement auto, invitation à noter'].map((s,i)=>(
            <li key={i} className="flex gap-3 text-slate-400"><span className="text-[#D4AF37] font-bold shrink-0">{String(i+1).padStart(2,'0')}.</span>{s}</li>
          ))}
        </ol>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Fonctionnalités avancées</h3>
        <ul className="space-y-2">
          {['Gestion des régimes alimentaires et allergies (croisée avec le profil guest)', 'Menu dynamique selon l\'heure, la météo, l\'inventaire', 'Suggestions d\'upselling contextuelles', 'Multi-langue : interface en 12 langues avec traduction automatique'].map(i=>(
            <li key={i} className="flex gap-2 text-slate-400"><span className="text-[#D4AF37] shrink-0">✦</span>{i}</li>
          ))}
        </ul>
      </>
    )
  },
  {
    id: 'arrivals', num: '03', icon: '✈️', title: 'Orchestration des arrivées VIP',
    tagline: 'Six équipes, une chorégraphie parfaite.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Une arrivée VIP est un ballet complexe entre réception, conciergerie, housekeeping, cuisine, voiturier et transport. Ziffir planifie automatiquement les tâches critiques et coordonne les équipes en temps réel.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Checklist automatique</h3>
        <ul className="space-y-2 mb-6">
          {['Préparation de la suite selon les préférences historiques','Welcome drink selon heure d\'arrivée et préférences alimentaires','Coordination voiturier 10 min avant l\'arrivée','Suivi du vol en temps réel (FlightAware/FlightRadar24)','Accueil directeur selon niveau VIP','Briefing sécurité si profil à risque'].map(i=>(
            <li key={i} className="flex gap-2 text-slate-400"><span className="text-[#D4AF37] shrink-0">✦</span>{i}</li>
          ))}
        </ul>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Intégrations externes</h3>
        <div className="grid grid-cols-2 gap-3">
          {['FlightAware / FlightRadar24','NetJets, VistaJet (jets privés)','Uber Black, Bolt, chauffeurs privés','Opera, Mews, Cloudbeds (PMS)'].map(i=>(
            <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-400">{i}</div>
          ))}
        </div>
      </>
    )
  },
  {
    id: 'wine-cellar', num: '04', icon: '🍷', title: 'Cave à vin augmentée par IA',
    tagline: 'Le sommelier augmenté, disponible 24/7.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Le module Wine Cellar combine inventaire temps réel, profil organoleptique détaillé, et algorithme de recommandation contextuelle.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Algorithme de recommandation — 6 dimensions</h3>
        <div className="space-y-2 mb-6">
          {[{d:'Accord mets-vin',pct:'40%'},{d:'Adaptation météo',pct:'15%'},{d:'Préférences guest',pct:'15%'},{d:'Apprentissage continu',pct:'10%'},{d:'Règles sommelier',pct:'10%'},{d:'Niveau de stock',pct:'10%'}].map(i=>(
            <div key={i.d} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-48">{i.d}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-2"><div className="bg-[#D4AF37] h-2 rounded-full" style={{width:i.pct}}/></div>
              <span className="text-[#D4AF37] text-sm font-bold w-10">{i.pct}</span>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Traçabilité blockchain-ready</h3>
        <p className="text-slate-400">Pour les bouteilles d'exception, Ziffir génère un certificat de provenance avec hash cryptographique SHA-256. Option d'ancrage blockchain pour les flottes de très haute valeur.</p>
      </>
    )
  },
  {
    id: 'ledger', num: '05', icon: '🔐', title: 'Ledger auditable',
    tagline: 'Chaque action, immuable et vérifiable.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Le Ledger enregistre chaque action dans un registre cryptographique à hash chain. Conçu pour satisfaire aux exigences SOC 2 et ISO 27001.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Propriétés cryptographiques</h3>
        <ul className="space-y-2 mb-6">
          {['Append-only : aucun log ne peut être modifié ou supprimé après écriture','Hash chain SHA-256 : chaque log contient le hash du précédent','Vérification d\'intégrité quotidienne automatisée avec alerte en cas de rupture'].map(i=>(
            <li key={i} className="flex gap-2 text-slate-400"><span className="text-[#D4AF37] shrink-0">🔒</span>{i}</li>
          ))}
        </ul>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Export comptable</h3>
        <p className="text-slate-400">Export FEC (Fichier des Écritures Comptables) conforme aux exigences fiscales françaises. Compatible Sage, Cegid, QuickBooks.</p>
      </>
    )
  },
  {
    id: 'hospitality', num: '06', icon: '📊', title: 'Hospitality Manager',
    tagline: 'Le centre de contrôle du palace.',
    body: (
      <>
        <p className="text-slate-300 mb-6">Tableau de bord unifié qui agrège tous les modules en une vue panoramique pour le directeur général et les managers.</p>
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Quatre panneaux en un</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{t:'Suites',d:'Occupation, températures, alertes domotique'},{t:'Room Service',d:'Commandes en file, CA du jour, temps moyen'},{t:'Arrivées',d:'Prochains 24h, prochain VIP, tâches critiques'},{t:'Cave',d:'Stock bouteilles, alertes, services du jour'}].map(p=>(
            <div key={p.t} className="p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
              <h4 className="font-bold text-[#D4AF37] mb-1">{p.t}</h4>
              <p className="text-sm text-slate-400">{p.d}</p>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: 'security', num: '07', icon: '🛡️', title: 'Sécurité & conformité',
    tagline: 'Conçu pour les exigences des palais.',
    body: (
      <>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Sécurité technique</h3>
            <ul className="space-y-2">
              {['Tokens HTTP-only (immunisé XSS)','Chiffrement TLS 1.3 bout-en-bout','Hashing bcrypt x12 pour les mots de passe','JWT rotation 15 min + refresh 7 jours','2FA TOTP (Authenticator, Authy)','Audit log immutable (module Ledger)','Isolation multi-tenant par hotelId'].map(i=>(
                <li key={i} className="flex gap-2 text-slate-400 text-sm"><span className="text-green-400 shrink-0">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Conformité</h3>
            <ul className="space-y-3">
              {[{n:'RGPD',d:'Registre des traitements, droit à l\'oubli, DPO désigné'},{n:'PCI DSS',d:'Aucune donnée CB stockée (Stripe)'},{n:'ISO 27001',d:'Certification en cours (Q2 2025)'},{n:'SOC 2 Type II',d:'Audit en cours (Q4 2025)'}].map(i=>(
                <li key={i.n} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <span className="font-bold text-[#D4AF37] text-sm">{i.n}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{i.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    )
  },
];

export function FeaturesPage() {
  return (
    <PublicLayout title="Fonctionnalités | Ziffir" description="Découvrez toutes les fonctionnalités Ziffir : domotique intelligente, room service temps réel, arrivées VIP orchestrées, cave à vin IA, ledger auditable, et bien plus." jsonLd={featuresJsonLd}>
      <div className="ambient-glow glow-1" /><div className="ambient-glow glow-2" />

      {/* HERO */}
      <section className="text-center py-24 px-4 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">7 modules · 1 plateforme</span>
          <h1 className="text-5xl font-extrabold text-slate-100 mb-6 leading-tight">Sept modules. Une seule plateforme.<br/><span className="text-[#D4AF37]">Zéro compromis.</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Ziffir orchestre chaque aspect de l'expérience hôtelière avec une intelligence contextuelle temps réel.</p>
        </motion.div>

        {/* Quick nav */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {features.map(f => (
            <a key={f.id} href={`#${f.id}`} className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700/50 rounded-full text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition">
              {f.icon} {f.title.split(' ')[0]}
            </a>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-24">
        {features.map((f, i) => (
          <motion.article key={f.id} id={f.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="scroll-mt-24 grid md:grid-cols-[1fr_2fr] gap-12 items-start">
            <div className="sticky top-28">
              <span className="text-6xl font-black text-[#D4AF37]/20">{f.num}</span>
              <p className="text-3xl mb-1 mt-2">{f.icon}</p>
              <h2 className="text-2xl font-bold text-slate-100 mt-2 mb-3">{f.title}</h2>
              <p className="text-slate-400 italic">{f.tagline}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-8">
              {f.body}
            </div>
          </motion.article>
        ))}
      </div>

      {/* CTA */}
      <section className="text-center py-20 px-4 bg-gradient-to-t from-[#D4AF37]/5 to-transparent border-t border-[#D4AF37]/10">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Convaincu ?</h2>
        <p className="text-slate-400 mb-8">14 jours d'essai gratuit, sans carte bancaire, sans engagement.</p>
        <Link to="/register" className="btn-primary btn-marketing glow-btn">Démarrer maintenant →</Link>
      </section>
    </PublicLayout>
  );
}
