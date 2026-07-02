import { SEO } from '../seo/SEO';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  noindex?: boolean;
  jsonLd?: object;
}

export function PublicLayout({ children, title, description, noindex, jsonLd }: PublicLayoutProps) {
  return (
    <>
      <SEO title={title} description={description} noindex={noindex} jsonLd={jsonLd} />

      <header role="banner" className="public-header">
        <nav aria-label="Navigation principale" className="public-nav">
          <a href="/" className="nav-brand" aria-label="Ziffir - Accueil">
            <span className="brand-logo">✦</span>
            <span className="brand-name">Ziffir</span>
          </a>

          <ul className="nav-links" role="list">
            <li><a href="/#features">Fonctionnalités</a></li>
            <li><a href="/#pricing">Tarifs</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>

          <div className="nav-actions">
            <a href="/login" className="btn btn-ghost">Connexion</a>
            <a href="/register" className="btn btn-primary">Essai gratuit</a>
          </div>
        </nav>
      </header>

      <main id="main-content" role="main">
        {children}
      </main>

      <footer role="contentinfo" className="public-footer">
        <div className="footer-grid">
          <section aria-labelledby="footer-product">
            <h2 id="footer-product">Produit</h2>
            <ul>
              <li><a href="/#features">Fonctionnalités</a></li>
              <li><a href="/#pricing">Tarifs</a></li>
              <li><a href="/register">Essai gratuit</a></li>
            </ul>
          </section>

          <section aria-labelledby="footer-legal">
            <h2 id="footer-legal">Légal</h2>
            <ul>
              <li><a href="/legal/mentions">Mentions légales</a></li>
              <li><a href="/legal/privacy">Confidentialité</a></li>
              <li><a href="/legal/gdpr">RGPD</a></li>
            </ul>
          </section>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact">Contact</h2>
            <address>
              Ziffir SAS<br />
              Paris, France<br />
              <a href="mailto:contact@ziffir.com">contact@ziffir.com</a>
            </address>
          </section>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Ziffir SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}
