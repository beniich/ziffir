/**
 * Script de seeding : crée l'utilisateur SuperAdmin dans Neon Postgres
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email    = 'admin@zaphir-admin.com';
  const username = 'SuperAdmin';
  const password = 'Zaphir2026!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin déjà existant en base :', existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('🚀 Admin créé avec succès !');
  console.log('   Email    :', user.email);
  console.log('   Username :', user.username);
  console.log('   Role     :', user.role);
  console.log('   ID       :', user.id);
}

main()
  .catch((e) => { console.error('❌ Erreur seeding:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
