import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './socket.js';
import { setIo } from './lib/io.js';
import { setupWeeklyReportJob } from './jobs/weekly-report.job.js';
import { setupMetricsJob } from './jobs/metrics.job.js';
import { setupAffiliatePayoutJob } from './jobs/affiliate-payout.job.js';
import { startOnboardingJob } from './jobs/onboarding.job.js';
import { startSlackAlerts } from './services/slack-alerts.service.js';

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer, env.CORS_ORIGIN);
setIo(io);

// Initialisation des jobs cron
setupWeeklyReportJob();
setupMetricsJob();
setupAffiliatePayoutJob();
startOnboardingJob();
startSlackAlerts();

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Serveur prêt sur http://localhost:${env.PORT}`);
  console.log(`   CORS origin : ${env.CORS_ORIGIN}`);
  console.log(`   Mode : ${env.NODE_ENV}`);
  console.log(`   WebSocket path : /socket.io`);
});
