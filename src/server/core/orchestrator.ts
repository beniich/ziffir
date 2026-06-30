// src/server/core/orchestrator.ts
// ============================================================================
// Zaphir Core AI - L'Orchestrateur Central
// Écoute l'EventBus et exécute des actions transverses automatisées
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { eventBus } from './eventBus.js';
import { getRealtimeServer } from '../realtime/socketServer.js';
import { auditService } from '../domains/shared/services/audit.service.js';

const prisma = new PrismaClient();

class ZaphirCoreOrchestrator {
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // S'abonner aux événements
    eventBus.on('logistics:driver_status', this.handleDriverStatus.bind(this));
    eventBus.on('suite:occupancy_changed', this.handleOccupancyChanged.bind(this));
    eventBus.on('order:status_changed', this.handleOrderStatusChanged.bind(this));

    console.log('🧠 [Zaphir Core] AI Orchestrator initialized & listening');
  }

  // --------------------------------------------------------------------------
  // Règle 1 : Chauffeur VIP approche → Allumer la suite
  // --------------------------------------------------------------------------
  private async handleDriverStatus(payload: { hotelId: string; roomId: string; status: string }) {
    if (payload.status === 'APPROACHING_HOTEL') {
      console.log(`🧠 [Zaphir Core] VIP approaching suite ${payload.roomId}. Triggering WELCOME scene...`);
      
      try {
        const state = await prisma.suiteState.findFirst({
          where: { hotelId: payload.hotelId, roomId: payload.roomId }
        });

        if (state) {
          // Déclencher la scène WELCOME
          const updated = await prisma.suiteState.update({
            where: { id: state.id },
            data: {
              scene: 'WELCOME',
              temperatureC: 22,
              lightLevel: 70,
              curtainsOpen: true,
              musicPlaying: true,
              version: { increment: 1 },
              lastUpdatedById: 'system',
            },
            include: { room: true }
          });

          // Audit
          await auditService.append({
            eventType: 'suite.update',
            tenantId: payload.hotelId,
            actorId: 'system',
            actorType: 'system',
            resourceType: 'SuiteState',
            resourceId: state.id,
            action: 'scene.change:WELCOME',
            metadata: { trigger: 'logistics:driver_status', reason: 'VIP Approaching' },
          });

          // Broadcast Socket
          const realtime = getRealtimeServer();
          realtime.emitToHotel(payload.hotelId, 'suite:updated', {
            roomId: payload.roomId,
            state: updated,
            updatedBy: 'system',
          });
        }
      } catch (e) {
        console.error('🧠 [Zaphir Core] Failed to process driver status rule', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Règle 2 : Économie d'énergie (Green AI)
  // --------------------------------------------------------------------------
  private async handleOccupancyChanged(payload: { hotelId: string; roomId: string; isOccupied: boolean }) {
    if (!payload.isOccupied) {
      console.log(`🧠 [Zaphir Core] Suite ${payload.roomId} vacant. Scheduling AWAY scene...`);
      
      // Dans la vraie vie, on utiliserait un BullMQ / Redis pour différer
      // Ici, on le fait directement pour la démo avec un setTimeout de 10s (au lieu de 10 minutes)
      setTimeout(async () => {
        try {
          const state = await prisma.suiteState.findFirst({
            where: { hotelId: payload.hotelId, roomId: payload.roomId }
          });

          // Si la suite est toujours inoccupée au bout du timer
          if (state && !state.isOccupied && state.scene !== 'AWAY') {
            const updated = await prisma.suiteState.update({
              where: { id: state.id },
              data: {
                scene: 'AWAY',
                temperatureC: 15,
                lightLevel: 0,
                curtainsOpen: false,
                musicPlaying: false,
                version: { increment: 1 },
                lastUpdatedById: 'system',
              },
              include: { room: true }
            });

            await auditService.append({
              eventType: 'suite.update',
              tenantId: payload.hotelId,
              actorId: 'system',
              actorType: 'system',
              resourceType: 'SuiteState',
              resourceId: state.id,
              action: 'scene.change:AWAY',
              metadata: { trigger: 'suite:occupancy_changed', reason: 'Energy optimization' },
            });

            const realtime = getRealtimeServer();
            realtime.emitToHotel(payload.hotelId, 'suite:updated', {
              roomId: payload.roomId,
              state: updated,
              updatedBy: 'system',
            });
          }
        } catch (e) {
          console.error('🧠 [Zaphir Core] Failed to process green AI rule', e);
        }
      }, 10_000);
    }
  }

  // --------------------------------------------------------------------------
  // Règle 3 : Orchestration Room Service
  // --------------------------------------------------------------------------
  private async handleOrderStatusChanged(payload: { hotelId: string; orderId: string; toStatus: string }) {
    if (payload.toStatus === 'READY') {
      console.log(`🧠 [Zaphir Core] Order ${payload.orderId} READY. Auto-assigning nearest server...`);
      
      // Logique métier simulée : Assigner un serveur automatiquement si non assigné
      try {
        const order = await prisma.roomOrder.findUnique({ where: { id: payload.orderId } });
        if (order && !order.assignedServerId) {
          // Trouver un membre STAFF dispo (ici on simule en prenant le premier STAFF de l'hôtel)
          const staffMember = await prisma.membership.findFirst({
            where: { hotelId: payload.hotelId, role: 'STAFF' }
          });

          if (staffMember) {
            const updated = await prisma.roomOrder.update({
              where: { id: payload.orderId },
              data: {
                assignedServerId: staffMember.userId,
                version: { increment: 1 }
              },
              include: {
                room: true,
                items: true,
                assignedChef: { select: { displayName: true } },
                assignedServer: { select: { displayName: true } }
              }
            });

            const realtime = getRealtimeServer();
            realtime.emitToHotel(payload.hotelId, 'order:updated', updated);

            // Audit
            await auditService.append({
              eventType: 'order.auto_assign',
              tenantId: payload.hotelId,
              actorId: 'system',
              actorType: 'system',
              resourceType: 'RoomOrder',
              resourceId: payload.orderId,
              action: 'order.auto_assign',
              metadata: { serverId: staffMember.userId },
            });
          }
        }
      } catch (e) {
         console.error('🧠 [Zaphir Core] Failed to process auto-assign rule', e);
      }
    }
  }
}

export const orchestrator = new ZaphirCoreOrchestrator();
