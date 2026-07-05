import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';

interface DocSection {
  title: string;
  slug: string;
  pages: Array<{ title: string; slug: string }>;
}

const DOCS_STRUCTURE: DocSection[] = [
  {
    title: '🚀 Démarrage',
    slug: 'getting-started',
    pages: [
      { title: 'Introduction', slug: 'introduction' },
      { title: 'Installation', slug: 'installation' },
      { title: 'Premier hôtel', slug: 'premier-hotel' },
      { title: 'Configuration initiale', slug: 'configuration-initiale' },
    ],
  },
  {
    title: '👥 Gestion d\'équipe',
    slug: 'team',
    pages: [
      { title: 'Inviter un membre', slug: 'inviter-membre' },
      { title: 'Rôles et permissions', slug: 'roles-permissions' },
    ],
  },
  {
    title: '🏨 Suite Controls',
    slug: 'suite-controls',
    pages: [
      { title: 'Vue d\'ensemble', slug: 'overview' },
      { title: 'Créer des scènes', slug: 'creer-scenes' },
      { title: 'API & webhooks', slug: 'api-webhooks' },
    ],
  },
  {
    title: '🍽️ Room Service',
    slug: 'room-service',
    pages: [
      { title: 'Configurer le menu', slug: 'menu' },
      { title: 'Workflow de commande', slug: 'workflow' },
      { title: 'Notifications push', slug: 'notifications' },
    ],
  },
  {
    title: '✈️ Arrivées VIP',
    slug: 'arrivals',
    pages: [
      { title: 'Planifier une arrivée', slug: 'planifier' },
      { title: 'War Room', slug: 'war-room' },
      { title: 'Intégrations externes', slug: 'integrations' },
    ],
  },
  {
    title: '🍷 Wine Cellar',
    slug: 'wine-cellar',
    pages: [
      { title: 'Gérer la cave', slug: 'gestion' },
      { title: 'IA de recommandation', slug: 'ia' },
      { title: 'Traçabilité', slug: 'tracabilite' },
    ],
  },
  {
    title: '📜 Ledger & Audit',
    slug: 'ledger',
    pages: [
      { title: 'Comprendre le ledger', slug: 'comprendre' },
      { title: 'Export comptable', slug: 'export' },
    ],
  },
  {
    title: '🔌 API & Intégrations',
    slug: 'api',
    pages: [
      { title: 'Authentification', slug: 'auth' },
      { title: 'REST API', slug: 'rest' },
      { title: 'WebSocket', slug: 'websocket' },
      { title: 'Webhooks', slug: 'webhooks' },
    ],
  },
  {
    title: '🛡️ Sécurité & RGPD',
    slug: 'security',
    pages: [
      { title: 'Bonnes pratiques', slug: 'bonnes-pratiques' },
      { title: 'Conformité RGPD', slug: 'rgpd' },
    ],
  },
];

export function DocsLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  
  return (
    <PublicLayout title="Documentation Ziffir" description="Documentation complète de Ziffir : démarrage, modules, API, sécurité.">
      <SEO 
        title="Documentation"
        description="Documentation technique Ziffir : guides, tutoriels, API, intégrations."
        url="/docs"
      />
      
      <div className="flex min-h-screen bg-[#02030a] text-slate-200">
        {/* SIDEBAR */}
        <aside className="w-72 shrink-0 border-r border-slate-800/50 sticky top-0 h-screen overflow-y-auto py-8 px-4" aria-label="Navigation documentation">
          <div className="mb-8">
            <button type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-400 hover:border-[#D4AF37]/50 hover:text-slate-300 transition text-sm font-mono"
            >
              <span>🔍 Rechercher…</span>
              <kbd className="text-xs bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
            </button>
          </div>
          
          <nav className="space-y-8">
            {DOCS_STRUCTURE.map(section => (
              <div key={section.slug}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">{section.title}</h3>
                <ul className="space-y-0.5">
                  {section.pages.map(page => (
                    <li key={page.slug}>
                      <NavLink 
                        to={`/docs/${section.slug}/${page.slug}`}
                        className={({ isActive }) => 
                          `block px-3 py-1.5 rounded-lg text-sm transition ${isActive 
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`
                        }
                      >
                        {page.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        
        {/* MAIN */}
        <main className="flex-1 py-12 px-8 max-w-4xl" id="main-content">
          <Breadcrumb items={[
            { label: 'Accueil', path: '/' },
            { label: 'Documentation', path: '/docs' },
          ]} />
          
          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-a:text-[#D4AF37] hover:prose-a:underline prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 mt-8">
            <Outlet />
          </article>
          
          {/* Feedback */}
          <div className="mt-16 p-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
            <p className="font-medium text-center mb-4">Cette page vous a-t-elle été utile ?</p>
            <div className="flex justify-center gap-4">
              <button type="button" className="px-6 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl transition">👍 Oui</button>
              <button type="button" className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition">👎 Non</button>
            </div>
            <p className="text-center mt-4">
              <a href="https://github.com/ziffir/docs/issues/new" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline text-sm">
                Suggérer une amélioration →
              </a>
            </p>
          </div>
        </main>
      </div>
      
      {/* SEARCH MODAL */}
      <AnimatePresence>
        {searchOpen && (
          <DocSearchModal 
            query={query}
            setQuery={setQuery}
            onClose={() => { setSearchOpen(false); setQuery(''); }} 
          />
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}

function DocSearchModal({ query, setQuery, onClose }: { query: string; setQuery: (q: string) => void; onClose: () => void }) {
  // Simple local search through docs structure
  const allPages = DOCS_STRUCTURE.flatMap(s => s.pages.map(p => ({
    title: p.title,
    section: s.title,
    url: `/docs/${s.slug}/${p.slug}`,
  })));
  
  const results = query.length > 1 
    ? allPages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.section.toLowerCase().includes(query.toLowerCase()))
    : [];
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <span className="text-slate-500">🔍</span>
          <input
            autoFocus
            type="search"
            placeholder="Rechercher dans la documentation…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
          />
          <kbd className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-400">Esc</kbd>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-3">
          {results.length === 0 && query.length > 1 && (
            <p className="text-center text-slate-500 py-8">Aucun résultat pour "{query}"</p>
          )}
          {results.length === 0 && query.length <= 1 && (
            <p className="text-center text-slate-600 py-8 text-sm">Commencez à taper pour rechercher…</p>
          )}
          
          {results.map((hit, i) => (
            <a
              key={i}
              href={hit.url}
              className="flex flex-col gap-1 px-4 py-3 rounded-xl hover:bg-slate-800/60 transition"
              onClick={onClose}
            >
              <h4 className="font-medium text-slate-200">{hit.title}</h4>
              <span className="text-xs text-slate-500">{hit.section}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
