import { authService } from '../domains/auth/auth.service';
import { prisma } from '../lib/prisma';

describe('Auth Service', () => {
  const testEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@ziffir.test`;
  const testPassword = 'SecurePassword123!';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Nettoyage
    await prisma.userSession.deleteMany({});
    await prisma.hotelInvitation.deleteMany({});
    await prisma.hotelMembership.deleteMany({});
    await prisma.hotel.deleteMany({ where: { name: { startsWith: 'Test' } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@ziffir.test' } } });
    await prisma.$disconnect();
  });

  // ===========================================================================
  // REGISTER
  // ===========================================================================
  describe('register', () => {
    it('crée un user + hôtel trial + membership OWNER', async () => {
      const result = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'Test User',
        hotelName: 'Test Hotel',
      });

      expect(result.auth.user).toBeTruthy();
      expect(result.auth.activeHotel).toBeTruthy();
      expect(result.auth.activeHotel!.plan).toBe('FREE_TRIAL');
      expect(result.auth.activeHotel!.role).toBe('OWNER');
      expect(result.auth.activeHotel!.trialDaysLeft).toBeGreaterThan(0);
      expect(result.auth.activeHotel!.trialDaysLeft).toBeLessThanOrEqual(14);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('rejette un mot de passe trop court', async () => {
      await expect(
        authService.register({
          email: testEmail(),
          password: 'short',
          displayName: 'Test',
          hotelName: 'Hotel',
        })
      ).rejects.toThrow(/12 caractères/);
    });

    it('rejette un email déjà utilisé', async () => {
      const email = testEmail();
      await authService.register({
        email,
        password: testPassword,
        displayName: 'Test',
        hotelName: 'Hotel 1',
      });

      await expect(
        authService.register({
          email,
          password: testPassword,
          displayName: 'Test 2',
          hotelName: 'Hotel 2',
        })
      ).rejects.toThrow(/déjà utilisé/);
    });

    it('génère un slug unique pour les doublons', async () => {
      const r1 = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'User 1',
        hotelName: 'Hôtel du Louvre',
      });
      const r2 = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'User 2',
        hotelName: 'Hôtel du Louvre',
      });

      expect(r1.auth.activeHotel!.slug).not.toBe(r2.auth.activeHotel!.slug);
    });
  });

  // ===========================================================================
  // LOGIN
  // ===========================================================================
  describe('login', () => {
    let testEmailAddr: string;

    beforeAll(async () => {
      testEmailAddr = testEmail();
      await authService.register({
        email: testEmailAddr,
        password: testPassword,
        displayName: 'Login Test',
        hotelName: 'Test Hotel Login',
      });
    });

    it('connecte avec credentials valides', async () => {
      const result = await authService.login({
        email: testEmailAddr,
        password: testPassword,
      });

      expect(result.auth.user.email).toBe(testEmailAddr);
      expect(result.accessToken).toBeTruthy();
    });

    it('rejette un mauvais mot de passe', async () => {
      await expect(
        authService.login({
          email: testEmailAddr,
          password: 'WrongPassword',
        })
      ).rejects.toThrow(/invalides/);
    });

    it('verrouille le compte après 5 échecs', async () => {
      const email = testEmail();
      await authService.register({
        email,
        password: testPassword,
        displayName: 'Lock Test',
        hotelName: 'Test Lock',
      });

      for (let i = 0; i < 5; i++) {
        await expect(
          authService.login({ email, password: 'WrongPassword' })
        ).rejects.toThrow();
      }

      await expect(
        authService.login({ email, password: testPassword })
      ).rejects.toThrow(/verrouillé/);
    });

    it('met à jour lastLoginAt', async () => {
      const before = await prisma.user.findUnique({
        where: { email: testEmailAddr },
      });
      
      await authService.login({
        email: testEmailAddr,
        password: testPassword,
      });
      
      const after = await prisma.user.findUnique({
        where: { email: testEmailAddr },
      });
      
      expect(after!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(
        (before!.lastLoginAt?.getTime() || 0)
      );
    });
  });

  // ===========================================================================
  // REFRESH
  // ===========================================================================
  describe('refresh', () => {
    it('génère un nouveau access + refresh token', async () => {
      const reg = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'Refresh Test',
        hotelName: 'Test Refresh',
      });

      const result = await authService.refresh(reg.refreshToken);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('rejette un refresh token invalide', async () => {
      await expect(
        authService.refresh('invalid-token')
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // SWITCH HOTEL
  // ===========================================================================
  describe('switchHotel', () => {
    it('change l\\'hôtel actif', async () => {
      // User avec 1 hôtel (OWNER) ne peut pas switch
      // Créer un user avec 2 memberships manuellement
      const user = await prisma.user.create({
        data: {
          email: testEmail(),
          passwordHash: await require('bcrypt').hash(testPassword, 12),
          displayName: 'Multi Hotel',
          role: 'HOTEL',
        },
      });

      const hotel1 = await prisma.hotel.create({
        data: {
          name: 'Hotel 1',
          slug: `hotel-1-${Date.now()}`,
          ownerId: user.id,
          plan: 'PREMIUM',
          subscriptionStatus: 'ACTIVE',
        },
      });
      const hotel2 = await prisma.hotel.create({
        data: {
          name: 'Hotel 2',
          slug: `hotel-2-${Date.now()}`,
          ownerId: user.id,
          plan: 'PREMIUM',
          subscriptionStatus: 'ACTIVE',
        },
      });

      await prisma.hotelMembership.createMany({
        data: [
          { hotelId: hotel1.id, userId: user.id, role: 'OWNER', joinedAt: new Date() },
          { hotelId: hotel2.id, userId: user.id, role: 'OWNER', joinedAt: new Date() },
        ],
      });

      // Login
      const login = await authService.login({
        email: user.email,
        password: testPassword,
      });

      expect(login.auth.activeHotel!.id).toBe(hotel1.id);

      // Switch
      const sw = await authService.switchHotel(user.id, hotel2.id, login.auth.user.id);
      expect(sw.accessToken).toBeTruthy();
      
      // Vérif que la session a bien été mise à jour
      const session = await prisma.userSession.findFirst({
        where: { userId: user.id, revokedAt: null },
      });
      expect(session!.activeHotelId).toBe(hotel2.id);
    });
  });

  // ===========================================================================
  // INVITATIONS
  // ===========================================================================
  describe('invitations', () => {
    it('crée et accepte une invitation', async () => {
      // Owner crée son hôtel
      const ownerReg = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'Owner',
        hotelName: 'Test Hotel Invite',
      });
      const owner = await prisma.user.findUnique({
        where: { email: ownerReg.auth.user.email },
      });

      // Owner invite
      const guestEmail = testEmail();
      const invite = await authService.createInvitation({
        hotelId: ownerReg.auth.activeHotel!.id,
        email: guestEmail,
        proposedRole: 'STAFF',
        invitedById: owner!.id,
      });

      expect(invite.token).toBeTruthy();
      expect(invite.inviteUrl).toContain('/invitation/');

      // Guest accepte (compte créé à la volée)
      const accept = await authService.acceptInvitation({
        token: invite.token,
        password: testPassword,
        displayName: 'Guest',
      });

      expect(accept.auth.activeHotel!.id).toBe(ownerReg.auth.activeHotel!.id);
      expect(accept.auth.activeHotel!.role).toBe('STAFF');
      expect(accept.auth.availableHotels.length).toBe(1);
    });

    it('refuse une invitation expirée', async () => {
      const ownerReg = await authService.register({
        email: testEmail(),
        password: testPassword,
        displayName: 'Owner',
        hotelName: 'Test Expired',
      });
      const owner = await prisma.user.findUnique({
        where: { email: ownerReg.auth.user.email },
      });

      const invite = await authService.createInvitation({
        hotelId: ownerReg.auth.activeHotel!.id,
        email: testEmail(),
        proposedRole: 'STAFF',
        invitedById: owner!.id,
      });

      // Force l'expiration
      await prisma.hotelInvitation.update({
        where: { id: invite.invitation.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await expect(
        authService.acceptInvitation({
          token: invite.token,
          password: testPassword,
        })
      ).rejects.toThrow(/expirée/);
    });
  });

  // ===========================================================================
  // PERMISSIONS
  // ===========================================================================
  describe('permissions', () => {
    it('OWNER a accès à tout', () => {
      const perms = authService['computePermissions']('OWNER', []);
      expect(perms).toContain('*');
    });

    it('STAFF n\\'a pas accès au billing', () => {
      const perms = authService['computePermissions']('STAFF', []);
      expect(perms).not.toContain('billing.view');
      expect(perms).not.toContain('billing.manage');
    });

    it('hasPermission gère les wildcards', () => {
      const perms = authService['computePermissions']('MANAGER', []);
      
      expect(authService.hasPermission(perms, 'orders.create')).toBe(true);
      expect(authService.hasPermission(perms, 'orders.update')).toBe(true);
      expect(authService.hasPermission(perms, 'billing.manage')).toBe(true);
      expect(authService.hasPermission(perms, 'unknown.action')).toBe(false);
    });

    it('permissions custom s\\'ajoutent aux permissions de base', () => {
      const basePerms = authService['computePermissions']('STAFF', []);
      const customPerms = authService['computePermissions']('STAFF', ['vault.view', 'vault.edit']);
      
      expect(customPerms).toContain('vault.view');
      expect(customPerms).toContain('vault.edit');
      expect(basePerms).not.toContain('vault.view');
    });
  });
});
