import helmet, { HelmetOptions } from 'helmet';

/**
 * Configuration Helmet renforcée pour production.
 * Active tous les headers de sécurité recommandés par OWASP.
 */
export const helmetConfig: HelmetOptions = {
  // Content Security Policy (pour les éventuelles pages HTML servies)
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],  // ⚠️ Pas de 'unsafe-inline' en prod
      styleSrc: ["'self'", "'unsafe-inline'"],  // Tailwind nécessite unsafe-inline pour styles dynamiques
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'"],
      mediaSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // HSTS : forcer HTTPS pendant 1 an
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Empêcher le MIME-sniffing
  noSniff: true,

  // Clickjacking protection
  frameguard: { action: 'deny' },

  // XSS filter (legacy)
  xssFilter: true,

  // Referrer strict
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Permissions Policy : désactiver les APIs non utilisées
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Hide X-Powered-By
  hidePoweredBy: true,

  // Cross-Origin policies
  crossOriginEmbedderPolicy: false,  // Désactivé car API pure
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // Origin Agent Cluster
  originAgentCluster: true,

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // IE No Open
  ieNoOpen: true,
};
