import { Router } from 'express';

export const adminRouter = Router();

// /api/admin/auth/me
adminRouter.get('/auth/me', (req, res) => {
  res.json({
    data: {
      id: 'super-admin-1',
      email: 'admin@ziffir.com',
      displayName: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });
});

// /api/admin/auth/logout
adminRouter.post('/auth/logout', (req, res) => {
  res.json({ success: true });
});

// /api/admin/dashboard/kpis
adminRouter.get('/dashboard/kpis', (req, res) => {
  res.json({
    data: {
      totalHotels: 42,
      activeHotels: 38,
      trialHotels: 5,
      paidHotels: 33,
      totalUsers: 156,
      newLeadsLast30d: 12,
      convertedLeadsLast30d: 4,
      conversionRate: 33.3,
      mrr: 15400,
      planDistribution: {
        FREE_TRIAL: 5,
        FREE: 2,
        PREMIUM: 20,
        PLATINIUM: 10,
        GOLDEN: 1
      }
    }
  });
});

// /api/admin/leads
adminRouter.get('/leads', (req, res) => {
  res.json({
    data: [
      { id: 'lead1', contactName: 'Jean Dupont', email: 'jean@hotel-prestige.com' },
      { id: 'lead2', contactName: 'Marie Martin', email: 'marie@boutique-hotel.fr' }
    ]
  });
});

// /api/admin/hotels
adminRouter.get('/hotels', (req, res) => {
  res.json({
    data: {
      hotels: [
        {
          id: 'hotel-1',
          name: 'Le Grand Ziffir',
          slug: 'le-grand-ziffir',
          plan: 'PREMIUM',
          isActive: true,
          trialEndsAt: null,
          createdAt: new Date().toISOString(),
          _count: { rooms: 45, orders: 120, reservations: 350 }
        },
        {
          id: 'hotel-2',
          name: 'Ziffir Express',
          slug: 'ziffir-express',
          plan: 'FREE_TRIAL',
          isActive: true,
          trialEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
          createdAt: new Date().toISOString(),
          _count: { rooms: 20, orders: 10, reservations: 40 }
        }
      ]
    }
  });
});

// /api/admin/hotels/:id
adminRouter.get('/hotels/:id', (req, res) => {
  res.json({
    data: {
      id: req.params.id,
      name: 'Le Grand Ziffir',
      slug: 'le-grand-ziffir',
      plan: 'PREMIUM',
      isActive: true,
      trialEndsAt: null,
      createdAt: new Date().toISOString(),
      _count: { rooms: 45, orders: 120, reservations: 350 },
      memberships: [
        {
          id: 'mem-1',
          role: 'ADMIN',
          joinedAt: new Date().toISOString(),
          user: { email: 'manager@hotel.com', displayName: 'Hotel Manager' }
        }
      ]
    }
  });
});

// /api/admin/audit
adminRouter.get('/audit', (req, res) => {
  res.json({
    data: {
      logs: [
        {
          id: 'log1',
          action: 'hotel.update',
          targetType: 'hotel',
          targetId: 'hotel-1',
          actor: 'admin-1',
          metadata: { plan: 'PREMIUM' },
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString(),
          superAdmin: { email: 'admin@ziffir.com', displayName: 'Super Admin' }
        },
        {
          id: 'log2',
          action: 'admin.login',
          targetType: null,
          targetId: null,
          actor: 'admin-1',
          metadata: {},
          ipAddress: '192.168.1.1',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          superAdmin: { email: 'admin@ziffir.com', displayName: 'Super Admin' }
        }
      ]
    }
  });
});
