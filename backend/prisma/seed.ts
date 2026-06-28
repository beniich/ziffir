import { PrismaClient, Role, RoomStatus, TaskStatus } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database…');

  // Nettoyage (idempotent)
  await prisma.task.deleteMany();
  await prisma.parkingSpot.deleteMany();
  await prisma.wineBottle.deleteMany();
  await prisma.miniBarItem.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotel.deleteMany();

  // Hôtel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Le Grand Sapphire',
      address: '12 Avenue des Champs-Élysées',
      city: 'Paris',
      country: 'France',
      stars: 5,
    },
  });

  // Utilisateurs (mots de passe dev — à changer en prod)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [admin, manager, staff] = await Promise.all([
    // Compte Zafir principal (admin@zafir.luxury)
    prisma.user.create({
      data: {
        email: 'admin@zafir.luxury',
        passwordHash,
        firstName: 'Zafir',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
        hotelId: hotel.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@sapphire.luxury',
        passwordHash,
        firstName: 'Alice',
        lastName: 'Dubois',
        role: Role.ADMIN,
        hotelId: hotel.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@sapphire.luxury',
        passwordHash,
        firstName: 'Marc',
        lastName: 'Lefèvre',
        role: Role.MANAGER,
        hotelId: hotel.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff@sapphire.luxury',
        passwordHash,
        firstName: 'Sophie',
        lastName: 'Martin',
        role: Role.STAFF,
        hotelId: hotel.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'super@sapphire.luxury',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
        hotelId: hotel.id,
      },
    }),
  ]);

  // Chambres
  const roomTypes = [
    { type: 'Standard', price: 280 },
    { type: 'Deluxe', price: 420 },
    { type: 'Suite', price: 780 },
    { type: 'Penthouse', price: 1500 },
  ];

  const rooms = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 4; i++) {
      const number = `${floor}${i.toString().padStart(2, '0')}`;
      const type = roomTypes[Math.min(Math.floor((floor - 1) * 1.5), roomTypes.length - 1)];
      rooms.push(
        await prisma.room.create({
          data: {
            number,
            floor,
            type: type.type,
            price: type.price,
            status: i === 1 && floor === 1 ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE,
            hotelId: hotel.id,
          },
        })
      );
    }
  }

  // Minibar
  const minibarSeed = [
    { name: 'Champagne Moët 75cl', category: 'Alcohol', price: 95, stock: 12 },
    { name: 'Eau Evian 50cl', category: 'Beverage', price: 6, stock: 48 },
    { name: 'Caviar Oscietra 30g', category: 'Gourmet', price: 120, stock: 6 },
    { name: 'Chocolat Godiva', category: 'Snack', price: 8, stock: 24 },
  ];
  for (const item of minibarSeed) {
    await prisma.miniBarItem.create({
      data: { ...item, hotelId: hotel.id },
    });
  }

  // Vins
  const wineSeed = [
    { name: 'Château Margaux', vintage: 2015, price: 850, stock: 8 },
    { name: 'Domaine de la Romanée-Conti', vintage: 2018, price: 2400, stock: 3 },
  ];
  for (const wine of wineSeed) {
    await prisma.wineBottle.create({
      data: { ...wine, hotelId: hotel.id },
    });
  }

  // Parking
  for (let i = 1; i <= 20; i++) {
    await prisma.parkingSpot.create({
      data: {
        number: `P${i.toString().padStart(2, '0')}`,
        isOccupied: i <= 8,
        hotelId: hotel.id,
      },
    });
  }

  // Tâches
  const taskSeed = [
    { title: 'Préparer suite 301', status: TaskStatus.PENDING, priority: 2, assigneeId: staff.id },
    { title: 'Restocker minibar chambre 205', status: TaskStatus.IN_PROGRESS, priority: 1, assigneeId: staff.id },
    { title: 'Maintenance ascenseur principal', status: TaskStatus.PENDING, priority: 3 },
    { title: 'Check-in VIP famille Al-Rashid', status: TaskStatus.PENDING, priority: 3, assigneeId: manager.id },
    { title: 'Inventaire cave à vins', status: TaskStatus.COMPLETED, priority: 1, assigneeId: manager.id },
  ];
  for (const task of taskSeed) {
    await prisma.task.create({
      data: { ...task, hotelId: hotel.id },
    });
  }

  console.log('✅ Seed terminé');
  console.log(`   Hôtel : ${hotel.name}`);
  console.log(`   Comptes : super@sapphire.luxury / admin@sapphire.luxury / manager@sapphire.luxury / staff@sapphire.luxury`);
  console.log(`   Mot de passe : Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
