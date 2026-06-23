import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import type { UserRole } from '../types';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type Subject =
  | 'all'
  | 'Hotel' | 'RoomOrder' | 'Room' | 'StaffMember'
  | 'Course' | 'VaultDocument' | 'PricingRule'
  | 'SuiteControl' | 'AuditLog' | 'User' | 'Analytics'
  | 'OwnOrder' | 'OwnInvoice' | 'OwnProfile' | 'Advertisement'
  | 'Dashboard' | 'Settings';

export type AppAbility = MongoAbility<[Action, Subject]>;

export interface AbilityContext {
  userId: string;
  role: UserRole;
  hotelId?: string | null;
}

export const defineAbilityFor = (ctx: AbilityContext): AppAbility => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (ctx.role) {
    case 'VISITOR':
      // Pages publiques uniquement
      can('read', 'Hotel');
      break;

    case 'CLIENT':
      // Ses propres données
      can('read', 'OwnOrder');
      can('create', 'OwnOrder');
      can('update', 'OwnOrder', { guestId: ctx.userId });
      can('read', 'OwnInvoice');
      can('read', 'OwnProfile', { id: ctx.userId });
      can('update', 'OwnProfile', { id: ctx.userId });
      can('read', 'Advertisement');

      // Accès UI
      can('read', 'Dashboard');
      can('read', 'Settings');

      // Bloquer le reste explicitement
      cannot('read', 'StaffMember');
      cannot('read', 'Analytics');
      cannot('read', 'AuditLog');
      cannot('read', 'VaultDocument');
      cannot('read', 'Hotel');
      break;

    case 'HOTEL':
      // Accès complet à SON hôtel
      can('manage', 'Hotel', { id: ctx.hotelId });
      can('manage', 'RoomOrder', { hotelId: ctx.hotelId });
      can('manage', 'Room', { hotelId: ctx.hotelId });
      can('manage', 'StaffMember', { hotelId: ctx.hotelId });
      can('manage', 'SuiteControl', { hotelId: ctx.hotelId });
      can('manage', 'PricingRule', { hotelId: ctx.hotelId });
      can('read', 'VaultDocument', { hotelId: ctx.hotelId });
      can('create', 'VaultDocument', { hotelId: ctx.hotelId });
      can('read', 'Analytics', { hotelId: ctx.hotelId });
      can('read', 'AuditLog', { hotelId: ctx.hotelId });
      can('read', 'Course');
      can('create', 'Course', { hotelId: ctx.hotelId });

      // Accès UI
      can('read', 'Dashboard');
      can('read', 'Settings');
      break;

    case 'SUPER_ADMIN':
      can('manage', 'all');
      break;
  }

  return build();
};
