import { Shield, Lock, FileCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function SecurityPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-slate-100 mb-12 text-center">Sécurité & Conformité</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass-strong" padding="lg">
          <Shield className="w-8 h-8 text-zaphir-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">Authentification JWT</h3>
          <p className="text-sm text-slate-400">Access tokens 15min + Refresh tokens rotation. Bcrypt 12 rounds.</p>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <Lock className="w-8 h-8 text-zaphir-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">RBAC Granulaire</h3>
          <p className="text-sm text-slate-400">CASL, 4 rôles, isolation multi-tenant strict.</p>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <FileCheck className="w-8 h-8 text-zaphir-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">Audit Chain Immutable</h3>
          <p className="text-sm text-slate-400">SHA-256 chaîné (blockchain-like), intégrité garantie.</p>
        </Card>
        <Card variant="glass-strong" padding="lg">
          <AlertTriangle className="w-8 h-8 text-zaphir-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">Protection Anti-Brute-Force</h3>
          <p className="text-sm text-slate-400">Verrouillage après 5 échecs, rate-limiting distribué.</p>
        </Card>
      </div>
    </div>
  );
}
