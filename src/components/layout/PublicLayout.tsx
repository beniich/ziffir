import { SEO } from '../seo/SEO';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  noindex?: boolean;
  jsonLd?: object;
}

export function PublicLayout({ children, title, description, noindex, jsonLd }: PublicLayoutProps) {
  const { t } = useTranslation();

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
            <li><Link to="/features">{t('nav.features')}</Link></li>
            <li><Link to="/pricing">{t('nav.pricing')}</Link></li>
            <li><Link to="/blog">{t('nav.blog')}</Link></li>
            <li><Link to="/changelog">{t('nav.changelog')}</Link></li>
          </ul>

          <div className="nav-actions">
            <LanguageSwitcher compact />
            <Link to="/login" className="btn-ghost">{t('nav.login')}</Link>
            <Link to="/register" className="btn-primary glow-btn-sm">{t('nav.trial')}</Link>
          </div>
        </nav>
      </header>

      <main id="main-content" role="main" className="public-main">
        {children}
      </main>

      <footer role="contentinfo" className="public-footer">
        <div className="footer-grid">
          <section aria-labelledby="footer-product">
            <h2 id="footer-product">{t('footer.product')}</h2>
            <ul>
              <li><Link to="/features">{t('nav.features')}</Link></li>
              <li><Link to="/pricing">{t('nav.pricing')}</Link></li>
              <li><Link to="/trial">{t('nav.trial')}</Link></li>
              <li><Link to="/status">{t('nav.status')}</Link></li>
              <li><Link to="/integrations">{t('nav.integrations')}</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-company">
            <h2 id="footer-company">{t('footer.company')}</h2>
            <ul>
              <li><Link to="/blog">{t('nav.blog')}</Link></li>
              <li><Link to="/changelog">{t('nav.changelog')}</Link></li>
              <li><Link to="/careers">{t('nav.careers')}</Link></li>
              <li><Link to="/partners">{t('nav.partners')}</Link></li>
              <li><Link to="/docs">{t('nav.docs')}</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-legal">
            <h2 id="footer-legal"><Link to="/legal" className="hover:text-[#D4AF37]">{t('footer.legal')}</Link></h2>
            <ul>
              <li><Link to="/legal/terms">{t('nav.terms')}</Link></li>
              <li><Link to="/legal/privacy">{t('nav.privacy')}</Link></li>
              <li><Link to="/legal/gdpr">{t('nav.gdpr')}</Link></li>
              <li><Link to="/legal/cgv">{t('nav.cgv')}</Link></li>
              <li><Link to="/legal/cookies">{t('nav.cookies_policy')}</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact">{t('footer.contact')}</h2>
            <address>
              Ziffir SAS<br />
              Paris, France<br />
              <a href="mailto:contact@ziffir.com">contact@ziffir.com</a>
            </address>
          </section>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </>
  );
}
