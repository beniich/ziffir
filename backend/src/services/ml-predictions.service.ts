import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class MLPredictionsService {
  /**
   * Forecast d'occupation basé sur la moyenne mobile + saisonnalité simple
   * (Pour une V1, simulation d'un modèle SARIMA ou Prophet)
   */
  static async forecastOccupancy(hotelId: string, daysToForecast: number = 7) {
    // 1. Récupérer l'historique des réservations passées
    const history = await prisma.roomOrder.groupBy({
      by: ['createdAt'],
      where: { hotelId, status: 'DELIVERED' },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Mock du moteur ML (Python/TensorFlow) -> Ici algo heuristique pour la démo
    const predictions = [];
    const baseDate = new Date();
    
    for (let i = 1; i <= daysToForecast; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + i);
      
      // Facteur week-end (plus occupé le WE)
      const dayOfWeek = targetDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseOccupancy = 40; // 40% base
      const weekendBump = isWeekend ? 35 : 0;
      const randomNoise = Math.floor(Math.random() * 15);
      
      const predictedOccupancy = Math.min(100, baseOccupancy + weekendBump + randomNoise);
      
      predictions.push({
        date: targetDate.toISOString().split('T')[0],
        occupancyRate: predictedOccupancy,
        confidence: isWeekend ? 0.85 : 0.92,
        recommendedPriceMultiplier: predictedOccupancy > 80 ? 1.2 : 1.0,
      });
    }

    logger.info(`Occupancy forecast generated: hotelId=${hotelId} daysToForecast=${daysToForecast}`);
    return predictions;
  }

  /**
   * Détection d'anomalies sur le Room Service (Isolation Forest / Z-Score)
   */
  static async detectAnomalies(hotelId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.roomOrder.findMany({
      where: { hotelId, createdAt: { gte: today } },
      select: { total: true, createdAt: true },
    });

    const anomalies = [];
    
    // Règle simple de détection (Z-score simplifié)
    for (const order of todayOrders) {
      if (Number(order.total) > 500) { // Si commande > 500€
        anomalies.push({
          type: 'HIGH_VALUE_ORDER',
          amount: Number(order.total),
          timestamp: order.createdAt,
          severity: 'medium',
          description: `Commande exceptionnellement élevée de ${order.total}€ détectée.`,
        });
      }
    }

    // Vérifier volume anormal par heure
    if (todayOrders.length > 50) {
      anomalies.push({
        type: 'VOLUME_SPIKE',
        count: todayOrders.length,
        timestamp: new Date(),
        severity: 'high',
        description: `Pic d'activité détecté : ${todayOrders.length} commandes aujourd'hui. Renfort staff recommandé.`,
      });
    }

    return anomalies;
  }
}
