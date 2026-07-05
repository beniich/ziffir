import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';
import { Breadcrumb } from '../../components/seo/Breadcrumb';
import { POSTS } from './BlogPage';

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulons un appel API
    const found = POSTS.find(p => p.slug === slug);
    if (found) {
        setPost({
            ...found,
            contentHtml: `<p>Contenu simulé pour l'article <strong>${found.title}</strong>. Ceci est un espace réservé pour le contenu réel qui sera récupéré de l'API. Ziffir s'engage à révolutionner la façon dont l'hôtellerie de luxe interagit avec la technologie grâce à une suite complète d'outils temps réel.</p>
            <br/><p>Dans les hôtels 5 étoiles, la marge d'erreur est inexistante. Chaque processus, de la préparation de la chambre (Suite Controls) jusqu'à la commande en chambre, est une opportunité de parfaire l'expérience client. La War Room développée par nos soins permet une orchestration à la seconde près.</p>`,
        });
    }
    setLoading(false);
  }, [slug]);
  
  if (loading) return <LoadingScreen />;
  if (!post) return <Navigate to="/blog" replace />;
  
  return (
    <PublicLayout title={post.title} description={post.excerpt}>
      <SEO 
        title={post.title}
        description={post.excerpt}
        url={`/blog/${slug}`}
        type="article"
        image={post.image}
        jsonLd={getArticleJsonLd(post, slug!)}
      />

      <main id="main-content" className="p-6 max-w-4xl mx-auto text-slate-200 py-12">
        <Breadcrumb items={[
          { label: 'Accueil', path: '/' },
          { label: 'Blog', path: '/blog' },
          { label: post.title },
        ]} />

        <article className="mt-12 bg-slate-800/20 rounded-3xl overflow-hidden border border-slate-700/50">
          <header className="p-8 md:p-12 text-center border-b border-slate-700/50">
            <span className="inline-block text-[#D4AF37] font-mono text-sm px-3 py-1 bg-[#D4AF37]/10 rounded-full mb-6">{post.category}</span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">{post.title}</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">{post.excerpt}</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                <div className="text-left">
                  <strong className="block text-slate-200">{post.author.name}</strong>
                  <span>{post.author.role}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
              <div className="text-left">
                <time dateTime={post.publishedAt} className="block text-slate-200">
                  {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </time>
                <span>{post.readingTime} min de lecture</span>
              </div>
            </div>
          </header>
          
          <div className="w-full h-64 md:h-96 bg-slate-800 relative">
            {/* Placeholder pour l'image */}
          </div>
          
          <div 
            className="p-8 md:p-12 prose prose-invert prose-lg max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b] prose-headings:font-serif" 
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
          
          <footer className="p-8 md:p-12 bg-slate-900/50 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg">#{tag}</span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 border-t border-slate-800 pt-8">
              <span className="font-bold">Partager :</span>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Partager sur Twitter"
                className="px-4 py-2 bg-slate-800 hover:bg-[#1DA1F2] hover:text-white rounded-lg transition"
              >
                Twitter
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Partager sur LinkedIn"
                className="px-4 py-2 bg-slate-800 hover:bg-[#0077b5] hover:text-white rounded-lg transition"
              >
                LinkedIn
              </a>
            </div>
          </footer>
        </article>
      </main>
    </PublicLayout>
  );
}

function getArticleJsonLd(post: any, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ziffir',
      logo: { '@type': 'ImageObject', url: 'https://www.ziffir.com/logo.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.ziffir.com/blog/${slug}`,
    },
  };
}

function LoadingScreen() {
  return <div className="h-screen w-full flex items-center justify-center text-[#D4AF37] font-mono animate-pulse">Chargement de l'article…</div>;
}
