import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './styles/seo.css';
import './i18n/index.ts';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import { CookieBanner } from './components/cookies/CookieBanner.tsx';

// ── Eager: App shell (always needed) ────────────────────────────────────────
import App from './App.tsx';
import { MarketingPage } from './pages/MarketingPage.tsx';

// ── Lazy: Public pages (split by route) ─────────────────────────────────────
const FeaturesPage   = lazy(() => import('./pages/public/FeaturesPage.tsx').then(m => ({ default: m.FeaturesPage })));
const PricingPage    = lazy(() => import('./pages/public/PricingPage.tsx').then(m => ({ default: m.PricingPage })));
const TrialPage      = lazy(() => import('./pages/public/TrialPage.tsx').then(m => ({ default: m.TrialPage })));
const StatusPage     = lazy(() => import('./pages/public/StatusPage.tsx').then(m => ({ default: m.StatusPage })));
const CareersPage    = lazy(() => import('./pages/public/CareersPage.tsx').then(m => ({ default: m.CareersPage })));
const BlogPage       = lazy(() => import('./pages/public/BlogPage.tsx').then(m => ({ default: m.BlogPage })));
const BlogPostPage   = lazy(() => import('./pages/public/BlogPostPage.tsx').then(m => ({ default: m.BlogPostPage })));
const ChangelogPage  = lazy(() => import('./pages/public/ChangelogPage.tsx').then(m => ({ default: m.ChangelogPage })));
const LegalPage      = lazy(() => import('./pages/public/LegalPage.tsx').then(m => ({ default: m.LegalPage })));
const IntegrationsPage = lazy(() => import('./pages/public/IntegrationsPage.tsx').then(m => ({ default: m.IntegrationsPage })));

// ── Lazy: Legal pages ────────────────────────────────────────────────────────
const TermsPage      = lazy(() => import('./pages/legal/TermsPage.tsx').then(m => ({ default: m.TermsPage })));
const PrivacyPage    = lazy(() => import('./pages/legal/PrivacyPage.tsx').then(m => ({ default: m.PrivacyPage })));
const GdprPage       = lazy(() => import('./pages/legal/GdprPage.tsx').then(m => ({ default: m.GdprPage })));
const CookiesPage    = lazy(() => import('./pages/legal/CookiesPage.tsx').then(m => ({ default: m.CookiesPage })));
const CgvPage        = lazy(() => import('./pages/legal/CgvPage.tsx').then(m => ({ default: m.CgvPage })));

// ── Lazy: Auth ───────────────────────────────────────────────────────────────
const LoginForm      = lazy(() => import('./components/auth/LoginForm.tsx').then(m => ({ default: m.LoginForm })));
const RegisterForm   = lazy(() => import('./components/auth/RegisterForm.tsx').then(m => ({ default: m.RegisterForm })));

// ── Lazy: Docs & Partners ────────────────────────────────────────────────────
const DocsLayout     = lazy(() => import('./pages/docs/DocsLayout.tsx').then(m => ({ default: m.DocsLayout })));
const DocPage        = lazy(() => import('./pages/docs/DocPage.tsx').then(m => ({ default: m.DocPage })));
const PartnersPage   = lazy(() => import('./pages/partners/PartnersPage.tsx').then(m => ({ default: m.PartnersPage })));

// ── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020306]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Chargement…</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Pages publiques — eagerly loaded */}
            <Route path="/" element={<MarketingPage />} />

            {/* Pages publiques — lazy loaded */}
            <Route path="/features"  element={<FeaturesPage />} />
            <Route path="/pricing"   element={<PricingPage />} />
            <Route path="/trial"     element={<TrialPage />} />
            <Route path="/status"    element={<StatusPage />} />
            <Route path="/careers"   element={<CareersPage />} />
            <Route path="/blog"      element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/partners"  element={<PartnersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />

            {/* Auth */}
            <Route path="/login"    element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Pages légales */}
            <Route path="/legal"          element={<LegalPage />} />
            <Route path="/legal/terms"    element={<TermsPage />} />
            <Route path="/legal/privacy"  element={<PrivacyPage />} />
            <Route path="/legal/gdpr"     element={<GdprPage />} />
            <Route path="/legal/cookies"  element={<CookiesPage />} />
            <Route path="/legal/cgv"      element={<CgvPage />} />

            {/* Documentation */}
            <Route path="/docs" element={<DocsLayout />}>
              <Route index element={<DocPage />} />
              <Route path=":section/:page" element={<DocPage />} />
            </Route>

            {/* Application principale */}
            <Route path="/*" element={<App />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
