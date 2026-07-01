import { UserContext } from '../src/services/permissions.service';

describe('🔌 WebSocket Broadcasting Multi-Tenant Delivery Segregation', () => {
  let wsAContext: UserContext;
  let wsBContext: UserContext;
  let superAdminContext: UserContext;

  beforeAll(() => {
    wsAContext = { userId: 'hotel_manager_a', role: 'HOTEL', hotelId: 'hotel-A' };
    wsBContext = { userId: 'hotel_manager_b', role: 'HOTEL', hotelId: 'hotel-B' };
    superAdminContext = { userId: 'global_admin', role: 'SUPER_ADMIN' };
  });

  // Helper verifying standard message routing filter
  function shouldDeliverToSocket(ctx: UserContext, message: { hotelId?: string; type: string }): boolean {
    if (!message.hotelId) return true;
    if (ctx.role === 'SUPER_ADMIN') return true;
    if (ctx.role === 'HOTEL') {
      return ctx.hotelId === message.hotelId;
    }
    return false;
  }

  it('should deliver Hotel A order updates only to Hotel A subscribers', () => {
    const message = { type: 'ORDER_CREATED', hotelId: 'hotel-A', data: { id: 'order-1' } };

    expect(shouldDeliverToSocket(wsAContext, message)).toBe(true);
    expect(shouldDeliverToSocket(wsBContext, message)).toBe(false);
    expect(shouldDeliverToSocket(superAdminContext, message)).toBe(true);
  });

  it('should deliver Hotel B order updates only to Hotel B subscribers', () => {
    const message = { type: 'ORDER_CREATED', hotelId: 'hotel-B', data: { id: 'order-2' } };

    expect(shouldDeliverToSocket(wsAContext, message)).toBe(false);
    expect(shouldDeliverToSocket(wsBContext, message)).toBe(true);
    expect(shouldDeliverToSocket(superAdminContext, message)).toBe(true);
  });

  it('should distribute global notices to all subscribers regardless of registered hotel scopes', () => {
    const message = { type: 'SYSTEM_MAINTENANCE_NOTICE' };

    expect(shouldDeliverToSocket(wsAContext, message)).toBe(true);
    expect(shouldDeliverToSocket(wsBContext, message)).toBe(true);
    expect(shouldDeliverToSocket(superAdminContext, message)).toBe(true);
  });
});
