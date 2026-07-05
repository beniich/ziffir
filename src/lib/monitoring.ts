/**
 * Monitoring Service — Ziffir
 * Abstraction légère autour de Datadog StatsD.
 * Sans Datadog configuré, les métriques sont simplement loggées.
 */

interface MetricTag {
  key: string;
  value: string | number | boolean;
}

class MonitoringService {
  private readonly enabled: boolean;
  private readonly prefix = 'ziffir.';

  constructor() {
    this.enabled = !!import.meta?.env?.VITE_DD_ENABLED || (typeof process !== 'undefined' && !!process.env?.DD_SERVICE);
  }

  private tag(key: string, value: string | number | boolean): string {
    return `${key}:${value}`;
  }

  private log(type: string, metric: string, value: number, tags: string[]) {
    if (import.meta?.env?.DEV) {
      console.debug(`[Monitoring] ${type} ${this.prefix}${metric}=${value} tags=[${tags.join(',')}]`);
    }
  }

  // ===========================================================================
  // BUSINESS METRICS
  // ===========================================================================

  trackHotelCreated(plan: string) {
    this.log('increment', 'hotel.created', 1, [this.tag('plan', plan)]);
  }

  trackSubscriptionChange(from: string, to: string) {
    this.log('increment', 'subscription.changed', 1, [
      this.tag('from', from),
      this.tag('to', to),
    ]);
  }

  trackChurn(plan: string) {
    this.log('increment', 'hotel.churned', 1, [this.tag('plan', plan)]);
  }

  // ===========================================================================
  // USAGE METRICS
  // ===========================================================================

  trackRoomOrder(status: string, durationMs?: number) {
    this.log('increment', 'order.created', 1, [this.tag('status', status)]);
    if (durationMs) {
      this.log('histogram', 'order.duration_ms', durationMs, [this.tag('status', status)]);
    }
  }

  trackWineRecommendation(accepted: boolean, confidence: number) {
    this.log('increment', 'wine.recommendation', 1, [this.tag('accepted', accepted)]);
    this.log('histogram', 'wine.confidence', confidence, []);
  }

  // ===========================================================================
  // TECHNICAL METRICS
  // ===========================================================================

  trackApiCall(endpoint: string, method: string, statusCode: number, durationMs: number) {
    this.log('histogram', 'api.request_ms', durationMs, [
      this.tag('endpoint', endpoint),
      this.tag('method', method),
      this.tag('status', statusCode),
    ]);
  }

  trackSocketEvent(event: string) {
    this.log('increment', 'socket.event', 1, [this.tag('event', event)]);
  }

  trackError(errorName: string, message: string) {
    this.log('increment', 'error', 1, [
      this.tag('type', errorName),
      this.tag('message', message.slice(0, 50)),
    ]);
  }

  // ===========================================================================
  // CUSTOM EVENTS (Datadog Events API)
  // ===========================================================================

  trackEvent(title: string, properties: Record<string, unknown> = {}) {
    const DD_API_KEY = typeof process !== 'undefined' ? process.env?.DD_API_KEY : undefined;
    if (!DD_API_KEY) return;

    fetch('https://api.datadoghq.com/api/v1/events', {
      method: 'POST',
      headers: {
        'DD-API-KEY': DD_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        text: JSON.stringify(properties, null, 2),
        tags: ['source:ziffir'],
      }),
    }).catch(() => {/* fire and forget */});
  }
}

export const monitoring = new MonitoringService();
