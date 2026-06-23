export type Role = 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';
export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type Subject =
  | 'Hotel'
  | 'RoomOrder'
  | 'Room'
  | 'StaffMember'
  | 'SuiteControl'
  | 'PricingRule'
  | 'VaultDocument'
  | 'AuditLog'
  | 'User'
  | 'Course'
  | 'OwnOrder';

export interface UserContext {
  userId: string;
  role: Role;
  hotelId?: string;
}

export const defineAbilityFor = (ctx: UserContext) => {
  return {
    can: (action: Action, subject: Subject, conditions?: any) => {
      return PermissionsService.can(ctx, action, subject, conditions);
    }
  };
};

export class PermissionsService {
  /**
   * Evaluates if a given user capability action can occur on the specified model
   */
  static can(ctx: UserContext, action: Action, subject: Subject, conditions?: any): boolean {
    if (ctx.role === 'SUPER_ADMIN') {
      return true;
    }

    if (ctx.role === 'VISITOR') {
      return false;
    }

    if (ctx.role === 'CLIENT') {
      // Clients can only check/update their own orders represented by OwnOrder
      if (subject === 'OwnOrder') {
        if (action === 'create') return true;
        if (conditions && conditions.guestId === ctx.userId) return true;
      }
      return false;
    }

    if (ctx.role === 'HOTEL') {
      // Hotel manager can manage its own hotels and sub-resources
      if (subject === 'Hotel') {
        if (action === 'manage') {
          if (conditions && conditions.id === ctx.hotelId) return true;
        }
        return false;
      }

      // Check if conditions filter to their own hotelId
      if (conditions && conditions.hotelId === ctx.hotelId) {
        return true;
      }

      // broad check
      if (!conditions) {
        return subject !== 'Hotel' && subject !== 'User';
      }

      return false;
    }

    return false;
  }

  /**
   * Generates automatic Prisma search filters for active multi-tenant queries
   */
  static getPrismaFilter(ctx: UserContext, subject: Subject): any {
    if (ctx.role === 'SUPER_ADMIN') {
      return {};
    }

    if (ctx.role === 'HOTEL') {
      return { hotelId: ctx.hotelId };
    }

    if (ctx.role === 'CLIENT') {
      if (subject === 'OwnOrder') {
        return { guestId: ctx.userId };
      }
      return { id: '__never_match__' };
    }

    return { id: '__never_match__' };
  }

  /**
   * Hard requirement gate that throws a standard security signature violation error if failed
   */
  static require(ctx: UserContext, action: Action, subject: Subject, conditions?: any): void {
    if (!this.can(ctx, action, subject, conditions)) {
      throw new Error(`Forbidden: Access denied for ${action} on ${subject}`);
    }
  }
}
