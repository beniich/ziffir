import {
  defineAbilityFor,
  PermissionsService,
  UserContext,
} from '../src/services/permissions.service';

describe('🔐 Permissions CASL', () => {
  describe('VISITOR', () => {
    const ctx: UserContext = { userId: 'u1', role: 'VISITOR' };

    it('ne peut RIEN faire', () => {
      expect(PermissionsService.can(ctx, 'read', 'RoomOrder')).toBe(false);
      expect(PermissionsService.can(ctx, 'read', 'Hotel')).toBe(false);
      expect(PermissionsService.can(ctx, 'create', 'RoomOrder')).toBe(false);
    });
  });

  describe('CLIENT', () => {
    const ctx: UserContext = { userId: 'client-1', role: 'CLIENT' };

    it('peut gérer ses propres commandes', () => {
      expect(PermissionsService.can(ctx, 'create', 'OwnOrder')).toBe(true);
      expect(PermissionsService.can(ctx, 'update', 'OwnOrder', { guestId: 'client-1' })).toBe(true);
    });

    it('NE peut PAS accéder aux ressources hôtel', () => {
      expect(PermissionsService.can(ctx, 'read', 'StaffMember')).toBe(false);
      expect(PermissionsService.can(ctx, 'read', 'Analytics')).toBe(false);
    });

    it('NE peut PAS gérer les commandes d\'autres clients', () => {
      expect(PermissionsService.can(ctx, 'update', 'OwnOrder', { guestId: 'other-client' })).toBe(false);
    });
  });

  describe('HOTEL', () => {
    const ctx: UserContext = { userId: 'h1', role: 'HOTEL', hotelId: 'hotel-A' };

    it('peut gérer SON hôtel', () => {
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder', { hotelId: 'hotel-A' })).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'StaffMember', { hotelId: 'hotel-A' })).toBe(true);
    });

    it('NE peut PAS gérer un AUTRE hôtel', () => {
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder', { hotelId: 'hotel-B' })).toBe(false);
      expect(PermissionsService.can(ctx, 'manage', 'Hotel', { id: 'hotel-B' })).toBe(false);
    });
  });

  describe('SUPER_ADMIN', () => {
    const ctx: UserContext = { userId: 'admin', role: 'SUPER_ADMIN' };

    it('peut TOUT faire', () => {
      expect(PermissionsService.can(ctx, 'manage', 'Hotel')).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder')).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'User')).toBe(true);
    });
  });

  describe('getPrismaFilter', () => {
    it('SUPER_ADMIN : pas de filtre', () => {
      const ctx: UserContext = { userId: 'a', role: 'SUPER_ADMIN' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({});
    });

    it('HOTEL : filtre sur hotelId', () => {
      const ctx: UserContext = { userId: 'h', role: 'HOTEL', hotelId: 'hotel-X' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({ hotelId: 'hotel-X' });
    });

    it('CLIENT : filtre sur guestId', () => {
      const ctx: UserContext = { userId: 'c', role: 'CLIENT' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'OwnOrder');
      expect(filter).toEqual({ guestId: 'c' });
    });

    it('CLIENT sur ressource hôtel : bloqué', () => {
      const ctx: UserContext = { userId: 'c', role: 'CLIENT' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({ id: '__never_match__' });
    });
  });
});
