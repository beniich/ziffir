-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "name" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastLoginAt" DATETIME,
    "passwordChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "ownerId" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "plan" TEXT NOT NULL DEFAULT 'FREE_TRIAL',
    "trialEndsAt" DATETIME,
    "subscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIALING',
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" DATETIME,
    "maxRooms" INTEGER NOT NULL DEFAULT 5,
    "maxUsers" INTEGER NOT NULL DEFAULT 3,
    "maxSuiteStates" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" DATETIME,
    "suspendedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hotel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HotelMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME,
    "removedAt" DATETIME,
    "invitedById" TEXT,
    CONSTRAINT "HotelMembership_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HotelMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HotelInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "proposedRole" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "revokedAt" DATETIME,
    "invitedById" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HotelInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HotelInvitation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activeHotelId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "country" TEXT,
    "city" TEXT,
    "totpVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT '[]',
    "allowedIps" TEXT NOT NULL DEFAULT '[]',
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "floor" INTEGER,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SuiteState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "temperatureC" REAL NOT NULL DEFAULT 20.0,
    "humidity" REAL,
    "lightLevel" INTEGER NOT NULL DEFAULT 50,
    "curtainsOpen" BOOLEAN NOT NULL DEFAULT false,
    "musicPlaying" BOOLEAN NOT NULL DEFAULT false,
    "musicTrackId" TEXT,
    "scene" TEXT NOT NULL DEFAULT 'IDLE',
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "guestId" TEXT,
    "guestCheckInAt" DATETIME,
    "guestCheckOutAt" DATETIME,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" DATETIME NOT NULL,
    "lastUpdatedById" TEXT,
    CONSTRAINT "SuiteState_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SuiteState_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SuiteState_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SuiteControlEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "suiteStateId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT NOT NULL,
    "actorId" TEXT,
    "actor" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuiteControlEvent_suiteStateId_fkey" FOREIGN KEY ("suiteStateId") REFERENCES "SuiteState" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "prepMinutes" INTEGER NOT NULL DEFAULT 15,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoomOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestId" TEXT,
    "placedById" TEXT,
    "placedBySource" TEXT NOT NULL DEFAULT 'GUEST_PORTAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "previousStatus" TEXT,
    "assignedChefId" TEXT,
    "assignedServerId" TEXT,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" DATETIME,
    "startedPrepAt" DATETIME,
    "readyAt" DATETIME,
    "deliveredAt" DATETIME,
    "estimatedReadyAt" DATETIME,
    "promisedReadyAt" DATETIME,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "serviceFeeCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "guestNotes" TEXT,
    "kitchenNotes" TEXT,
    "serverNotes" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "ratedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RoomOrder_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoomOrder_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoomOrder_placedById_fkey" FOREIGN KEY ("placedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoomOrder_assignedChefId_fkey" FOREIGN KEY ("assignedChefId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoomOrder_assignedServerId_fkey" FOREIGN KEY ("assignedServerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceCents" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "RoomOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'system',
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "RoomOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "previousHash" TEXT NOT NULL DEFAULT 'GENESIS',
    "hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiRule_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiTokenQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1000,
    "consumedToday" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendReason" TEXT,
    "suspendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApiTokenQuota_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arrival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "externalRef" TEXT,
    "confirmationNumber" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestLanguage" TEXT NOT NULL DEFAULT 'fr',
    "vipLevel" TEXT NOT NULL DEFAULT 'CLASSIC',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "previousStatus" TEXT,
    "scheduledArrivalAt" DATETIME NOT NULL,
    "scheduledDepartureAt" DATETIME,
    "actualArrivalAt" DATETIME,
    "actualDepartureAt" DATETIME,
    "transportMode" TEXT NOT NULL,
    "flightNumber" TEXT,
    "flightOrigin" TEXT,
    "flightEta" DATETIME,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "driverVehicle" TEXT,
    "driverEta" DATETIME,
    "driverAssignedAt" DATETIME,
    "roomId" TEXT,
    "suiteReadyBy" DATETIME,
    "suiteReadyAt" DATETIME,
    "suiteNotes" TEXT,
    "welcomeAmenity" TEXT,
    "dietaryNotes" TEXT,
    "specialRequests" TEXT,
    "meetingPoint" TEXT,
    "hostUserId" TEXT,
    "estimatedRevenueCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskNotes" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arrival_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Arrival_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arrival_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arrival_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArrivalTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arrivalId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "assignedUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "blockedBy" TEXT NOT NULL DEFAULT '[]',
    "completedById" TEXT,
    "completionNotes" TEXT,
    "evidenceUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArrivalTask_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArrivalTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArrivalStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arrivalId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArrivalStatusEvent_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArrivalStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorId" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ArrivalTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExternalUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arrivalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExternalUpdate_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_subscriptionId_key" ON "Hotel"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_stripeCustomerId_key" ON "Hotel"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Hotel_ownerId_idx" ON "Hotel"("ownerId");

-- CreateIndex
CREATE INDEX "Hotel_plan_isActive_idx" ON "Hotel"("plan", "isActive");

-- CreateIndex
CREATE INDEX "Hotel_stripeCustomerId_idx" ON "Hotel"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Hotel_subscriptionId_idx" ON "Hotel"("subscriptionId");

-- CreateIndex
CREATE INDEX "HotelMembership_userId_isActive_idx" ON "HotelMembership"("userId", "isActive");

-- CreateIndex
CREATE INDEX "HotelMembership_hotelId_role_idx" ON "HotelMembership"("hotelId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "HotelMembership_hotelId_userId_key" ON "HotelMembership"("hotelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelInvitation_token_key" ON "HotelInvitation"("token");

-- CreateIndex
CREATE INDEX "HotelInvitation_hotelId_email_idx" ON "HotelInvitation"("hotelId", "email");

-- CreateIndex
CREATE INDEX "HotelInvitation_token_idx" ON "HotelInvitation"("token");

-- CreateIndex
CREATE INDEX "HotelInvitation_expiresAt_idx" ON "HotelInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_userId_revokedAt_idx" ON "UserSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "UserSession_refreshToken_idx" ON "UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_prefix_key" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "ApiKey_hotelId_idx" ON "ApiKey"("hotelId");

-- CreateIndex
CREATE INDEX "ApiKey_prefix_idx" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "SuiteState_hotelId_idx" ON "SuiteState"("hotelId");

-- CreateIndex
CREATE INDEX "SuiteState_roomId_idx" ON "SuiteState"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "SuiteState_hotelId_roomId_key" ON "SuiteState"("hotelId", "roomId");

-- CreateIndex
CREATE INDEX "SuiteControlEvent_hotelId_createdAt_idx" ON "SuiteControlEvent"("hotelId", "createdAt");

-- CreateIndex
CREATE INDEX "SuiteControlEvent_suiteStateId_idx" ON "SuiteControlEvent"("suiteStateId");

-- CreateIndex
CREATE INDEX "Membership_hotelId_role_idx" ON "Membership"("hotelId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_hotelId_key" ON "Membership"("userId", "hotelId");

-- CreateIndex
CREATE INDEX "MenuItem_hotelId_category_idx" ON "MenuItem"("hotelId", "category");

-- CreateIndex
CREATE INDEX "MenuItem_hotelId_isAvailable_idx" ON "MenuItem"("hotelId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "RoomOrder_orderNumber_key" ON "RoomOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "RoomOrder_hotelId_status_idx" ON "RoomOrder"("hotelId", "status");

-- CreateIndex
CREATE INDEX "RoomOrder_hotelId_placedAt_idx" ON "RoomOrder"("hotelId", "placedAt");

-- CreateIndex
CREATE INDEX "RoomOrder_roomId_status_idx" ON "RoomOrder"("roomId", "status");

-- CreateIndex
CREATE INDEX "RoomOrder_assignedChefId_status_idx" ON "RoomOrder"("assignedChefId", "status");

-- CreateIndex
CREATE INDEX "RoomOrder_assignedServerId_status_idx" ON "RoomOrder"("assignedServerId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_hotelId_createdAt_idx" ON "AuditLog"("hotelId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AiRule_hotelId_module_idx" ON "AiRule"("hotelId", "module");

-- CreateIndex
CREATE INDEX "ApiTokenQuota_hotelId_idx" ON "ApiTokenQuota"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiTokenQuota_hotelId_actorType_actorId_key" ON "ApiTokenQuota"("hotelId", "actorType", "actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Arrival_confirmationNumber_key" ON "Arrival"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Arrival_hotelId_scheduledArrivalAt_idx" ON "Arrival"("hotelId", "scheduledArrivalAt");

-- CreateIndex
CREATE INDEX "Arrival_hotelId_status_idx" ON "Arrival"("hotelId", "status");

-- CreateIndex
CREATE INDEX "Arrival_roomId_idx" ON "Arrival"("roomId");

-- CreateIndex
CREATE INDEX "ArrivalTask_arrivalId_idx" ON "ArrivalTask"("arrivalId");

-- CreateIndex
CREATE INDEX "ArrivalTask_hotelId_status_idx" ON "ArrivalTask"("hotelId", "status");

-- CreateIndex
CREATE INDEX "ArrivalTask_team_status_idx" ON "ArrivalTask"("team", "status");

-- CreateIndex
CREATE INDEX "ArrivalTask_assignedUserId_status_idx" ON "ArrivalTask"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "ArrivalStatusEvent_arrivalId_createdAt_idx" ON "ArrivalStatusEvent"("arrivalId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskEvent_taskId_createdAt_idx" ON "TaskEvent"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalUpdate_arrivalId_createdAt_idx" ON "ExternalUpdate"("arrivalId", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalUpdate_source_processedAt_idx" ON "ExternalUpdate"("source", "processedAt");
