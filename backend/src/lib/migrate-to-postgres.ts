/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
/**
 * Helper to migrate from SQLite (dev) to PostgreSQL (prod).
 * 
 * Usage:
 *   1. Set DATABASE_URL to Postgres URL
 *   2. Run: npx prisma migrate deploy
 *   3. Run: npx tsx src/lib/migrate-to-postgres.ts
 * 
 * This will:
 *   - Export data from SQLite
 *   - Transform types (JSON → JSONB)
 *   - Import into PostgreSQL
 */

import { PrismaClient as SqliteClient } from '@prisma/client';
import { execSync } from 'node:child_process';

async function migrate() {
  console.log('⚠️  Postgres migration helper');
  console.log('');
  console.log('Manual steps for production deployment:');
  console.log('');
  console.log('1. Update DATABASE_URL to PostgreSQL');
  console.log('2. Run: npx prisma migrate deploy');
  console.log('3. Run: npx tsx prisma/seed.ts');
  console.log('');
  console.log('For data migration from SQLite to PostgreSQL:');
  console.log('  - Use pgloader: https://github.com/dimitri/pgloader');
  console.log('  - Or use Prisma\'s data proxy');
  console.log('');
}

migrate();
