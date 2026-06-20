// src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes/index';

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  // ════════════════════════════════════════════════════════════
  // MIDDLEWARES DE SÉCURITÉ
  // ════════════════════════════════════════════════════════════

  app.use(helmet({
    contentSecurityPolicy: false, // Désactivé car API pure, pas de HTML servi
    crossOriginEmbedderPolicy: false,
  }));

  // CORS restrictif
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origine non autorisée'));
      }
    },
    credentials: true,
  }));

  // Rate limiting (100 req / 15 min / IP)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Trop de requêtes, réessayez plus tard',
    },
  });
  app.use('/api/', limiter);

  // ════════════════════════════════════════════════════════════
  // PARSING
  // ════════════════════════════════════════════════════════════

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ════════════════════════════════════════════════════════════
  // ROUTES
  // ════════════════════════════════════════════════════════════

  app.use('/api', routes);

  // ════════════════════════════════════════════════════════════
  // 404
  // ════════════════════════════════════════════════════════════

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.path} introuvable`,
    });
  });

  // ════════════════════════════════════════════════════════════
  // ERROR HANDLER
  // ════════════════════════════════════════════════════════════

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
    });
  });

  return app;
};
