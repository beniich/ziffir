// src/server/core/eventBus.ts
// ============================================================================
// Internal Event Bus for Zaphir Core
// Relie de façon découplée les microservices et l'Orchestrateur IA
// ============================================================================

import { EventEmitter } from 'events';

class ZaphirEventBus extends EventEmitter {
  constructor() {
    super();
    // Permet d'avoir de multiples listeners sans warning Node.js
    this.setMaxListeners(50);
  }

  /**
   * Publie un événement interne
   */
  publish(eventName: string, payload: any) {
    this.emit(eventName, payload);
    // Optionnel : logger tous les événements internes pour debug
    // console.log(`[EventBus] 📢 ${eventName}`, payload);
  }
}

// Singleton global
export const eventBus = new ZaphirEventBus();

// ============================================================================
// Types d'événements officiels du système
// ============================================================================

export type InternalEvent =
  // Logistique
  | 'logistics:driver_status'
  | 'logistics:arrival'
  // Room Service
  | 'order:created'
  | 'order:status_changed'
  // Suite Controls
  | 'suite:occupancy_changed'
  | 'suite:scene_changed';

