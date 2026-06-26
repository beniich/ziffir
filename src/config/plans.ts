/**
 * ─── ZAFIR PLATFORM — SUBSCRIPTION PLANS ────────────────────────────────────
 * Source unique de vérité pour tous les plans d'abonnement.
 * Importé par : SaaSBillingTab, MarketingWebsite, formulaire démo.
 */

export interface PlanFeature {
  text: string;
  tier: 'all' | 'starter' | 'pro' | 'enterprise';
}

export interface Plan {
  id: PlanKey;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;        // prix mensuel si facturé annuellement
  limits: {
    rooms: number;            // -1 = illimité
    staff: number;
    apiCalls: number;
    storage: number;          // en GB
    assetRenders: number;     // -1 = illimité
  };
  features: string[];
  color: string;              // couleur accent du plan
  popular?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export type PlanKey = 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export const PLANS: Record<PlanKey, Plan> = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Trial',
    tagline: 'Découvrez la plateforme sans engagement',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: { rooms: 5, staff: 2, apiCalls: 1000, storage: 1, assetRenders: 3 },
    features: [
      'Dashboard standard (5 suites max)',
      'Room Service limité',
      'Support email 48h',
      '3 rendus IA inclus',
    ],
    color: '#64748b',
  },

  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Pour les boutique-hôtels et maisons d\'hôtes',
    monthlyPrice: 99,
    annualPrice: 79,          // -20% annuel
    limits: { rooms: 20, staff: 5, apiCalls: 10000, storage: 5, assetRenders: 20 },
    features: [
      'Jusqu\'à 20 suites configurées',
      'Room Service automatisé complet',
      'Vault Cloud (5 GB documents)',
      'Support email prioritaire 24h',
      '20 rendus IA / mois',
      'Rapports mensuels exportables',
    ],
    color: '#3b82f6',
    stripePriceIdMonthly: 'price_starter_monthly',
    stripePriceIdAnnual: 'price_starter_annual',
  },

  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    tagline: 'Pour les hôtels 4 & 5 étoiles et résidences de luxe',
    monthlyPrice: 299,
    annualPrice: 239,         // -20% annuel
    limits: { rooms: 100, staff: 25, apiCalls: 100000, storage: 50, assetRenders: -1 },
    features: [
      'Jusqu\'à 100 suites configurées',
      'Suite IA complète & Analytics avancés',
      'Vault biométrique cryptographique (50 GB)',
      'Support prioritaire 24/7',
      'Rendus IA HD illimités',
      'Vidéo B-roll cinématique IA',
      'Channel Sync multi-OTA',
      'Rapports custom & exports API',
    ],
    color: '#c19a6b',
    popular: true,
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdAnnual: 'price_pro_annual',
  },

  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Pour les groupes hôteliers et palaces multi-sites',
    monthlyPrice: 999,
    annualPrice: 799,         // -20% annuel
    limits: { rooms: -1, staff: -1, apiCalls: -1, storage: 500, assetRenders: -1 },
    features: [
      'Suites & staff illimités',
      'Cluster multi-région live sync',
      'SLA garanti 99,99%',
      'Directeur de compte souverain dédié',
      'Rendu vidéo 8K ProRes',
      'White-label domaine complet',
      'Vault 500 GB + sauvegarde hors-ligne',
      'Intégration API personnalisée',
      'Formation équipes on-site incluse',
    ],
    color: '#7c3aed',
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdAnnual: 'price_enterprise_annual',
  },
};

/** Plans affichés publiquement sur la landing page (hors Trial) */
export const PUBLIC_PLANS: PlanKey[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

/** Tous les plans du dashboard incluant Trial */
export const ALL_PLANS: PlanKey[] = ['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

/** Calcule le prix affiché selon la périodicité */
export function getPlanPrice(plan: Plan, billing: 'monthly' | 'annual'): number {
  return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
}

/** Calcule l'économie annuelle totale */
export function getAnnualSavings(plan: Plan): number {
  return (plan.monthlyPrice - plan.annualPrice) * 12;
}
