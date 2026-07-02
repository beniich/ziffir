import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { microserviceService } from './src/server/microservices.js';
import { requireAuth } from './src/server/middleware/cookieAuth.js';
import { trackTokens } from './src/server/security/tokenTracker.js';
import { initRealtimeServer } from './src/server/realtime/socketServer.js';
import { orchestrator } from './src/server/core/orchestrator.js';
import suiteControlsRoutes from './src/server/routes/suite-controls.routes.js';
import roomOrdersRoutes from './src/server/routes/room-orders.routes.js';
import pushRoutes from './src/server/routes/push.routes.js';
import apiManagerRoutes from './src/server/routes/api-manager.routes.js';
import arrivalsRoutes from './src/server/routes/arrivals.routes.js';
import authRoutes from './src/server/domains/auth/auth.routes.js';
import teamRoutes from './src/server/routes/team.routes.js';
import cors from 'cors';
import { config } from './src/server/config.js';

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = 3000;

  // CORS
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true, // ⚠️ indispensable pour les cookies
  }));

  app.use(express.json());
  app.use(cookieParser(config.cookies.domain));

  app.use('/api/auth', authRoutes);
  app.use('/api/team', teamRoutes);

  // --- ZAPHIR SECURITY ENVELOPE ---
  // Ensure all API endpoints are authenticated and tracked
  app.use('/api', requireAuth);
  app.use('/api', trackTokens(1)); // Charge 1 token for standard API calls

  // --- SUITE CONTROLS (Prisma + Socket.IO) ---
  app.use('/api/suite-controls', suiteControlsRoutes);

  // --- ROOM SERVICE (Semaine 2) ---
  app.use('/api/room-orders', roomOrdersRoutes);
  app.use('/api/push', pushRoutes);

  // --- API & TOKEN MANAGER (Semaine 3) ---
  app.use('/api/tokens', apiManagerRoutes);

  // --- ARRIVALS VIP (Semaine 3) ---
  app.use('/api/arrivals', arrivalsRoutes);

  // --- API ROUTES FOR ZAPHIR 23 MICROSERVICES ---

  // Unified State Handshake Endpoint
  app.get('/api/state', async (req, res) => {
    try {
      const state = await microserviceService.getAllStates(req.user?.tenantId || 'default');
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching state' });
    }
  });

  // 1. VIP Arrivals
  app.get('/api/logistics/arrivals', async (req, res) => {
    try {
      const data = await microserviceService.getArrivals(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/logistics/arrivals', async (req, res) => {
    try {
      await microserviceService.saveArrivals(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Chauffeur Fleet
  app.get('/api/logistics/fleet', async (req, res) => {
    try {
      const data = await microserviceService.getFleet(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/logistics/fleet', async (req, res) => {
    try {
      await microserviceService.saveFleet(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Footfall/Heatmap Logistics
  app.get('/api/logistics/heatmap', async (req, res) => {
    try {
      const data = await microserviceService.getHeatmap(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/logistics/heatmap', async (req, res) => {
    try {
      await microserviceService.saveHeatmap(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Yachting Edition
  app.get('/api/logistics/yachting', async (req, res) => {
    try {
      const data = await microserviceService.getYachting(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/logistics/yachting', async (req, res) => {
    try {
      await microserviceService.saveYachting(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Room Service Gastronomy
  app.get('/api/hospitality/room-service', async (req, res) => {
    try {
      const data = await microserviceService.getRoomService(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/hospitality/room-service', async (req, res) => {
    try {
      await microserviceService.saveRoomService(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Suite Controls (Domotics)
  app.get('/api/hospitality/suite-controls', async (req, res) => {
    try {
      const data = await microserviceService.getSuiteControls(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/hospitality/suite-controls', async (req, res) => {
    try {
      await microserviceService.saveSuiteControls(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Suite Portal
  app.get('/api/hospitality/suite-portal', async (req, res) => {
    try {
      const data = await microserviceService.getSuitePortal(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/hospitality/suite-portal', async (req, res) => {
    try {
      await microserviceService.saveSuitePortal(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Spa Wellness
  app.get('/api/hospitality/wellness', async (req, res) => {
    try {
      const data = await microserviceService.getWellness(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/hospitality/wellness', async (req, res) => {
    try {
      await microserviceService.saveWellness(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Royal Wine Cellar
  app.get('/api/commerce/wine-cellar', async (req, res) => {
    try {
      const data = await microserviceService.getWineCellar(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/wine-cellar', async (req, res) => {
    try {
      await microserviceService.saveWineCellar(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. VIP Memberships
  app.get('/api/commerce/memberships', async (req, res) => {
    try {
      const data = await microserviceService.getMemberships(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/memberships', async (req, res) => {
    try {
      await microserviceService.saveMemberships(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. Metal Cards Configurator
  app.get('/api/commerce/metal-cards', async (req, res) => {
    try {
      const data = await microserviceService.getMetalCards(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/metal-cards', async (req, res) => {
    try {
      await microserviceService.saveMetalCards(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. Rates & Revenue Management
  app.get('/api/commerce/pricing', async (req, res) => {
    try {
      const data = await microserviceService.getPricing(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/pricing', async (req, res) => {
    try {
      await microserviceService.savePricing(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. Brand & Atmosphere CMS
  app.get('/api/commerce/cms', async (req, res) => {
    try {
      const data = await microserviceService.getCMS(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/cms', async (req, res) => {
    try {
      await microserviceService.saveCMS(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 14. Business Center
  app.get('/api/commerce/business', async (req, res) => {
    try {
      const data = await microserviceService.getBusiness(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/business', async (req, res) => {
    try {
      await microserviceService.saveBusiness(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 15. Testimonials
  app.get('/api/commerce/testimonials', async (req, res) => {
    try {
      const data = await microserviceService.getTestimonials(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/testimonials', async (req, res) => {
    try {
      await microserviceService.saveTestimonials(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 16. Secure Vault
  app.get('/api/security-tech/vault', async (req, res) => {
    try {
      const data = await microserviceService.getVault(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/vault', async (req, res) => {
    try {
      await microserviceService.saveVault(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 17. Facility Maintenance
  app.get('/api/security-tech/maintenance', async (req, res) => {
    try {
      const data = await microserviceService.getMaintenance(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/maintenance', async (req, res) => {
    try {
      await microserviceService.saveMaintenance(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 18. Academic Ledger
  app.get('/api/security-tech/ledger', async (req, res) => {
    try {
      const data = await microserviceService.getLedger(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/ledger', async (req, res) => {
    try {
      await microserviceService.saveLedger(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 19. Channel Sync
  app.get('/api/commerce/channel-sync', async (req, res) => {
    try {
      const data = await microserviceService.getChannelSync(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/commerce/channel-sync', async (req, res) => {
    try {
      await microserviceService.saveChannelSync(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 20. Predictive Maintenance (IA)
  app.get('/api/security-tech/predictive', async (req, res) => {
    try {
      const data = await microserviceService.getPredictive(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/predictive', async (req, res) => {
    try {
      await microserviceService.savePredictive(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 21. Cybersecurity
  app.get('/api/security-tech/cyber', async (req, res) => {
    try {
      const data = await microserviceService.getCyber(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/cyber', async (req, res) => {
    try {
      await microserviceService.saveCyber(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 22. Energy Grid
  app.get('/api/security-tech/energy', async (req, res) => {
    try {
      const data = await microserviceService.getEnergy(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/energy', async (req, res) => {
    try {
      await microserviceService.saveEnergy(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 23. Emergency Gate
  app.get('/api/security-tech/emergency', async (req, res) => {
    try {
      const data = await microserviceService.getEmergency(req.user?.tenantId || 'default');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/security-tech/emergency', async (req, res) => {
    try {
      await microserviceService.saveEmergency(req.user?.tenantId || 'default', req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- INTEGRATION WITH VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- SOCKET.IO REALTIME SERVER ---
  initRealtimeServer(httpServer);

  // --- ZAPHIR CORE AI ORCHESTRATOR ---
  orchestrator.init();

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Zaphir Full-Stack Hub running on port ${PORT}`);
    console.log(`⚡ Socket.IO realtime server active`);
  });
}

startServer();
