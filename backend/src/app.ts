import * as Sentry from '@sentry/node';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import guestsRoutes from './routes/guests.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import superRoutes from './routes/super.routes.js';
import mockStripeRoutes from './routes/mock-stripe.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import housekeepingRoutes from './routes/housekeeping.routes.js';
import channelsRoutes from './routes/channels.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import segmentationRoutes from './routes/segmentation.routes.js';
import leadRoutes from './routes/leads.routes.js';
import adminMetricsRoutes from './routes/admin-metrics.routes.js';
import affiliateRoutes from './routes/affiliates.routes.js';
import billingRoutes from './routes/billing.routes.js';
import v1Routes from './routes/v1.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import roomServiceRoutes from './routes/room-service.routes.js';
import minibarRoutes from './routes/minibar.routes.js';
import auditRoutes from './domains/audit/audit.routes.js';
import { hotelRouter } from './domains/hotel/hotel.routes.js';
import { userRouter } from './domains/user/user.routes.js';
import { adminRouter } from './domains/admin/admin.routes.js';

export function createApp() {
  const app = express();

  // Initialisation de Sentry
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: env.NODE_ENV,
    });
  }

  // Sécurité
  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        // En développement, on autorise localhost ou IPs locales (peu importe le port : 3000, 3002...)
        // On autorise aussi si pas d'origin (ex: postman)
        if (!origin || /localhost|192\.168\.|172\.|127\.0\.0\.1/.test(origin) || origin === env.CORS_ORIGIN) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // crucial pour les cookies cross-origin
    })
  );

  // Webhooks Stripe en raw
  app.use('/api/billing', billingRoutes);

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // ISO 27001 Cache Headers
  app.use((req, res, next) => {
    // Empêche le cache des endpoints API sensibles
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
  });

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/hotel', hotelRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/guests', guestsRoutes);
  app.use('/api/reservations', reservationsRoutes);
  app.use('/api/super', superRoutes);
  app.use('/api/invoices', invoicesRoutes);
  app.use('/api/housekeeping', housekeepingRoutes);
  app.use('/api/channels', channelsRoutes);
  app.use('/api/analytics-v2', analyticsRoutes);
  app.use('/api/segmentation', segmentationRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/admin/metrics', adminMetricsRoutes);
  app.use('/api/admin', adminRouter);
  app.use('/api/affiliates', affiliateRoutes);
  app.use('/api/v1', v1Routes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/room-service', roomServiceRoutes);
  app.use('/api/minibar', minibarRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/hotels', hotelRouter);
  app.use('/api/users', userRouter);

  if (env.STRIPE_MOCK_MODE === 'true') {
    app.use('/mock-stripe', mockStripeRoutes);
  }

  // 404
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Route introuvable' });
  });

  // Gestionnaire d'erreurs Sentry
  if (env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  // Error handler global
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur interne' });
  });

  return app;
}
