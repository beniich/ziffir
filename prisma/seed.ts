// prisma/seed.ts
import { PrismaClient, VipLevel, TransportMode, ArrivalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed Zaphir...');

  // 1. Nettoyage
  await prisma.arrivalTask.deleteMany();
  await prisma.arrivalStatusEvent.deleteMany();
  await prisma.arrival.deleteMany();
  await prisma.apiTokenQuota.deleteMany();
  await prisma.aiRule.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.roomOrder.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.suiteState.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // 2. Utilisateurs
  const admin = await prisma.user.create({
    data: {
      email: 'admin0@zaphir.com',
      displayName: 'Administrateur',
      name: 'Admin Zaphir',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff0@zaphir.com',
      displayName: 'Serveur 1',
      name: 'Jean Dupont',
    },
  });

  const gm = await prisma.user.create({
    data: {
      email: 'gm0@zaphir.com',
      displayName: 'Directeur',
      name: 'Paul Hôtelier',
    },
  });

  // 3. Hôtel
  const hotel = await prisma.hotel.create({
    data: {
      id: 'hotel-dev',
      name: 'Zaphir Palace Paris',
    },
  });

  console.log(`🏨 Hôtel créé : ${hotel.name}`);

  // 4. Chambres (10 chambres sur 2 étages)
  const rooms = [];
  for (let floor = 1; floor <= 2; floor++) {
    for (let i = 1; i <= 5; i++) {
      const room = await prisma.room.create({
        data: {
          number: `${floor}0${i}`,
          floor,
          type: i === 5 ? 'SUITE_PRESIDENTIELLE' : 'DELUXE',
        },
      });
      rooms.push(room);
    }
  }

  // 5. Suite States (Semaine 1)
  for (const room of rooms) {
    await prisma.suiteState.create({
      data: {
        hotelId: hotel.id,
        roomId: room.id,
        isOccupied: Math.random() > 0.5,
        temperatureC: 21.5,
        lightLevel: 80,
        scene: 'WELCOME',
        version: 1,
      },
    });
  }

  // 6. Menu Room Service (Semaine 2)
  const menuItems = [
    { name: 'Club Sandwich Zaphir', description: 'Poulet rôti, bacon croustillant', priceCents: 2800, category: 'FOOD', image: 'club.jpg' },
    { name: 'Salade César', description: 'Vraie romaine, parmesan 24 mois', priceCents: 2400, category: 'FOOD', image: 'cesar.jpg' },
    { name: 'Champagne Ruinart BdB', description: 'Bouteille 75cl', priceCents: 15000, category: 'BEVERAGE', image: 'ruinart.jpg' },
    { name: 'Eau Minérale Evian', description: 'Bouteille 75cl', priceCents: 800, category: 'BEVERAGE', image: 'evian.jpg' },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: { ...item, hotelId: hotel.id, isAvailable: true },
    });
  }

  // 7. Règles IA et Quotas (Semaine 3)
  await prisma.aiRule.create({
    data: {
      hotelId: hotel.id,
      name: 'Synergie VIP Arrival',
      trigger: '{"event":"logistics:driver_status","conditions":{"status":"APPROACHING_HOTEL"}}',
      action: '{"service":"suite-controls","action":"setScene","params":{"scene":"WELCOME"}}',
      isActive: true,
    },
  });

  await prisma.apiTokenQuota.createMany({
    data: [
      { hotelId: hotel.id, actorType: 'system', actorId: 'orchestrator', dailyLimit: 100000, consumedToday: 420 },
      { hotelId: hotel.id, actorType: 'role', actorId: 'staff', dailyLimit: 1000, consumedToday: 890 },
      { hotelId: hotel.id, actorType: 'user', actorId: admin.id, dailyLimit: 5000, consumedToday: 15 },
    ],
  });

  // 8. Arrivals VIP (Semaine 3)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const laterToday = new Date();
  laterToday.setHours(laterToday.getHours() + 3);

  // VIP #1 - Atterrit bientôt
  const arr1 = await prisma.arrival.create({
    data: {
      hotelId: hotel.id,
      guestName: 'Elon M.',
      vipLevel: 'ROYAL',
      status: 'LANDED',
      transportMode: 'PRIVATE_JET',
      flightNumber: 'N1000',
      flightOrigin: 'SFO',
      scheduledArrivalAt: laterToday,
      suiteReadyBy: new Date(laterToday.getTime() - 60 * 60_000),
      roomId: rooms[4].id, // Suite présidentielle
      hostUserId: gm.id,
      welcomeAmenity: 'Macarons personnalisés SpaceX',
      createdById: admin.id,
    }
  });

  // VIP #2 - Demain
  const arr2 = await prisma.arrival.create({
    data: {
      hotelId: hotel.id,
      guestName: 'Isabelle A.',
      vipLevel: 'PRESTIGE',
      status: 'CONFIRMED',
      transportMode: 'CAR',
      scheduledArrivalAt: tomorrow,
      suiteReadyBy: new Date(tomorrow.getTime() - 60 * 60_000),
      roomId: rooms[9].id, // Autre suite
      hostUserId: gm.id,
      createdById: admin.id,
    }
  });

  console.log(`✨ Arrivals créées : ${arr1.id}, ${arr2.id}`);

  // Utiliser le Planner pour générer les tasks (simulé ici pour le seed)
  const generateTasks = async (arrivalId: string, vipLevel: VipLevel, time: Date) => {
    await prisma.arrivalTask.createMany({
      data: [
        { arrivalId, hotelId: hotel.id, team: 'HOUSEKEEPING', title: 'Inspection suite finale', dueAt: new Date(time.getTime() - 30 * 60000), isCritical: true, priority: 1, status: 'PENDING' },
        { arrivalId, hotelId: hotel.id, team: 'KITCHEN', title: 'Welcome drink', dueAt: new Date(time.getTime() - 45 * 60000), isCritical: false, priority: 1, status: 'COMPLETED' },
        { arrivalId, hotelId: hotel.id, team: 'RECEPTION', title: 'Pré-check-in', dueAt: new Date(time.getTime() - 60 * 60000), isCritical: false, priority: 1, status: 'PENDING' },
      ]
    });
    if (vipLevel === 'ROYAL') {
      await prisma.arrivalTask.create({
        data: { arrivalId, hotelId: hotel.id, team: 'SECURITY', title: 'Sécuriser périmètre', dueAt: new Date(time.getTime() - 60 * 60000), isCritical: true, priority: 2, status: 'IN_PROGRESS' }
      });
    }
  };

  await generateTasks(arr1.id, 'ROYAL', laterToday);
  await generateTasks(arr2.id, 'PRESTIGE', tomorrow);

  console.log('✅ Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
