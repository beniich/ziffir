/**
 * scripts/setup-neon.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Script de migration Neon PostgreSQL pour Vercel.
 * 
 * Utilisation :
 *   npx tsx scripts/setup-neon.ts
 * 
 * Ce script :
 *   1. Vérifie la connexion à Neon
 *   2. Régénère le client Prisma pour PostgreSQL
 *   3. Pousse le schéma vers la base Neon (prisma db push)
 *   4. Vérifie que toutes les tables ont été créées
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyConnection() {
  console.log('\n🔌 [1/4] Vérification de la connexion Neon...');
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;
    console.log(`   ✅ Connecté à Neon PostgreSQL — Serveur: ${result[0].now.toISOString()}`);
  } catch (e: any) {
    console.error('   ❌ Connexion échouée :', e.message);
    process.exit(1);
  }
}

function generatePrismaClient() {
  console.log('\n⚙️  [2/4] Génération du client Prisma pour PostgreSQL...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('   ✅ Client Prisma généré avec succès');
  } catch (e) {
    console.error('   ❌ Échec de prisma generate');
    process.exit(1);
  }
}

function pushSchema() {
  console.log('\n🚀 [3/4] Push du schéma vers Neon (prisma db push)...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('   ✅ Schéma synchronisé sur Neon');
  } catch (e) {
    console.error('   ❌ Échec de prisma db push');
    process.exit(1);
  }
}

async function verifyTables() {
  console.log('\n🔍 [4/4] Vérification des tables créées...');
  try {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    const expectedTables = [
      'User', 'Hotel', 'HotelMembership', 'HotelInvitation',
      'UserSession', 'SuiteState', 'Room', 'RoomOrder',
      'MenuItem', 'Arrival', 'ArrivalTask', 'AuditLog',
      'Booking', 'NewsletterSubscriber'
    ];
    
    const existingTables = tables.map(t => t.tablename);
    console.log(`   Tables créées (${existingTables.length}): ${existingTables.join(', ')}`);
    
    const missing = expectedTables.filter(t => !existingTables.includes(t));
    if (missing.length > 0) {
      console.warn(`   ⚠️  Tables manquantes: ${missing.join(', ')}`);
    } else {
      console.log('   ✅ Toutes les tables essentielles sont présentes');
    }
  } catch (e: any) {
    console.error('   ❌ Erreur vérification tables :', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   🗄️  Ziffir — Setup Neon PostgreSQL (Vercel)');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   DB: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? 'non définie'}`);

  generatePrismaClient();
  await verifyConnection();
  pushSchema();
  await verifyTables();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   ✅ Setup Neon terminé ! Prêt pour Vercel.');
  console.log('   📌 Prochaine étape: git push origin main');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
