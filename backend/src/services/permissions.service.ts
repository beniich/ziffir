import { AbilityBuilder, createMongoAbility, MongoAbility, ForbiddenError } from '@casl/ability';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type Subject =
  | 'all'
  | 'Hotel' | 'RoomOrder' | 'Room' | 'StaffMember'
  | 'Course' | 'VaultDocument' | 'Analytics'
  | 'PricingRule' | 'SuiteControl' | 'AuditLog' | 'User'
  | 'OwnOrder' | 'OwnInvoice' | 'OwnProfile' | 'Advertisement' | 'Activity';

export type AppAbility = MongoAbility<[Action, Subject]>;

export interface UserContext {
  userId: string;
  role: 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';
  hotelId?: string | null;
}

/**
 * Définit les permissions selon le rôle + contexte.
 */
export const defineAbilityFor = (ctx: UserContext): AppAbility => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Coerce hotelId to string for MongoQuery conditions (null/undefined guarded below)
  const hid = ctx.hotelId ?? '';

  switch (ctx.role) {
    case 'VISITOR':
      // Aucune permission (accès public géré en amont)
      break;

    case 'CLIENT':
      can('read', 'OwnOrder');
      can('create', 'OwnOrder');
      can('update', 'OwnOrder', { guestId: ctx.userId } as any);
      can('read', 'OwnInvoice');
      can('read', 'OwnProfile', { id: ctx.userId } as any);
      can('update', 'OwnProfile', { id: ctx.userId } as any);
      can('read', 'Advertisement');
      can('read', 'Activity');
      // Bloquer explicitement l'accès aux ressources hôtel
      cannot('read', 'StaffMember');
      cannot('read', 'AuditLog');
      cannot('read', 'Analytics');
      break;

    case 'HOTEL':
      can('manage', 'Hotel', { id: hid } as any);
      can('manage', 'RoomOrder', { hotelId: hid } as any);
      can('manage', 'Room', { hotelId: hid } as any);
      can('manage', 'StaffMember', { hotelId: hid } as any);
      can('manage', 'SuiteControl', { hotelId: hid } as any);
      can('manage', 'PricingRule', { hotelId: hid } as any);
      can('read', 'VaultDocument', { hotelId: hid } as any);
      can('create', 'VaultDocument', { hotelId: hid } as any);
      can('read', 'Analytics', { hotelId: hid } as any);
      can('read', 'AuditLog', { hotelId: hid } as any);
      can('read', 'Course');
      can('create', 'Course', { hotelId: hid } as any);
      break;

    case 'SUPER_ADMIN':
      can('manage', 'all');
      break;
  }

  return build();
};

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

export class PermissionsService {
  /**
   * Vérifie si l'utilisateur PEUT effectuer une action.
   */
  static can(
    ctx: UserContext,
    action: Action,
    subject: Subject,
    resource?: Record<string, any>,
  ): boolean {
    const ability = defineAbilityFor(ctx);
    // ability.can 3rd arg is the resource object; cast to any to avoid strict MongoQuery mismatch
    return ability.can(action, subject as any, resource as any);
  }

  /**
   * Throw une erreur 403 si l'utilisateur ne peut PAS.
   */
  static require(
    ctx: UserContext,
    action: Action,
    subject: Subject,
    resource?: Record<string, any>,
  ): void {
    const ability = defineAbilityFor(ctx);
    ForbiddenError.from(ability).throwUnlessCan(action, subject as any, resource as any);
  }

  /**
   * Retourne le filtre Prisma WHERE selon le rôle.
   * C'EST LA CLÉ DU MULTI-TENANT.
   */
  static getPrismaFilter(ctx: UserContext, subject: Subject): Record<string, any> {
    if (ctx.role === 'SUPER_ADMIN') {
      return {}; // Pas de filtre
    }

    if (ctx.role === 'HOTEL') {
      if (!ctx.hotelId) {
        return { id: '__never_match__' }; // Bloqué
      }

      // Si la ressource est liée à un hôtel
      if (['Hotel', 'RoomOrder', 'Room', 'StaffMember', 'SuiteControl', 'PricingRule', 'VaultDocument'].includes(subject)) {
        return { hotelId: ctx.hotelId };
      }

      // Pour les ressources globales (Course, AuditLog)
      if (subject === 'AuditLog') {
        return { hotelId: ctx.hotelId };
      }

      return { hotelId: ctx.hotelId };
    }

    if (ctx.role === 'CLIENT') {
      if (subject === 'OwnOrder') return { guestId: ctx.userId };
      if (subject === 'OwnInvoice') return { userId: ctx.userId };
      if (subject === 'OwnProfile') return { id: ctx.userId };

      // Bloquer tout le reste
      return { id: '__never_match__' };
    }

    return { id: '__never_match__' };
  }
}
