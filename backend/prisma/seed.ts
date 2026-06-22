// backend/prisma/seed.ts — Seed du compte admin par défaut
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: Création des comptes par défaut...');

  // Admin
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@zaphir.hotel' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Zaphir2024!', 12);
    await prisma.user.create({
      data: {
        email: 'admin@zaphir.hotel',
        username: 'zaphir_admin',
        passwordHash,
        role: 'admin',
      },
    });
    console.log('✅ Admin créé: admin@zaphir.hotel / Zaphir2024!');
  } else {
    console.log('⏭️  Admin déjà existant');
  }

  // Manager
  const managerExists = await prisma.user.findUnique({ where: { email: 'manager@zaphir.hotel' } });
  if (!managerExists) {
    const passwordHash = await bcrypt.hash('Manager2024!', 12);
    await prisma.user.create({
      data: {
        email: 'manager@zaphir.hotel',
        username: 'zaphir_manager',
        passwordHash,
        role: 'manager',
      },
    });
    console.log('✅ Manager créé: manager@zaphir.hotel / Manager2024!');
  }

  // Operator
  const operatorExists = await prisma.user.findUnique({ where: { email: 'operator@zaphir.hotel' } });
  if (!operatorExists) {
    const passwordHash = await bcrypt.hash('Operator2024!', 12);
    await prisma.user.create({
      data: {
        email: 'operator@zaphir.hotel',
        username: 'zaphir_operator',
        passwordHash,
        role: 'operator',
      },
    });
    console.log('✅ Opérateur créé: operator@zaphir.hotel / Operator2024!');
  }

  console.log('🎉 Seed terminé !');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
