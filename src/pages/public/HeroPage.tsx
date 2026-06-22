import { Link } from 'react-router-dom';
import { Shield, Sparkles, Lock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function HeroPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-zaphir-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-zaphir-500 to-zaphir-700 mb-8 shadow-glow-gold animate-pulse-glow">
          <Shield className="w-12 h-12 text-obsidian-950" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-6">
          ZAPHIR
        </h1>
        <p className="text-3xl text-slate-300 mb-4">
          Le Command Center nouvelle génération
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
          Gestion hôtelière de luxe avec sécurité enterprise, multi-tenancy,
          et analytics temps réel. Conçu pour les établissements exigeants.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Démarrer maintenant
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              En savoir plus
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap gap-6 justify-center items-center text-sm text-slate-500">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOC 2 Ready</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ISO 27001</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-tenant</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> JWT + Audit chain</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-slate-100 mb-12">
          Une plateforme complète
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass-strong" padding="lg" hoverable>
            <Sparkles className="w-10 h-10 text-zaphir-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Luxe & Performance</h3>
            <p className="text-slate-400">Interface premium, animations fluides, design signature.</p>
          </Card>
          <Card variant="glass-strong" padding="lg" hoverable>
            <Lock className="w-10 h-10 text-zaphir-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Sécurité Enterprise</h3>
            <p className="text-slate-400">JWT, audit chain immutable, chiffrement bout-en-bout.</p>
          </Card>
          <Card variant="glass-strong" padding="lg" hoverable>
            <Globe className="w-10 h-10 text-zaphir-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Multi-Hôtels</h3>
            <p className="text-slate-400">Gérez un portefeuille d'établissements depuis une interface unique.</p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Card variant="gold" padding="xl">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Prêt à transformer votre hôtellerie ?</h2>
          <p className="text-slate-400 mb-6">Rejoignez les établissements qui font confiance à Zaphir.</p>
          <Link to="/register">
            <Button variant="primary" size="lg">Créer mon compte</Button>
          </Link>
        </Card>
      </section>
    </>
  );
}
