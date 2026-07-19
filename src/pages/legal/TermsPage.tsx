import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <PublicLayout
      title="Conditions d'utilisation | Ziffir"
      description="Conditions Générales d'Utilisation de la plateforme Ziffir. Acceptation, services, obligations, responsabilité, résiliation."
    >
      <div className="ambient-glow glow-1" />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <section className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Légal</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-400">Dernière mise à jour : 1er décembre 2024</p>
        </section>

        <article className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">1. Acceptation des conditions</h2>
          <p className="text-slate-300 mb-4">
            L'utilisation de la plateforme Ziffir implique l'acceptation pleine 
            et entière des présentes Conditions Générales d'Utilisation (CGU). 
            En créant un compte, vous reconnaissez avoir lu, compris et accepté 
            ces conditions.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">2. Description du service</h2>
          <p className="text-slate-300 mb-4">
            Ziffir est une plateforme SaaS d'intelligence prédictive destinée à 
            l'hôtellerie de luxe. Le service comprend :
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-8">
            <li>Le contrôle domotique des suites</li>
            <li>La gestion du room service en temps réel</li>
            <li>L'orchestration des arrivées VIP</li>
            <li>La gestion de la cave à vin assistée par IA</li>
            <li>Un ledger auditable</li>
            <li>Le tableau de bord Hospitality Manager</li>
            <li>Le support client selon le plan souscrit</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">3. Inscription et compte utilisateur</h2>
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.1 Conditions d'inscription</h3>
          <p className="text-slate-300 mb-4">Pour créer un compte, vous devez :</p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-6">
            <li>Être âgé d'au moins 18 ans</li>
            <li>Représenter légalement un établissement d'hôtellerie</li>
            <li>Fournir des informations exactes et à jour</li>
            <li>Disposer d'une adresse email professionnelle valide</li>
          </ul>
          
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.2 Sécurité du compte</h3>
          <p className="text-slate-300 mb-8">
            Vous êtes responsable de la confidentialité de vos identifiants. 
            Toute activité réalisée depuis votre compte est présumée émaner 
            de vous. Ziffir recommande fortement l'activation de la 
            double authentification (2FA).
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">4. Plans et tarification</h2>
          <p className="text-slate-300 mb-8">
            Les plans disponibles (Essai gratuit, Premium, Platinium, Golden, 
            Enterprise) sont décrits sur la page <Link to="/pricing">Tarifs</Link>. 
            Les prix sont indiqués hors taxes et peuvent être modifiés avec un 
            préavis de 30 jours.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">5. Obligations de l'utilisateur</h2>
          <p className="text-slate-300 mb-4">Vous vous engagez à :</p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-8">
            <li>Utiliser le service conformément à sa destination</li>
            <li>Ne pas porter atteinte aux droits de tiers</li>
            <li>Ne pas tenter de contourner les mesures de sécurité</li>
            <li>Ne pas surcharger intentionnellement les serveurs</li>
            <li>Respecter les lois et réglementations applicables, notamment le RGPD</li>
            <li>Obtenir le consentement des personnes dont vous saisissez les données</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">6. Propriété intellectuelle</h2>
          <p className="text-slate-300 mb-4">
            Ziffir SAS conserve l'intégralité des droits de propriété 
            intellectuelle sur la plateforme, son code source, son design, 
            sa documentation, et ses marques. Aucune cession de droits n'est 
            consentie par les présentes CGU.
          </p>
          <p className="text-slate-300 mb-8">
            Vous conservez l'intégralité des droits sur les données que vous 
            saisissez dans la plateforme (informations sur vos chambres, vos 
            vins, vos clients finaux, etc.).
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">7. Protection des données personnelles</h2>
          <p className="text-slate-300 mb-8">
            Le traitement de vos données personnelles est régi par notre 
            <Link to="/legal/privacy"> Politique de confidentialité</Link> et est 
            conforme au Règlement Général sur la Protection des Données (RGPD). 
            Vous disposez d'un droit d'accès, de rectification, d'effacement, 
            de portabilité et d'opposition.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">8. Niveau de service (SLA)</h2>
          <p className="text-slate-300 mb-4">Ziffir s'engage à :</p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-8">
            <li><strong>Disponibilité</strong> : 99.5% (Platinium) / 99.9% (Golden) mesurée mensuellement</li>
            <li><strong>Performance</strong> : temps de réponse API &lt; 200ms au 95e percentile</li>
            <li><strong>Support</strong> : selon le plan souscrit (24h, 4h, ou 1h)</li>
            <li><strong>Maintenance</strong> : fenêtres de maintenance planifiées communiquées 7 jours à l'avance</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">9. Responsabilité</h2>
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">9.1 Limitation de responsabilité</h3>
          <p className="text-slate-300 mb-4">
            Dans les limites autorisées par la loi, la responsabilité totale 
            de Ziffir SAS au titre des présentes CGU est plafonnée au montant 
            des sommes versées par le client au cours des 12 derniers mois.
          </p>
          
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">9.2 Exclusion</h3>
          <p className="text-slate-300 mb-8">
            Ziffir SAS ne pourra être tenue responsable des dommages indirects, 
            perte de chiffre d'affaires, perte de données, ou perte de chance, 
            même si elle a été informée de la possibilité de tels dommages.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">10. Suspension et résiliation</h2>
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">10.1 Suspension</h3>
          <p className="text-slate-300 mb-4">
            Ziffir se réserve le droit de suspendre votre accès en cas de :
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-6">
            <li>Non-paiement après mise en demeure restée infructueuse 15 jours</li>
            <li>Violation des présentes CGU</li>
            <li>Utilisation frauduleuse ou illicite du service</li>
            <li>Atteinte à la sécurité de la plateforme</li>
          </ul>
          
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">10.2 Résiliation par le client</h3>
          <p className="text-slate-300 mb-6">
            Vous pouvez résilier votre abonnement à tout moment depuis vos 
            paramètres. La résiliation prend effet à la fin de la période de 
            facturation en cours. Aucune demande de remboursement ne sera 
            acceptée pour la période en cours.
          </p>
          
          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">10.3 Résiliation par Ziffir</h3>
          <p className="text-slate-300 mb-8">
            Ziffir peut résilier votre contrat avec un préavis de 30 jours, 
            sauf en cas de faute grave où la résiliation est immédiate.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">11. Évolution des CGU</h2>
          <p className="text-slate-300 mb-8">
            Ziffir se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification majeure avec un préavis de 30 jours avant son application.
          </p>
        </article>
      </main>
    </PublicLayout>
  );
}
