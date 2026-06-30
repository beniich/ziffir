// src/server/domains/arrivals/arrival-planner.service.ts
// ============================================================================
// Génère automatiquement la checklist de tasks selon le profil VIP
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type VipLevel = 'CLASSIC' | 'PREFERRED' | 'VIP' | 'PRESTIGE' | 'ROYAL' | 'BLACKLISTED';
type TransportMode = 'PRIVATE_JET' | 'COMMERCIAL_FLIGHT' | 'HELICOPTER' | 'YACHT' | 'LIMOUSINE' | 'TRAIN' | 'CAR' | 'WALKING';
type TeamType = 'RECEPTION' | 'CONCIERGERIE' | 'HOUSEKEEPING' | 'KITCHEN' | 'BELL_SERVICE' | 'TRANSPORT' | 'SECURITY' | 'MANAGEMENT' | 'EXTERNAL';

interface ArrivalInput {
  guestName: string;
  vipLevel: VipLevel;
  transportMode: TransportMode;
  scheduledArrivalAt: Date;
  scheduledDepartureAt?: Date;
  suiteReadyBy: Date;
  flightNumber?: string;
  meetingPoint?: string;
  hostUserId?: string;
  welcomeAmenity?: string;
  dietaryNotes?: string;
  suiteNotes?: string;
  createdById: string;
  roomId?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestLanguage?: string;
  flightOrigin?: string;
  specialRequests?: string;
  estimatedRevenueCents?: number;
  externalRef?: string;
  confirmationNumber?: string;
}

interface PlannedTask {
  team: TeamType;
  title: string;
  description?: string;
  dueAt: Date;
  priority: number;
  isCritical: boolean;
}

const HIGH_VIP_LEVELS: VipLevel[] = ['VIP', 'PRESTIGE', 'ROYAL'];

class ArrivalPlannerService {

  planTasks(arrival: ArrivalInput): PlannedTask[] {
    const tasks: PlannedTask[] = [];
    const arrivalTime = new Date(arrival.scheduledArrivalAt);
    const suiteReadyBy = new Date(arrival.suiteReadyBy);

    // --- HOUSEKEEPING ---
    tasks.push({
      team: 'HOUSEKEEPING',
      title: 'Inspection finale de la suite',
      description: arrival.suiteNotes || 'Préparation VIP standard',
      dueAt: new Date(suiteReadyBy.getTime() - 30 * 60_000),
      priority: 1,
      isCritical: true,
    });

    tasks.push({
      team: 'HOUSEKEEPING',
      title: 'Placement des amenities de bienvenue',
      description: arrival.welcomeAmenity || 'Fleurs fraîches + eau minérale',
      dueAt: new Date(suiteReadyBy.getTime() - 15 * 60_000),
      priority: 0,
      isCritical: false,
    });

    // --- KITCHEN ---
    tasks.push({
      team: 'KITCHEN',
      title: 'Préparation du welcome drink',
      description: arrival.dietaryNotes
        ? `Welcome drink — attention: ${arrival.dietaryNotes}`
        : 'Champagne + eau pétillante + jus de fruits frais',
      dueAt: new Date(suiteReadyBy.getTime() - 45 * 60_000),
      priority: 1,
      isCritical: false,
    });

    // --- CONCIERGERIE ---
    tasks.push({
      team: 'CONCIERGERIE',
      title: 'Vérification profil & préférences guest',
      description: 'Historique séjours, allergies, anniversaires, demandes spéciales',
      dueAt: new Date(arrivalTime.getTime() - 24 * 60 * 60_000), // T-24h
      priority: 1,
      isCritical: true,
    });

    // --- BELL SERVICE ---
    if (arrival.transportMode !== 'WALKING') {
      tasks.push({
        team: 'BELL_SERVICE',
        title: 'Voiturier en position',
        description: 'Positionnement 10min avant l\'arrivée prévue du véhicule',
        dueAt: new Date(arrivalTime.getTime() - 10 * 60_000),
        priority: 1,
        isCritical: true,
      });
    }

    // --- TRANSPORT : jet privé / hélico / yacht ---
    if (['PRIVATE_JET', 'HELICOPTER', 'YACHT'].includes(arrival.transportMode)) {
      tasks.push({
        team: 'TRANSPORT',
        title: 'Coordination avec compagnie jet/yacht',
        description: `Transport: ${arrival.flightNumber || 'N/A'} — vérifier ETA et conditions d'accueil tarmac`,
        dueAt: new Date(arrivalTime.getTime() - 2 * 60 * 60_000),
        priority: 1,
        isCritical: true,
      });
    }

    // --- EXTERNAL : tracking vol commercial ---
    if (arrival.transportMode === 'COMMERCIAL_FLIGHT' && arrival.flightNumber) {
      tasks.push({
        team: 'EXTERNAL',
        title: `Suivi vol ${arrival.flightNumber} en temps réel`,
        description: `Origine: ${arrival.flightOrigin || '?'} — Activer le tracking automatique`,
        dueAt: new Date(arrivalTime.getTime() - 3 * 60 * 60_000),
        priority: 0,
        isCritical: false,
      });
    }

    // --- RECEPTION ---
    tasks.push({
      team: 'RECEPTION',
      title: 'Pré-check-in dossier complet',
      description: 'Documents ID, carte de crédit, formulaire pré-rempli + clé suite prête',
      dueAt: new Date(arrivalTime.getTime() - 60 * 60_000),
      priority: 1,
      isCritical: false,
    });

    tasks.push({
      team: 'RECEPTION',
      title: 'Accueil physique au meeting point',
      description: arrival.meetingPoint
        ? `Position: ${arrival.meetingPoint}`
        : 'Position: Hall d\'entrée principal',
      dueAt: new Date(arrivalTime.getTime() - 5 * 60_000),
      priority: 2,
      isCritical: true,
    });

    // --- MANAGEMENT : niveaux VIP+ ---
    if (HIGH_VIP_LEVELS.includes(arrival.vipLevel) && arrival.hostUserId) {
      tasks.push({
        team: 'MANAGEMENT',
        title: 'GM / Directeur prêt pour accueil personnalisé',
        description: 'Discours personnalisé selon profil, photo souvenir si souhaité',
        dueAt: new Date(arrivalTime.getTime() - 15 * 60_000),
        priority: 2,
        isCritical: true,
      });
    }

    // --- SECURITY : ROYAL ou très haut risque ---
    if (arrival.vipLevel === 'ROYAL') {
      tasks.push({
        team: 'SECURITY',
        title: 'Périmètre sécurisé et briefing agents',
        description: 'Coordonner avec service de sécurité VIP. Vérifier accès discrets.',
        dueAt: new Date(arrivalTime.getTime() - 60 * 60_000),
        priority: 2,
        isCritical: true,
      });
    }

    return tasks;
  }

