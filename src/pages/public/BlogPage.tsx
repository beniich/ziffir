import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: number;
  image: string;
  tags: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: 'ia-contextuelle-vins-sommelier-augmente',
    title: 'Comment notre IA redéfinit le métier de sommelier',
    excerpt: 'Notre algorithme combine 6 dimensions pour recommander le vin idéal. Découvrez comment il apprend de chaque service.',
    category: 'IA & Hôtellerie',
    author: { name: 'Marie Martin', role: 'CTO', avatar: '/team/marie.jpg' },
    publishedAt: '2024-11-15',
    readingTime: 8,
    image: '/blog/sommelier-ia.jpg',
    tags: ['IA', 'Wine Cellar', 'Innovation'],
  },
  {
    slug: 'war-room-orchestration-arrivees-vip',
    title: 'Dans les coulisses d\'une arrivée VIP : la War Room',
    excerpt: 'Plongée au cœur de notre War Room qui coordonne 6 équipes en temps réel pour chaque arrivée de prestige.',
    category: 'Produit',
    author: { name: 'Pierre Dubois', role: 'COO', avatar: '/team/pierre.jpg' },
    publishedAt: '2024-11-08',
    readingTime: 6,
    image: '/blog/war-room.jpg',
    tags: ['Arrivals', 'Temps réel', 'Luxury'],
  },
  {
    slug: 'energie-domotique-intelligente-palaces',
    title: 'Domotique intelligente : 23% d\'économie d\'énergie en moyenne',
    excerpt: 'Les données parlent : nos clients palaces économisent en moyenne 23% sur leur facture énergétique grâce à Ziffir Suite Controls.',
    category: 'Études de cas',
    author: { name: 'Jean Dupont', role: 'CEO', avatar: '/team/jean.jpg' },
    publishedAt: '2024-10-28',
    readingTime: 5,
    image: '/blog/energie.jpg',
    tags: ['Domotique', 'ROI', 'Écologie'],
  },
  {
    slug: 'conformite-rgpd-hotellerie-2024',
    title: 'RGPD & hôtellerie : notre approche en 7 mesures concrètes',
    excerpt: 'La protection des données des clients est cruciale dans le luxe. Voici comment Ziffir garantit la conformité.',
    category: 'Conformité',
    author: { name: 'Marie Martin', role: 'CTO', avatar: '/team/marie.jpg' },
    publishedAt: '2024-10-15',
    readingTime: 10,
    image: '/blog/rgpd.jpg',
    tags: ['RGPD', 'Sécurité', 'Conformité'],
  },
  {
    slug: 'audit-ledger-blockchain-hotellerie',
    title: 'Pourquoi un ledger immuable change la gestion hôtelière',
    excerpt: 'De la blockchain au hash chain simple : comment Ziffir garantit un audit trail cryptographique de chaque action.',
    category: 'Tech',
    author: { name: 'Jean Dupont', role: 'CEO', avatar: '/team/jean.jpg' },
    publishedAt: '2024-10-02',
    readingTime: 7,
    image: '/blog/ledger.jpg',
    tags: ['Blockchain', 'Audit', 'Tech'],
  },
  {
    slug: 'offboarding-palace-paris-temoignage',
    title: 'Témoignage : comment le Palace Royal a transformé son room service',
    excerpt: 'Le directeur du Palace Royal à Megève nous raconte leur transition vers Ziffir et les résultats obtenus.',
    category: 'Témoignages',
    author: { name: 'Pierre Dubois', role: 'COO', avatar: '/team/pierre.jpg' },
    publishedAt: '2024-09-20',
    readingTime: 9,
    image: '/blog/temoignage.jpg',
    tags: ['Témoignage', 'Room Service', 'ROI'],
  },
];

const CATEGORIES = ['Toutes', ...Array.from(new Set(POSTS.map(p => p.category)))];

export function BlogPage() {
  const [category, setCategory] = useState('Toutes');
  const [search, setSearch] = useState('');
  
  const filtered = POSTS.filter(p => {
    if (category !== 'Toutes' && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  return (
    <PublicLayout
      title="Blog"
      description="Articles, études de cas, et analyses sur l'IA, la domotique, et l'avenir de l'hôtellerie de luxe."
    >
      <SEO 
        title="Blog Ziffir"
        description="IA, domotique, hôtellerie de luxe : articles, études de cas, et analyses par l'équipe Ziffir."
        url="/blog"
      />

      <main id="main-content" className="p-6 max-w-7xl mx-auto text-slate-200">
        <Breadcrumb items={[
          { label: 'Accueil', path: '/' },
          { label: 'Blog' },
        ]} />

        <motion.section 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">📝 Le blog Ziffir</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Actualités, études de cas, et réflexions sur l'IA, la domotique, 
            et l'avenir de l'hôtellerie de luxe.
          </p>
        </motion.section>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <input
            type="search"
            placeholder="Rechercher un article..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === c ? 'bg-[#D4AF37] text-black' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ARTICLE À LA UNE */}
        {filtered.length > 0 && (
          <motion.article 
            className="mb-16 bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to={`/blog/${filtered[0].slug}`} className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-800 relative">
                {/* Fallback pattern since we don't have images */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-80" />
                <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">⭐ À la une</span>
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <span className="text-[#D4AF37] text-sm font-mono mb-2">{filtered[0].category}</span>
                <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition">{filtered[0].title}</h2>
                <p className="text-slate-400 mb-6">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-700" />
                  <div>
                    <strong className="block text-slate-200">{filtered[0].author.name}</strong>
                    <span className="text-xs">{filtered[0].author.role}</span>
                  </div>
                  <div className="ml-auto text-right text-xs">
                    <time dateTime={filtered[0].publishedAt}>
                      {new Date(filtered[0].publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </time>
                    <span className="block">· {filtered[0].readingTime} min de lecture</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        )}

        {/* GRILLE D'ARTICLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filtered.slice(1).map((post, i) => (
            <motion.article
              key={post.slug}
              className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition group flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={`/blog/${post.slug}`} className="flex-grow flex flex-col">
                <div className="h-48 bg-slate-800 relative">
                    {/* Placeholder image area */}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <span className="text-[#D4AF37] text-xs font-mono mb-2">{post.category}</span>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition">{post.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                    </time>
                    <span>· {post.readingTime} min</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 italic py-20">Aucun article ne correspond à votre recherche.</p>
        )}
      </main>
    </PublicLayout>
  );
}
