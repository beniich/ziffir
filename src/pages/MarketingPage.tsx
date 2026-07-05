import { PublicLayout } from '../components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hotel, Plane, Wine, Shield, Star, Crown, ChevronRight } from 'lucide-react';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Ziffir — Predictive Intelligence for Luxury Hospitality",
  description: "Next-generation SaaS platform for luxury hotels, palaces, and private jets.",
  mainEntity: { '@id': 'https://www.ziffir.com/#software' },
};

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 15 } }
};

export function MarketingPage() {
  return (
    <PublicLayout
      title="Predictive Intelligence for Luxury Hotels"
      description="Ziffir revolutionizes luxury hospitality: smart domotics, real-time room service, VIP arrivals, and AI wine cellar. Start your free trial."
      jsonLd={homeJsonLd}
    >
      {/* ═══ BACKGROUND AMBIENT GLOW ═══ */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      {/* ═══ HERO ═══ */}
      <section id="hero" aria-labelledby="hero-title" className="marketing-hero">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="hero-content"
        >
          <motion.div variants={fadeUp} className="hero-badge">
            <Star className="badge-icon" size={14} />
            <span>The New Standard for Palaces</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} id="hero-title">
            Orchestrate Excellence with <br />
            <span className="text-gradient">Predictive Intelligence</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="hero-subtitle">
            Smart suite controls, real-time room service, orchestrated VIP arrivals, 
            and an AI-powered wine cellar. One unified platform for luxury hospitality.
          </motion.p>
          
          <motion.div variants={fadeUp} className="hero-cta">
            <Link to="/register" className="btn-marketing btn-marketing-primary glow-btn">
              Start Free Trial <ChevronRight size={18} />
            </Link>
            <a href="#features" className="btn-marketing btn-marketing-ghost">
              Explore Platform
            </a>
          </motion.div>
          
          <motion.p variants={fadeUp} className="hero-trust">
            ✓ 14-day free trial &nbsp;<span className="dot">·</span>&nbsp; ✓ No credit card &nbsp;<span className="dot">·</span>&nbsp; ✓ 5-minute setup
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" aria-labelledby="features-title" className="marketing-section">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="marketing-section-header"
        >
          <h2 id="features-title">Engineered for Palaces</h2>
          <p>Six modules that transform the guest experience and operational efficiency.</p>
        </motion.header>

        <div className="marketing-grid">
          {[
            { icon: <Hotel size={28} />, title: 'Smart Suite Domotics', desc: 'Real-time control of temperature, lighting, blinds, and music. Predefined scenes and granular personalization.' },
            { icon: <Crown size={28} />, title: 'Real-time Room Service', desc: 'Full workflow from order to delivery. Kitchen push notifications, status tracking, and full transition audits.' },
            { icon: <Plane size={28} />, title: 'VIP Arrival Orchestration', desc: 'Coordinate up to 6 teams for every arrival. Flight tracking, auto-task scheduling, and contextual alerts.' },
            { icon: <Wine size={28} />, title: 'AI Wine Cellar', desc: 'Recommendations based on the menu, weather, occasion, and guest preferences. Transparent AI scoring.' },
            { icon: <Shield size={28} />, title: 'Immutable Ledger', desc: 'Cryptographic ledger with hash chains. GDPR compliant, exportable, and fully auditable operation trails.' },
            { icon: <Star size={28} />, title: 'Hospitality Manager', desc: 'Real-time dashboard aggregating all modules: suite statuses, active orders, upcoming arrivals, and alerts.' },
          ].map((f, i) => (
            <motion.article 
              key={f.title} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="marketing-card glass-card"
            >
              <div className="marketing-card-icon-wrapper">
                <div className="marketing-card-icon-bg"></div>
                <span className="marketing-card-icon">{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" aria-labelledby="pricing-title" className="marketing-section relative">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="marketing-section-header"
        >
          <h2 id="pricing-title">Transparent Pricing</h2>
          <p>Choose the plan that fits your establishment. Cancel anytime.</p>
        </motion.header>

        <div className="marketing-pricing-grid">
          {[
            { name: 'Premium', price: '49', items: ['Up to 50 rooms', '5 Users', 'Standard Modules', 'Email Support'], href: '/register?plan=PREMIUM', featured: false },
            { name: 'Platinium', price: '149', items: ['Up to 200 rooms', '20 Users', 'AI Wine Cellar', 'VIP Arrivals', 'Priority Support'], href: '/register?plan=PLATINIUM', featured: true },
            { name: 'Golden', price: '499', items: ['Unlimited Rooms', 'Unlimited Users', 'Vault & Channel Sync', 'Public API', 'Dedicated Manager'], href: '/register?plan=GOLDEN', featured: false },
          ].map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ scale: plan.featured ? 1.05 : 1.02 }}
              className={`marketing-plan glass-card ${plan.featured ? ' marketing-plan-featured' : ''}`}
            >
              {plan.featured && (
                <div className="marketing-badge-glow">
                  <span className="marketing-badge">Most Popular</span>
                </div>
              )}
              <h3>{plan.name}</h3>
              <p className="marketing-price">
                ${plan.price}<span>/mo</span>
              </p>
              <ul>
                {plan.items.map(item => <li key={item}><Star size={14} className="li-icon"/> {item}</li>)}
              </ul>
              <a href={plan.href} className={`btn-marketing ${plan.featured ? 'btn-marketing-primary glow-btn' : 'btn-marketing-ghost'}`}>
                Choose {plan.name}
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="marketing-final-cta-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="marketing-final-cta glass-card"
        >
          <div className="cta-content">
            <h2>Ready to elevate your palace?</h2>
            <p>Join the world's most prestigious establishments trusting Ziffir.</p>
            <Link to="/register" className="btn-marketing btn-marketing-primary btn-marketing-lg glow-btn">
              Start Your Free Trial
            </Link>
          </div>
          <div className="cta-glow"></div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
