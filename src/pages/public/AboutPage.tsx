// AboutPage.tsx — version concise
import { Card } from '../../components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-slate-100 mb-6">À propos de Zaphir</h1>
      <Card variant="glass-strong" padding="lg">
        <p className="text-slate-300 leading-relaxed mb-4">
          Zaphir est né de la volonté de transformer la gestion hôtelière de luxe en une expérience
          fluide, sécurisée et moderne. Notre plateforme combine les meilleures pratiques
          d'ingénierie logicielle (RBAC, multi-tenancy, audit chain) avec un design
          premium.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Développé pour les établissements qui exigent le meilleur.
        </p>
      </Card>
    </div>
  );
}
