import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToMultitenant() {
  console.log('🚀 Migration vers architecture multi-tenant...');

  // 1. Créer l'hôtel par défaut "Legacy"
  const legacyHotel = await prisma.hotel.upsert({
    where: { slug: 'legacy' },
    update: {},
    create: {
      name: 'Zaphir Legacy Hotel',
      slug: 'legacy',
      city: 'Paris',
    },
  });
  console.log(`✅ Hôtel Legacy créé/trouvé : ${legacyHotel.id}`);

  // 2. Migrer les utilisateurs
  // Note: We use queryRaw to fetch raw data because Prisma client may enforce the new schema 
  // on old data, which might crash if hotelId is missing in the generated types but exists in DB.
  // Actually, since we just added hotelId and it's nullable for users, Prisma client is fine to use for reads.
  // We'll use Prisma client for safety if possible, or queryRaw.
  const users = await prisma.$queryRaw<Array<{ id: string; role: string }>>`
    SELECT id, role FROM users WHERE role IN ('operator', 'manager', 'admin')
  `;

  for (const user of users) {
    const newRole = user.role === 'admin' ? 'SUPER_ADMIN' : 'HOTEL';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: newRole as any,
        hotelId: user.role === 'admin' ? null : legacyHotel.id,
      },
    });
    console.log(`  → User ${user.id} : ${user.role} → ${newRole}`);
  }

  // 3. Créer des chambres par défaut si elles n'existent pas
  // We use queryRaw or upsert
  const roomsToCreate = ['201', '202', '203', '301', 'V1', 'V2'];
  for (const num of roomsToCreate) {
    await prisma.room.upsert({
      where: {
        hotelId_number: {
          hotelId: legacyHotel.id,
          number: num,
        }
      },
      update: {},
      create: {
        hotelId: legacyHotel.id,
        number: num,
        floor: parseInt(num) < 300 ? 2 : 3,
        type: num.startsWith('V') ? 'villa' : 'suite',
        status: 'VACANT',
      },
    });
  }
  console.log(`✅ Chambres vérifiées/créées`);

  // 4. Migrer les commandes existantes
  const existingOrders = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM room_orders WHERE hotel_id IS NULL
  `;

  for (const order of existingOrders) {
    await prisma.$executeRaw`
      UPDATE room_orders SET hotel_id = ${legacyHotel.id} WHERE id = ${order.id}
    `;
  }
  console.log(`✅ ${existingOrders.length} commandes migrées`);

  // 5. Migrer le staff
  const existingStaff = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM staff WHERE hotel_id IS NULL
  `;
  for (const staff of existingStaff) {
    await prisma.$executeRaw`
      UPDATE staff SET hotel_id = ${legacyHotel.id} WHERE id = ${staff.id}
    `;
  }
  console.log(`✅ ${existingStaff.length} membres du staff migrés`);

  // 6. Migrer les audits
  const existingAudits = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM audits WHERE hotel_id IS NULL
  `;
  for (const audit of existingAudits) {
    await prisma.$executeRaw`
      UPDATE audits SET hotel_id = ${legacyHotel.id} WHERE id = ${audit.id}
    `;
  }
  console.log(`✅ ${existingAudits.length} logs d'audit migrés`);

  // Note: same for VaultDocument, SuiteControl, PricingRule, Course if they exist without hotelId
  
  console.log('✅ Migration terminée !');
}

migrateToMultitenant()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
