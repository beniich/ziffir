import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function run() {
  const email = 'admin.zaphir@empire.local';
  const password = 'Zaphir-Secure-Password-2026!';
  const displayName = 'Admin Zaphir';
  const hotelName = 'Grand Zaphir Palace';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️ L'utilisateur ${email} existe déjà.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: 'HOTEL',
        isActive: true,
      },
    });

    // Create hotel
    const hotel = await prisma.hotel.create({
      data: {
        name: hotelName,
        slug: 'grand-zaphir-palace',
        ownerId: user.id,
        plan: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
      },
    });

    // Create membership
    await prisma.hotelMembership.create({
      data: {
        hotelId: hotel.id,
        userId: user.id,
        role: 'OWNER',
        isActive: true,
        joinedAt: new Date(),
      },
    });

    console.log('✅ Utilisateur de test inséré avec succès dans la base de données SQLite !');
    console.log(`📧 Email : ${email}`);
    console.log(`🔑 Mot de passe : ${password}`);
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