  async createArrivalWithTasks(hotelId: string, input: ArrivalInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Créer l'arrivée
      const arrival = await tx.arrival.create({
        data: {
          hotelId,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          guestLanguage: input.guestLanguage || 'fr',
          vipLevel: input.vipLevel,
          transportMode: input.transportMode,
          scheduledArrivalAt: input.scheduledArrivalAt,
          scheduledDepartureAt: input.scheduledDepartureAt || null,
          suiteReadyBy: input.suiteReadyBy,
          flightNumber: input.flightNumber || null,
          flightOrigin: input.flightOrigin || null,
          meetingPoint: input.meetingPoint || null,
          hostUserId: input.hostUserId || null,
          welcomeAmenity: input.welcomeAmenity || null,
          dietaryNotes: input.dietaryNotes || null,
          suiteNotes: input.suiteNotes || null,
          specialRequests: input.specialRequests || null,
          estimatedRevenueCents: input.estimatedRevenueCents || null,
          externalRef: input.externalRef || null,
          confirmationNumber: input.confirmationNumber || null,
          roomId: input.roomId || null,
          status: 'SCHEDULED',
          createdById: input.createdById,
        },
      });

      // 2. Générer et persister les tasks
      const planned = this.planTasks(input);

      for (const task of planned) {
        await tx.arrivalTask.create({
          data: {
            arrivalId: arrival.id,
            hotelId,
            team: task.team,
            title: task.title,
            description: task.description || null,
            dueAt: task.dueAt,
            priority: task.priority,
            isCritical: task.isCritical,
            status: 'PENDING',
            blockedBy: '[]',
          },
        });
      }

      // 3. Premier événement de statut
      await tx.arrivalStatusEvent.create({
        data: {
          arrivalId: arrival.id,
          toStatus: 'SCHEDULED',
          actorId: input.createdById,
          actorType: 'user',
          reason: 'Arrivée planifiée',
        },
      });

      return { arrival, taskCount: planned.length };
    });
  }
}

export const arrivalPlannerService = new ArrivalPlannerService();
