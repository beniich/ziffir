/*
  Warnings:

  - You are about to drop the `Audit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LedgerCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Audit";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Course";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LedgerCourse";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MaintenanceLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RoomOrder";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "courses" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "prepTime" INTEGER NOT NULL DEFAULT 15,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "allergens" TEXT NOT NULL DEFAULT '',
    "vectorKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "room_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderRef" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestVIP" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Preparation',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "subtotal" REAL NOT NULL,
    "vat" REAL NOT NULL,
    "serviceCharge" REAL NOT NULL,
    "total" REAL NOT NULL,
    "estimatedDelivery" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "room_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "courses" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ledger_courses" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "completedDate" TEXT NOT NULL,
    "blockchainHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "clearanceLevel" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastAccess" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vault_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "fingerprint" BOOLEAN NOT NULL DEFAULT true,
    "depositDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" DATETIME
);

-- CreateTable
CREATE TABLE "suite_controls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlRef" TEXT NOT NULL,
    "suite" TEXT NOT NULL,
    "lights" BOOLEAN NOT NULL DEFAULT false,
    "climate" INTEGER NOT NULL DEFAULT 20,
    "curtains" TEXT NOT NULL DEFAULT 'closed',
    "music" BOOLEAN NOT NULL DEFAULT false,
    "musicVolume" INTEGER NOT NULL DEFAULT 0,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleRef" TEXT NOT NULL,
    "suite" TEXT NOT NULL,
    "basePrice" REAL NOT NULL,
    "channelMultipliers" TEXT NOT NULL DEFAULT '{}',
    "lastSync" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'synced'
);

-- CreateIndex
CREATE UNIQUE INDEX "audits_logId_key" ON "audits"("logId");

-- CreateIndex
CREATE UNIQUE INDEX "audits_hash_key" ON "audits"("hash");

-- CreateIndex
CREATE INDEX "audits_timestamp_idx" ON "audits"("timestamp");

-- CreateIndex
CREATE INDEX "audits_action_idx" ON "audits"("action");

-- CreateIndex
CREATE INDEX "audits_user_idx" ON "audits"("user");

-- CreateIndex
CREATE UNIQUE INDEX "room_orders_orderRef_key" ON "room_orders"("orderRef");

-- CreateIndex
CREATE INDEX "room_orders_status_idx" ON "room_orders"("status");

-- CreateIndex
CREATE INDEX "room_orders_roomNumber_idx" ON "room_orders"("roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_courses_blockchainHash_key" ON "ledger_courses"("blockchainHash");

-- CreateIndex
CREATE UNIQUE INDEX "staff_staffRef_key" ON "staff"("staffRef");

-- CreateIndex
CREATE UNIQUE INDEX "vault_documents_docRef_key" ON "vault_documents"("docRef");

-- CreateIndex
CREATE INDEX "vault_documents_owner_idx" ON "vault_documents"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "suite_controls_controlRef_key" ON "suite_controls"("controlRef");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_rules_ruleRef_key" ON "pricing_rules"("ruleRef");
