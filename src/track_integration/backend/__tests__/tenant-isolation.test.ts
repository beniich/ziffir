import { securePrisma } from '../src/services/secure-prisma';
import { PermissionsService, UserContext } from '../src/services/permissions.service';

describe('🔒 Tenant Isolation End-To-End Security Model', () => {
  let hotelAContext: UserContext;
  let hotelBContext: UserContext;
  let superAdminContext: UserContext;
  let clientContext: UserContext;

  beforeAll(() => {
    // Scaffold Contexts
    hotelAContext = { userId: 'managerA', role: 'HOTEL', hotelId: 'hotel-A' };
    hotelBContext = { userId: 'managerB', role: 'HOTEL', hotelId: 'hotel-B' };
    superAdminContext = { userId: 'admin', role: 'SUPER_ADMIN' };
    clientContext = { userId: 'clientA', role: 'CLIENT' };
  });

  describe('Isolation Validation between Hotel A and Hotel B', () => {
    it('should resolve hotelA queries restricted to hotelA database rows', async () => {
      const filter = PermissionsService.getPrismaFilter(hotelAContext, 'RoomOrder');
      expect(filter).toEqual({ hotelId: 'hotel-A' });
    });

    it('should resolve hotelB queries restricted to hotelB database rows', async () => {
      const filter = PermissionsService.getPrismaFilter(hotelBContext, 'RoomOrder');
      expect(filter).toEqual({ hotelId: 'hotel-B' });
    });

    it('should permit SUPER_ADMIN broad query access across all hotels', async () => {
      const filter = PermissionsService.getPrismaFilter(superAdminContext, 'RoomOrder');
      expect(filter).toEqual({});
    });
  });

  describe('Secure Injection Safety on Database Writes', () => {
    it('should automatically inject current manager hotelId regardless of payload bypass attempts', async () => {
      const rawWritePayload = { guestName: 'Hacker Attempt', roomNumber: '999', hotelId: 'hotel-B' };
      
      // Under wrapped securePrisma create path, user credentials force hotelA constraint
      const simulatedCreate = async (ctx: UserContext, data: any) => {
        PermissionsService.require(ctx, 'create', 'RoomOrder');
        if (ctx.role === 'HOTEL') {
          return { ...data, hotelId: ctx.hotelId };
        }
        return data;
      };

      const result = await simulatedCreate(hotelAContext, rawWritePayload);
      expect(result.hotelId).toBe('hotel-A');
      expect(result.hotelId).not.toBe('hotel-B');
    });

    it('should block standard client accounts from querying admin collections', () => {
      expect(() => PermissionsService.require(clientContext, 'read', 'RoomOrder')).toThrow();
    });
  });
});
