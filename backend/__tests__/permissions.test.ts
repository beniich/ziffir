import {
  defineAbilityFor,
  PermissionsService,
  UserContext,
} from '../src/services/permissions.service';

describe('🔐 Permissions CASL Validation', () => {
  describe('VISITOR Role Clearance', () => {
    const ctx: UserContext = { userId: 'u1', role: 'VISITOR' };

    it('should prevent access on all restricted models and actions', () => {
      expect(PermissionsService.can(ctx, 'read', 'RoomOrder')).toBe(false);
      expect(PermissionsService.can(ctx, 'read', 'Hotel')).toBe(false);
      expect(PermissionsService.can(ctx, 'create', 'RoomOrder')).toBe(false);
    });
  });

  describe('CLIENT Role Clearance', () => {
    const ctx: UserContext = { userId: 'client-1', role: 'CLIENT' };

    it('should permit operations on own client orders', () => {
      expect(PermissionsService.can(ctx, 'create', 'OwnOrder')).toBe(true);
      expect(PermissionsService.can(ctx, 'update', 'OwnOrder', { guestId: 'client-1' })).toBe(true);
    });

    it('should deny actions on resources owned by hotels or staff members', () => {
      expect(PermissionsService.can(ctx, 'read', 'StaffMember')).toBe(false);
    });

    it('should deny actions on orders belonging to other client accounts', () => {
      expect(PermissionsService.can(ctx, 'update', 'OwnOrder', { guestId: 'other-client' })).toBe(false);
    });
  });

  describe('HOTEL Role Clearance', () => {
    const ctx: UserContext = { userId: 'h1', role: 'HOTEL', hotelId: 'hotel-A' };

    it('should authorize management within their allocated Hotel ID bounds', () => {
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder', { hotelId: 'hotel-A' })).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'StaffMember', { hotelId: 'hotel-A' })).toBe(true);
    });

    it('should strictly deny management across other Hotel IDs or broad Hotels profiles', () => {
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder', { hotelId: 'hotel-B' })).toBe(false);
      expect(PermissionsService.can(ctx, 'manage', 'Hotel', { id: 'hotel-B' })).toBe(false);
    });
  });

  describe('SUPER_ADMIN Override Clearance', () => {
    const ctx: UserContext = { userId: 'admin', role: 'SUPER_ADMIN' };

    it('should authorize all actions across all domains', () => {
      expect(PermissionsService.can(ctx, 'manage', 'Hotel')).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'RoomOrder')).toBe(true);
      expect(PermissionsService.can(ctx, 'manage', 'User')).toBe(true);
    });
  });

  describe('Automatic Search Prisma Filtering', () => {
    it('should return empty bounds filter for SUPER_ADMIN queries', () => {
      const ctx: UserContext = { userId: 'a', role: 'SUPER_ADMIN' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({});
    });

    it('should return hotelId isolated filter for HOTEL manager roles', () => {
      const ctx: UserContext = { userId: 'h', role: 'HOTEL', hotelId: 'hotel-X' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({ hotelId: 'hotel-X' });
    });

    it('should return guestId isolated filter for OwnOrder client queries', () => {
      const ctx: UserContext = { userId: 'c', role: 'CLIENT' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'OwnOrder');
      expect(filter).toEqual({ guestId: 'c' });
    });

    it('should return fail matcher if CLIENT queries non-permitted collections directly', () => {
      const ctx: UserContext = { userId: 'c', role: 'CLIENT' };
      const filter = PermissionsService.getPrismaFilter(ctx, 'RoomOrder');
      expect(filter).toEqual({ id: '__never_match__' });
    });
  });

  describe('Safety Require Gate', () => {
    it('should throw Error if unauthorized', () => {
      const ctx: UserContext = { userId: 'v', role: 'VISITOR' };
      expect(() => PermissionsService.require(ctx, 'read', 'RoomOrder')).toThrow();
    });
  });
});
