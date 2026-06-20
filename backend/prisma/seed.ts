// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { HashService } from '../src/services/hash.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed de la base de données...');

  // Clean DB first to avoid duplicate seeds
  await prisma.audit.deleteMany();
  await prisma.ledgerCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.vaultDocument.deleteMany();
  await prisma.suiteControl.deleteMany();
  await prisma.pricingRule.deleteMany();

  // Cours Room Service (menu)
  await prisma.course.createMany({
    data: [
      { code: 'course-001', name: 'Gourmet Breakfast Platter', category: 'breakfast', price: 45, vectorKey: 'breakfast' },
      { code: 'course-101', name: 'Caviar Service', category: 'appetizer', price: 180, vectorKey: 'caviar' },
      { code: 'course-201', name: 'Wagyu Ribeye A5', category: 'main', price: 220, vectorKey: 'wagyu' },
    ],
  });

  // Cours Ledger
  await prisma.ledgerCourse.createMany({
    data: [
      { code: 'HOSP-501', name: 'Advanced Guest Experience Design', category: 'Operations', credits: 4.0, grade: 'A+', completedDate: '2025-11-20', blockchainHash: HashService.sha256('HOSP-501') },
      { code: 'SOMM-612', name: 'Master Oenology', category: 'Gastronomy', credits: 3.0, grade: 'A', completedDate: '2025-12-15', blockchainHash: HashService.sha256('SOMM-612') },
    ],
  });

  // Audit initial
  await prisma.audit.create({
    data: {
      logId: 'LOG-001',
      user: 'System',
      role: 'ACADEMY-CORE',
      action: 'SYSTEM_BOOT_GENESIS',
      reason: 'Initial seed',
      status: 'AUTHORIZED',
      previousHash: '0'.repeat(64),
      hash: HashService.computeAuditHash('LOG-001', '0'.repeat(64), 'SYSTEM_BOOT_GENESIS', 'ACADEMY-CORE', 'Initial seed'),
    },
  });

  // Seeding some suite controls
  await prisma.suiteControl.createMany({
    data: [
      { suite: 'Suite 201', lights: true, climate: 22, curtains: 'open', music: false, musicVolume: 20 },
      { suite: 'Suite 202', lights: false, climate: 20, curtains: 'closed', music: true, musicVolume: 10 },
      { suite: 'Suite 203', lights: true, climate: 23, curtains: 'half', music: false, musicVolume: 0 },
    ],
  });

  // Seeding vault documents
  await prisma.vaultDocument.createMany({
    data: [
      { docRef: 'doc-001', name: 'Elena_Passport_Copy.pdf', category: 'passport', owner: 'Elena Petrova', room: 'Suite 201', fingerprint: true },
      { docRef: 'doc-002', name: 'Zaphir_Acquisition_Contract_2024.pdf', category: 'contract', owner: 'Dean Vance', room: 'Suite 203', fingerprint: true },
    ],
  });

  // Seeding staff
  await prisma.staffMember.createMany({
    data: [
      { staffRef: 's-001', name: 'Elena Petrova', role: 'operator', department: 'Operations', clearanceLevel: 4 },
      { staffRef: 's-002', name: 'Alistair Vance', role: 'manager', department: 'Administration', clearanceLevel: 5 },
    ],
  });

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
