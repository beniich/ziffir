import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
  jsonLd?: object;
}

const DEFAULT_TITLE = 'Ziffir — Intelligence Prédictive pour Hôtels de Luxe';
const DEFAULT_DESCRIPTION = "Plateforme SaaS d'intelligence prédictive dédiée à l'hôtellerie de luxe. Domotique, room service temps réel, arrivées VIP, cave à vin IA. Conçue pour les palaces.";
const DEFAULT_IMAGE = 'https://www.ziffir.com/og-image.png';
const SITE_NAME = 'Ziffir';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  keywords = [],
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const fullUrl = url ? `https://www.ziffir.com${url}` : undefined;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    const setMeta = (selector: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        // Parse the selector to set the attribute
        const match = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/);
        if (match) el.setAttribute(match[1], match[2]);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta('meta[name="description"]', description);
    if (keywords.length > 0) setMeta('meta[name="keywords"]', keywords.join(', '));

    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:type"]', type);
    if (fullUrl) setMeta('meta[property="og:url"]', fullUrl);

    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', image);

    if (fullUrl) setLink('canonical', fullUrl);
    setMeta('meta[name="robots"]', noindex ? 'noindex, nofollow' : 'index, follow');

    if (jsonLd) {
      let script = document.getElementById('page-jsonld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'page-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [fullTitle, description, image, fullUrl, type, noindex, keywords, jsonLd]);

  return null;
}
