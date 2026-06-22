import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Import configurations de sécurité
import { helmetConfig } from './config/security';
import { corsConfig } from './config/cors';
import { globalLimiter } from './config/rateLimit';
import { sanitizeInputs } from './middleware/sanitization';
import { csrfProtection } from './middleware/csrf';
import { auditTrail } from './middleware/auditTrail';
import { customSecurityHeaders } from './middleware/securityHeaders';

import routes from './routes';
import billingRoutes from './routes/billing.routes';
import stripeWebhookRoutes from './routes/stripe-webhook.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { setupSwagger } from './utils/swagger';
import { metricsMiddleware } from './middleware/metrics';

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  // Métriques Prometheus (en premier pour mesurer fidèlement)
  app.use(metricsMiddleware);

  // Logging des requêtes HTTP
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });

  // Swagger Documentation
  setupSwagger(app);

  // ════════════════════════════════════════════════════════════
  // SÉCURITÉ - LES 8 COUCHES
  // ════════════════════════════════════════════════════════════

  // Couche 1 & 8 : Headers de sécurité (Helmet + Custom)
  app.use(helmet(helmetConfig));
  app.use(customSecurityHeaders);

  // Couche 6 : CORS & CSRF
  app.use(corsConfig);
  app.use(csrfProtection);

  // Couche 2 : Rate Limiting Global
  app.use(globalLimiter);

  // ════════════════════════════════════════════════════════════
  // PARSING & SANITIZATION
  // ════════════════════════════════════════════════════════════

  // ⚠️ CRITIQUE : Le webhook DOIT être monté AVANT express.json()
  app.use('/api/billing', stripeWebhookRoutes);

  app.use(express.json({ limit: '10kb' })); // Limite stricte pour JSON (Couche 3)
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Couche 3 : Nettoyage XSS/NoSQLi des inputs
  app.use(sanitizeInputs);

  // Couche 7 : Audit Trail pour mutations
  app.use(auditTrail);

  // ════════════════════════════════════════════════════════════
  // ROUTES
  // ════════════════════════════════════════════════════════════

  app.use('/api', routes);

  // Billing routes (APRÈS auth globale - montées dans routes/index.ts ou ici, on suit la consigne d'ici)
  app.use('/api/billing', billingRoutes);

  // ════════════════════════════════════════════════════════════
  // ERROR HANDLERS (DOIVENT ÊTRE EN DERNIER)
  // ════════════════════════════════════════════════════════════

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
