import cron from 'node-cron';
import { computeDailyMetrics, cleanupOldWebhookLogs } from '../services/events.service.js';

export function setupMetricsJob() {
  // Tous les jours à 00:30 (laisse le temps aux events de se flusher)
  cron.schedule('30 0 * * *', async () => {
    console.log('📊 Computing daily metrics…');
    try {
      // Recalcule aujourd'hui + hier (au cas où)
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      await computeDailyMetrics(today);
      await computeDailyMetrics(yesterday);
      
      // Nettoyage mensuel/hebdomadaire (on le fait tous les jours pour simplifier)
      await cleanupOldWebhookLogs();
    } catch (e) {
      console.error('Metrics job failed:', e);
    }
  });
}
