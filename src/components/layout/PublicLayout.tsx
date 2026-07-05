import { SEO } from '../seo/SEO';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';

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
      <header role="banner" className="public-header glass-header">
        <nav aria-label="Main Navigation" className="public-nav">
          <Link to="/" className="nav-brand" aria-label="Ziffir - Home">
            <span className="brand-logo">✦</span>
            <span className="brand-name">Ziffir</span>
          </Link>

          <ul className="nav-links" role="list">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/changelog">Changelog</Link></li>
          </ul>

          <div className="nav-actions">
            <LanguageSwitcher compact />
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary glow-btn-sm">Free Trial</Link>
          </div>
        </nav>
      </header>

      <main id="main-content" role="main" className="public-main">
        {children}
      </main>

      <footer role="contentinfo" className="public-footer">
        <div className="footer-grid">
          <section aria-labelledby="footer-product">
            <h2 id="footer-product">Produit</h2>
            <ul>
              <li><Link to="/features">Fonctionnalités</Link></li>
              <li><Link to="/pricing">Tarifs</Link></li>
              <li><Link to="/trial">Essai Gratuit</Link></li>
              <li><Link to="/status">Statut</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-company">
            <h2 id="footer-company">Entreprise</h2>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/changelog">Changelog</Link></li>
              <li><Link to="/careers">Carrières</Link></li>
              <li><Link to="/partners">Partenaires</Link></li>
              <li><Link to="/docs">Documentation</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-legal">
            <h2 id="footer-legal"><Link to="/legal" className="hover:text-[#D4AF37]">Légal</Link></h2>
            <ul>
              <li><Link to="/legal/terms">Conditions d'utilisation</Link></li>
              <li><Link to="/legal/privacy">Politique de confidentialité</Link></li>
              <li><Link to="/legal/gdpr">Conformité RGPD</Link></li>
              <li><Link to="/legal/cgv">CGV</Link></li>
              <li><Link to="/legal/cookies">Cookies</Link></li>
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
          <p>&copy; {new Date().getFullYear()} Ziffir SAS. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
