import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DocContent {
  title: string;
  contentHtml: string;
  lastUpdated: string;
  toc: Array<{ id: string; title: string; level: number }>;
}

// Contenu de démonstration local (en prod: fetcher depuis API/CMS)
const MOCK_DOCS: Record<string, DocContent> = {
  'getting-started/introduction': {
    title: 'Introduction à Ziffir',
    lastUpdated: '2024-12-01',
    toc: [
      { id: 'what-is-ziffir', title: 'Qu\'est-ce que Ziffir ?', level: 2 },
      { id: 'key-concepts', title: 'Concepts clés', level: 2 },
      { id: 'architecture', title: 'Architecture', level: 2 },
    ],
    contentHtml: `
      <h2 id="what-is-ziffir">Qu'est-ce que Ziffir ?</h2>
      <p>Ziffir est une plateforme SaaS de gestion hôtelière premium conçue pour les palaces et hôtels 5 étoiles. Elle unifie tous les opérations hôtelières en temps réel : domotique, room service, arrivées VIP, cave à vins, et audit trail cryptographique.</p>
      
      <h2 id="key-concepts">Concepts clés</h2>
      <ul>
        <li><strong>Hotel</strong> : L'entité principale. Chaque hôtel est isolé (multi-tenancy).</li>
        <li><strong>Suite State</strong> : L'état temps réel d'une chambre (température, lumière, scène).</li>
        <li><strong>Membership</strong> : Un utilisateur peut avoir plusieurs rôles sur plusieurs hôtels.</li>
        <li><strong>Audit Log</strong> : Chaque action est enregistrée de façon immuable.</li>
      </ul>
      
      <h2 id="architecture">Architecture</h2>
      <p>Ziffir repose sur une architecture événementielle avec :</p>
      <ul>
        <li>Frontend React/TypeScript (Vite)</li>
        <li>Backend Node.js/Express avec Socket.IO</li>
        <li>Base de données PostgreSQL avec Prisma ORM</li>
        <li>Cache Redis pour les états temps réel</li>
      </ul>
    `,
  },
};

export function DocPage() {
  const { section, page } = useParams();
  const [doc, setDoc] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const key = `${section}/${page}`;
    
    // En prod : fetch depuis /api/docs/:section/:page
    setTimeout(() => {
      const found = MOCK_DOCS[key] || {
        title: `${page?.replace(/-/g, ' ')} — ${section}`,
        lastUpdated: new Date().toISOString().split('T')[0],
        toc: [],
        contentHtml: `<p>Documentation pour <strong>${section}/${page}</strong>. Cette page sera complétée prochainement.</p>
          <p>En attendant, consultez notre <a href="mailto:contact@ziffir.com">équipe support</a>.</p>`,
      };
      setDoc(found);
      setLoading(false);
    }, 100);
  }, [section, page]);
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-800 rounded w-3/4"></div>
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-800 rounded w-4/5"></div>
      </div>
    );
  }
  
  if (!doc) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Documentation introuvable.</p>
      </div>
    );
  }
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      <div className="flex gap-12">
        {/* Article */}
        <div className="flex-1 min-w-0">
          <header className="mb-8 pb-8 border-b border-slate-800">
            <h1 className="text-4xl font-serif font-bold text-white mb-3">{doc.title}</h1>
            <p className="text-slate-500 text-sm font-mono">
              Dernière mise à jour : {new Date(doc.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </header>
          
          <div dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
        </div>
        
        {/* Table of contents */}
        {doc.toc.length > 0 && (
          <aside className="w-56 shrink-0 sticky top-8 h-fit" aria-label="Sommaire">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Sur cette page</h2>
            <nav>
              <ul className="space-y-2">
                {doc.toc.map(item => (
                  <li key={item.id} className={`${item.level === 3 ? 'pl-3' : ''}`}>
                    <a 
                      href={`#${item.id}`}
                      className="text-sm text-slate-400 hover:text-[#D4AF37] transition"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>
    </motion.div>
  );
}
