import { PublicLayout } from '../components/layout/PublicLayout';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Ziffir — Intelligence Prédictive pour Hôtels de Luxe",
  description: "Plateforme SaaS nouvelle génération pour l'hôtellerie de luxe",
  mainEntity: { '@id': 'https://www.ziffir.com/#software' },
};

export function MarketingPage() {
  return (
    <PublicLayout
      title="Plateforme d'Intelligence Prédictive pour Hôtels de Luxe"
      description="Ziffir révolutionne l'hôtellerie de luxe : domotique intelligente, room service temps réel, arrivées VIP orchestrées, cave à vin IA. Démarrez votre essai gratuit."
      jsonLd={homeJsonLd}
    >
      {/* ═══ HERO ═══ */}
      <section id="hero" aria-labelledby="hero-title" className="marketing-hero">
        <h1 id="hero-title">
          L'intelligence prédictive au service de l'<strong>hôtellerie de luxe</strong>
        </h1>
        <p className="hero-subtitle">
          Domotique intelligente, room service temps réel, arrivées VIP orchestrées,
          cave à vin IA. Une seule plateforme pour orchestrer l'excellence.
        </p>
        <div className="hero-cta">
          <a href="/register" className="btn-marketing btn-marketing-primary">
            Démarrer gratuitement
          </a>
          <a href="#features" className="btn-marketing btn-marketing-ghost">
            Découvrir ↓
          </a>
        </div>
        <p className="hero-trust">
          ✓ 14 jours d'essai gratuit &nbsp;·&nbsp; ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Setup en 5 min
        </p>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" aria-labelledby="features-title" className="marketing-section">
        <header className="marketing-section-header">
          <h2 id="features-title">Fonctionnalités pensées pour les palaces</h2>
          <p>Sept modules qui transforment l'expérience client et l'efficacité opérationnelle.</p>
        </header>

        <div className="marketing-grid">
          {[
            { icon: '🏨', title: 'Domotique intelligente des suites', desc: 'Contrôlez en temps réel la température, l\'éclairage, les volets et la musique de chaque suite. Scènes prédéfinies ou personnalisation granulaire.', href: '/features/suite-controls' },
            { icon: '🍽️', title: 'Room service temps réel', desc: 'Workflow complet de la commande à la livraison. Notifications push à la cuisine, gestion des statuts, audit complet de chaque transition.', href: '/features/room-service' },
            { icon: '✈️', title: 'Orchestration des arrivées VIP', desc: 'Coordination de 6 équipes pour chaque arrivée. Suivi des vols, planification automatique des tâches, alertes contextuelles.', href: '/features/arrivals' },
            { icon: '🍷', title: 'Cave à vin IA', desc: 'Recommandations selon le menu, la météo, l\'occasion et les préférences. Score de pertinence transparent et apprentissage continu.', href: '/features/wine-cellar' },
            { icon: '📜', title: 'Ledger auditable', desc: 'Registre cryptographique avec hash chain. Export comptable FEC, conformité RGPD et audit trail immutable.', href: '/features/ledger' },
            { icon: '🎛️', title: 'Hospitality Manager', desc: 'Tableau de bord temps réel qui agrège tous les modules : état des suites, commandes en cours, arrivées à venir, alertes critiques.', href: '/features/hospitality' },
          ].map(f => (
            <article key={f.title} className="marketing-card">
              <span className="marketing-card-icon" aria-hidden="true">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <a href={f.href} className="marketing-link">En savoir plus →</a>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" aria-labelledby="pricing-title" className="marketing-section marketing-section-alt">
        <header className="marketing-section-header">
          <h2 id="pricing-title">Tarifs transparents</h2>
          <p>Choisissez le plan adapté à votre établissement. Annulable à tout moment.</p>
        </header>

        <div className="marketing-pricing-grid">
          {[
            { name: 'Premium', price: '49', items: ['Jusqu\'à 50 chambres', '5 utilisateurs', 'Modules standards', 'Support email'], href: '/register?plan=PREMIUM', featured: false },
            { name: 'Platinium', price: '149', items: ['Jusqu\'à 200 chambres', '20 utilisateurs', 'Wine Cellar IA', 'Arrivals VIP', 'Support prioritaire'], href: '/register?plan=PLATINIUM', featured: true },
            { name: 'Golden', price: '499', items: ['Chambres illimitées', 'Users illimités', 'Vault & Channel sync', 'API publique', 'Account manager dédié'], href: '/contact?plan=GOLDEN', featured: false },
          ].map(plan => (
            <article
              key={plan.name}
              className={`marketing-plan${plan.featured ? ' marketing-plan-featured' : ''}`}
              itemScope itemType="https://schema.org/Offer"
            >
              {plan.featured && <span className="marketing-badge">Recommandé</span>}
              <h3 itemProp="name">{plan.name}</h3>
              <p className="marketing-price" itemProp="price" content={plan.price + '.00'}>
                {plan.price}€<span>/mois</span>
              </p>
              <meta itemProp="priceCurrency" content="EUR" />
              <ul>
                {plan.items.map(item => <li key={item}>✓ {item}</li>)}
              </ul>
              <a href={plan.href} className="btn-marketing btn-marketing-primary" itemProp="url">
                Choisir {plan.name}
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" aria-labelledby="faq-title" className="marketing-section">
        <header className="marketing-section-header">
          <h2 id="faq-title">Questions fréquentes</h2>
        </header>

        <div className="marketing-faq" itemScope itemType="https://schema.org/FAQPage">
          {[
            { q: "Qu'est-ce que Ziffir ?", a: "Ziffir est une plateforme SaaS d'intelligence prédictive dédiée à l'hôtellerie de luxe. Elle permet de contrôler la domotique des suites, gérer le room service, orchestrer les arrivées VIP et dispose d'une cave à vin IA contextuelle." },
            { q: "À qui s'adresse Ziffir ?", a: "Aux palaces, hôtels 5 étoiles, yachts de luxe, jets privés et toute enseigne d'hôtellerie haut de gamme souhaitant offrir une expérience unique grâce à la technologie." },
            { q: "Combien coûte Ziffir ?", a: "Les plans commencent à 49€/mois. 14 jours d'essai gratuit sans carte bancaire. Voir la section Tarifs ci-dessus." },
            { q: "L'installation est-elle complexe ?", a: "Non. Le setup prend moins de 5 minutes. Créez votre compte, configurez votre hôtel et invitez vos équipes. Pas d'infrastructure à gérer." },
          ].map(faq => (
            <details key={faq.q} itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="marketing-faq-item">
              <summary itemProp="name">{faq.q}</summary>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="marketing-final-cta" aria-labelledby="cta-title">
        <h2 id="cta-title">Prêt à révolutionner votre palace ?</h2>
        <p>Rejoignez les établissements qui font confiance à Ziffir.</p>
        <a href="/register" className="btn-marketing btn-marketing-primary btn-marketing-lg">
          Démarrer mon essai gratuit
        </a>
      </section>
    </PublicLayout>
  );
}
