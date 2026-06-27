import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.routes';
import roomOrdersRoutes from './routes/room-orders.routes';
import staffRoutes from './routes/staff.routes';
import vaultRoutes from './routes/vault.routes';
import auditsRoutes from './routes/audits.routes';
import analyticsRoutes from './routes/analytics.routes';
import controlsRoutes from './routes/controls.routes';
import pricingRoutes from './routes/pricing.routes';
import billingRoutes from './routes/billing.routes';
import teamRoutes from './routes/team.routes';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow no origin (curl, Postman) and allowed list
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// ── Webhooks (Must be before express.json) ────────────────────
app.use('/api/billing', billingRoutes); // Has raw() on /webhook

// ── JSON Body parser (for all other routes) ─────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/room-orders', roomOrdersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/audits', auditsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/team', teamRoutes);
// app.use('/api/stripe', stripeRoutes); // Replaced by billingRoutes

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Zaphir Backend running on port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
});
