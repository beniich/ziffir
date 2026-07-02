"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server/lib/prisma.ts
var prisma_exports = {};
__export(prisma_exports, {
  prisma: () => prisma
});
var import_client, prisma;
var init_prisma = __esm({
  "src/server/lib/prisma.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    prisma = global.__prisma || new import_client.PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
    });
    if (process.env.NODE_ENV !== "production") {
      global.__prisma = prisma;
    }
  }
});

// src/server/lib/email.ts
var import_nodemailer, transporter, emailService;
var init_email = __esm({
  "src/server/lib/email.ts"() {
    "use strict";
    import_nodemailer = __toESM(require("nodemailer"), 1);
    transporter = import_nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    emailService = {
      async sendInvitation(params) {
        const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue chez ${params.hotelName}</h2>
        <p>${params.inviterName} vous invite \xE0 rejoindre l'\xE9quipe en tant que <strong>${params.proposedRole}</strong>.</p>
        ${params.message ? `<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; color: #666;">${params.message}</blockquote>` : ""}
        <p>
          <a href="${params.inviteUrl}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Accepter l'invitation
          </a>
        </p>
        <p style="color: #888; font-size: 12px;">Ce lien expire dans 7 jours.</p>
      </div>
    `;
        await transporter.sendMail({
          from: `"Ziffir" <${process.env.SMTP_FROM}>`,
          to: params.to,
          subject: `Invitation \xE0 rejoindre ${params.hotelName}`,
          html
        });
      },
      async send(params) {
        await transporter.sendMail({
          from: `"Ziffir" <${process.env.SMTP_FROM}>`,
          to: params.to,
          subject: params.subject,
          html: params.html
        });
      }
    };
  }
});

// src/server/domains/auth/auth.service.ts
var auth_service_exports = {};
__export(auth_service_exports, {
  authService: () => authService
});
var import_bcrypt, import_jsonwebtoken, import_crypto, import_module, import_meta, require2, authenticator, ACCESS_TTL, TRIAL_DURATION_DAYS, MAX_FAILED_LOGINS, LOCK_DURATION_MINUTES, baseCookieOptions, ROLE_PERMISSIONS, AuthService, authService;
var init_auth_service = __esm({
  "src/server/domains/auth/auth.service.ts"() {
    "use strict";
    import_bcrypt = __toESM(require("bcrypt"), 1);
    import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
    import_crypto = __toESM(require("crypto"), 1);
    import_module = require("module");
    init_prisma();
    init_email();
    import_meta = {};
    require2 = (0, import_module.createRequire)(import_meta.url);
    ({ authenticator } = require2("otplib"));
    ACCESS_TTL = "15m";
    TRIAL_DURATION_DAYS = 14;
    MAX_FAILED_LOGINS = 5;
    LOCK_DURATION_MINUTES = 15;
    baseCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    };
    ROLE_PERMISSIONS = {
      OWNER: ["*"],
      MANAGER: [
        "arrivals.*",
        "orders.*",
        "suites.*",
        "wines.*",
        "tasks.*",
        "members.invite",
        "members.remove",
        "audit.read",
        "billing.view",
        "billing.manage"
      ],
      SOMMELIER: ["wines.*", "orders.read", "arrivals.read"],
      CONCIERGE: ["arrivals.*", "guests.*", "orders.create", "orders.read", "suites.read"],
      RECEPTION: ["arrivals.read", "arrivals.update", "orders.create", "orders.read", "guests.*", "suites.read"],
      HOUSEKEEPING: ["suites.update", "suites.read", "tasks.*"],
      KITCHEN: ["orders.read", "orders.update", "tasks.*"],
      STAFF: ["orders.create", "orders.read", "suites.read", "arrivals.read"],
      VIEWER: ["*.read"]
    };
    AuthService = class {
      // ===========================================================================
      // INSCRIPTION
      // ===========================================================================
      async register(input) {
        if (input.password.length < 12) {
          throw new Error("Le mot de passe doit faire au moins 12 caract\xE8res");
        }
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
          throw new Error("Cet email est d\xE9j\xE0 utilis\xE9");
        }
        const passwordHash = await import_bcrypt.default.hash(input.password, 12);
        const slug = await this.generateUniqueSlug(input.hotelName);
        const result = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: input.email,
              passwordHash,
              displayName: input.displayName,
              phone: input.phone,
              role: "CLIENT"
            }
          });
          const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 864e5);
          const hotel = await tx.hotel.create({
            data: {
              name: input.hotelName,
              slug,
              ownerId: user.id,
              plan: "FREE_TRIAL",
              trialEndsAt,
              subscriptionStatus: "TRIALING",
              maxRooms: 5,
              maxUsers: 3,
              maxSuiteStates: 5
            }
          });
          await tx.hotelMembership.create({
            data: {
              hotelId: hotel.id,
              userId: user.id,
              role: "OWNER",
              joinedAt: /* @__PURE__ */ new Date()
            }
          });
          const refreshToken = import_crypto.default.randomBytes(32).toString("hex");
          const refreshTokenHash = await import_bcrypt.default.hash(refreshToken, 10);
          const session = await tx.userSession.create({
            data: {
              userId: user.id,
              activeHotelId: hotel.id,
              refreshToken: refreshTokenHash,
              expiresAt: new Date(Date.now() + 7 * 864e5)
            }
          });
          return { user, hotel, session, refreshToken };
        });
        const accessToken = this.signAccessToken({
          sub: result.user.id,
          role: result.user.role,
          activeHotelId: result.hotel.id,
          sessionId: result.session.id
        });
        return {
          accessToken,
          refreshToken: result.refreshToken,
          auth: await this.buildAuthResult(result.user.id, result.session.id, result.hotel.id)
        };
      }
      // ===========================================================================
      // CONNEXION
      // ===========================================================================
      async login(input) {
        const user = await prisma.user.findUnique({
          where: { email: input.email },
          include: {
            memberships: {
              where: { isActive: true, removedAt: null },
              include: { hotel: true },
              orderBy: { joinedAt: "asc" }
            }
          }
        });
        if (!user) throw new Error("Identifiants invalides");
        if (!user.isActive) throw new Error("Compte d\xE9sactiv\xE9");
        if (user.lockedUntil && user.lockedUntil > /* @__PURE__ */ new Date()) {
          const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 6e4);
          throw new Error(`Compte verrouill\xE9. R\xE9essayez dans ${minutes} minutes.`);
        }
        const passwordOk = await import_bcrypt.default.compare(input.password, user.passwordHash);
        if (!passwordOk) {
          await this.recordFailedLogin(user.id);
          throw new Error("Identifiants invalides");
        }
        if (user.totpEnabled) {
          if (!input.totpCode) throw new Error("2FA_REQUIRED");
          if (!user.totpSecret) throw new Error("Configuration 2FA invalide");
          const totpValid = authenticator.verify({ token: input.totpCode, secret: user.totpSecret });
          if (!totpValid) throw new Error("Code 2FA invalide");
        }
        const activeHotel = user.memberships.find((m) => m.role === "OWNER")?.hotel || user.memberships[0]?.hotel || null;
        const refreshToken = import_crypto.default.randomBytes(32).toString("hex");
        const refreshTokenHash = await import_bcrypt.default.hash(refreshToken, 10);
        const session = await prisma.userSession.create({
          data: {
            userId: user.id,
            activeHotelId: activeHotel?.id || null,
            refreshToken: refreshTokenHash,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
            expiresAt: new Date(Date.now() + 7 * 864e5),
            totpVerified: user.totpEnabled && !!input.totpCode
          }
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: /* @__PURE__ */ new Date() }
        });
        const accessToken = this.signAccessToken({
          sub: user.id,
          role: user.role,
          activeHotelId: activeHotel?.id || null,
          sessionId: session.id
        });
        return {
          accessToken,
          refreshToken,
          auth: await this.buildAuthResult(user.id, session.id, activeHotel?.id || null)
        };
      }
      // ===========================================================================
      // REFRESH
      // ===========================================================================
      async refresh(refreshToken) {
        const sessions = await prisma.userSession.findMany({
          where: { revokedAt: null, expiresAt: { gt: /* @__PURE__ */ new Date() } }
        });
        let matchedSession = null;
        for (const session of sessions) {
          const ok = await import_bcrypt.default.compare(refreshToken, session.refreshToken);
          if (ok) {
            matchedSession = session;
            break;
          }
        }
        if (!matchedSession) throw new Error("Refresh token invalide");
        const user = await prisma.user.findUnique({ where: { id: matchedSession.userId } });
        if (!user || !user.isActive) throw new Error("Utilisateur inactif");
        const newRefreshToken = import_crypto.default.randomBytes(32).toString("hex");
        const newRefreshTokenHash = await import_bcrypt.default.hash(newRefreshToken, 10);
        await prisma.userSession.update({
          where: { id: matchedSession.id },
          data: { refreshToken: newRefreshTokenHash, lastSeenAt: /* @__PURE__ */ new Date() }
        });
        const accessToken = this.signAccessToken({
          sub: user.id,
          role: user.role,
          activeHotelId: matchedSession.activeHotelId,
          sessionId: matchedSession.id
        });
        return { accessToken, refreshToken: newRefreshToken };
      }
      // ===========================================================================
      // SWITCH HÔTEL
      // ===========================================================================
      async switchHotel(userId, hotelId, sessionId) {
        const membership = await prisma.hotelMembership.findFirst({
          where: {
            userId,
            hotelId,
            isActive: true,
            removedAt: null
          },
          include: { hotel: true }
        });
        if (!membership) throw new Error("Vous n'avez pas acc\xE8s \xE0 cet h\xF4tel");
        if (!membership.hotel.isActive) throw new Error("Cet h\xF4tel est d\xE9sactiv\xE9");
        if (membership.role !== "OWNER") {
          const expired = await this.isSubscriptionExpired(membership.hotel);
          if (expired) throw new Error("Abonnement expir\xE9");
        }
        await prisma.userSession.update({
          where: { id: sessionId },
          data: { activeHotelId: hotelId, lastSeenAt: /* @__PURE__ */ new Date() }
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User introuvable");
        const accessToken = this.signAccessToken({
          sub: user.id,
          role: user.role,
          activeHotelId: hotelId,
          sessionId
        });
        return { accessToken };
      }
      // ===========================================================================
      // LOGOUT
      // ===========================================================================
      async logout(sessionId) {
        await prisma.userSession.update({
          where: { id: sessionId },
          data: { revokedAt: /* @__PURE__ */ new Date() }
        });
      }
      // ===========================================================================
      // INVITATIONS
      // ===========================================================================
      async createInvitation(input) {
        const inviterMembership = await prisma.hotelMembership.findFirst({
          where: {
            hotelId: input.hotelId,
            userId: input.invitedById,
            role: { in: ["OWNER", "MANAGER"] },
            isActive: true
          }
        });
        if (!inviterMembership) throw new Error("Seul un OWNER ou MANAGER peut inviter");
        const existing = await prisma.hotelInvitation.findFirst({
          where: {
            hotelId: input.hotelId,
            email: input.email,
            acceptedAt: null,
            revokedAt: null,
            expiresAt: { gt: /* @__PURE__ */ new Date() }
          }
        });
        if (existing) throw new Error("Une invitation est d\xE9j\xE0 en attente pour cet email");
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
          include: { memberships: { where: { hotelId: input.hotelId, isActive: true } } }
        });
        if (existingUser?.memberships.length) {
          throw new Error("Cette personne est d\xE9j\xE0 membre");
        }
        const token = import_crypto.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 864e5);
        const invitation = await prisma.hotelInvitation.create({
          data: {
            hotelId: input.hotelId,
            email: input.email,
            proposedRole: input.proposedRole,
            token,
            expiresAt,
            invitedById: input.invitedById,
            message: input.message
          }
        });
        const hotel = await prisma.hotel.findUnique({
          where: { id: input.hotelId },
          select: { name: true }
        });
        const inviter = await prisma.user.findUnique({
          where: { id: input.invitedById },
          select: { displayName: true, name: true }
        });
        const inviteUrl = `${process.env.FRONTEND_URL}/invitation/${token}`;
        emailService.sendInvitation({
          to: input.email,
          inviteUrl,
          hotelName: hotel.name,
          inviterName: inviter.displayName || inviter.name || "Un administrateur",
          proposedRole: input.proposedRole,
          message: input.message
        }).catch(console.error);
        return { token, invitation, inviteUrl };
      }
      async acceptInvitation(input) {
        const invitation = await prisma.hotelInvitation.findUnique({
          where: { token: input.token },
          include: { hotel: true }
        });
        if (!invitation) throw new Error("Invitation introuvable");
        if (invitation.acceptedAt) throw new Error("Invitation d\xE9j\xE0 accept\xE9e");
        if (invitation.revokedAt) throw new Error("Invitation r\xE9voqu\xE9e");
        if (invitation.expiresAt < /* @__PURE__ */ new Date()) throw new Error("Invitation expir\xE9e");
        let user = await prisma.user.findUnique({ where: { email: invitation.email } });
        if (!user) {
          if (!input.displayName) throw new Error("displayName requis");
          if (input.password.length < 12) throw new Error("Mot de passe trop court (12 min)");
          const passwordHash = await import_bcrypt.default.hash(input.password, 12);
          user = await prisma.user.create({
            data: {
              email: invitation.email,
              passwordHash,
              displayName: input.displayName,
              role: "HOTEL"
            }
          });
        } else {
          const ok = await import_bcrypt.default.compare(input.password, user.passwordHash);
          if (!ok) throw new Error("Mot de passe incorrect");
        }
        await prisma.hotelMembership.create({
          data: {
            hotelId: invitation.hotelId,
            userId: user.id,
            role: invitation.proposedRole,
            invitedById: invitation.invitedById,
            joinedAt: /* @__PURE__ */ new Date()
          }
        });
        await prisma.hotelInvitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: /* @__PURE__ */ new Date() }
        });
        return this.login({
          email: user.email,
          password: input.password
        });
      }
      // ===========================================================================
      // HELPERS
      // ===========================================================================
      signAccessToken(payload) {
        return import_jsonwebtoken.default.sign(payload, process.env.JWT_ACCESS_SECRET || "fallback-secret", { expiresIn: ACCESS_TTL });
      }
      setAuthCookies(res, accessToken, refreshToken) {
        res.cookie("zafir_access_token", accessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1e3 });
        res.cookie("zafir_refresh_token", refreshToken, { ...baseCookieOptions, maxAge: 7 * 864e5 });
      }
      clearAuthCookies(res) {
        res.clearCookie("zafir_access_token", baseCookieOptions);
        res.clearCookie("zafir_refresh_token", baseCookieOptions);
      }
      async buildAuthResult(userId, _sessionId, activeHotelId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            memberships: {
              where: { isActive: true, removedAt: null },
              include: { hotel: true }
            }
          }
        });
        if (!user) throw new Error("User introuvable");
        const activeMembership = activeHotelId ? user.memberships.find((m) => m.hotelId === activeHotelId) : null;
        let activeHotel = null;
        if (activeMembership) {
          const trialEndsAt = activeMembership.hotel.trialEndsAt;
          const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 864e5)) : null;
          let perms = [];
          try {
            perms = JSON.parse(activeMembership.permissions);
          } catch (e) {
            perms = [];
          }
          activeHotel = {
            id: activeMembership.hotel.id,
            name: activeMembership.hotel.name,
            slug: activeMembership.hotel.slug,
            plan: activeMembership.hotel.plan,
            subscriptionStatus: activeMembership.hotel.subscriptionStatus,
            role: activeMembership.role,
            permissions: this.computePermissions(activeMembership.role, perms),
            trialEndsAt: trialEndsAt?.toISOString() || null,
            trialDaysLeft
          };
        }
        return {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName || user.name || "",
            role: user.role
          },
          activeHotel,
          availableHotels: user.memberships.map((m) => ({
            id: m.hotel.id,
            name: m.hotel.name,
            role: m.role
          }))
        };
      }
      computePermissions(role, customPerms) {
        const basePerms = ROLE_PERMISSIONS[role] || [];
        return [.../* @__PURE__ */ new Set([...basePerms, ...customPerms])];
      }
      async recordFailedLogin(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;
        const newCount = user.failedLoginCount + 1;
        const update = { failedLoginCount: newCount };
        if (newCount >= MAX_FAILED_LOGINS) {
          update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 6e4);
        }
        await prisma.user.update({ where: { id: userId }, data: update });
      }
      async isSubscriptionExpired(hotel) {
        if (hotel.plan === "FREE_TRIAL" && hotel.trialEndsAt && hotel.trialEndsAt < /* @__PURE__ */ new Date()) {
          return true;
        }
        if (["CANCELLED", "UNPAID"].includes(hotel.subscriptionStatus)) return true;
        if (hotel.currentPeriodEnd && hotel.currentPeriodEnd < /* @__PURE__ */ new Date()) return true;
        return false;
      }
      async generateUniqueSlug(name) {
        const base = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "hotel";
        let slug = base;
        let suffix = 0;
        while (await prisma.hotel.findUnique({ where: { slug } })) {
          suffix++;
          slug = `${base}-${suffix}`;
        }
        return slug;
      }
      // Méthode publique pour vérifier les permissions
      hasPermission(permissions, required2) {
        if (permissions.includes("*")) return true;
        if (permissions.includes(required2)) return true;
        const [scope] = required2.split(".");
        if (permissions.includes(`${scope}.*`)) return true;
        return false;
      }
    };
    authService = new AuthService();
  }
});

// src/server/services/push-notification.service.ts
var push_notification_service_exports = {};
__export(push_notification_service_exports, {
  pushNotificationService: () => pushNotificationService
});
var import_client6, prisma6, PushNotificationService, pushNotificationService;
var init_push_notification_service = __esm({
  "src/server/services/push-notification.service.ts"() {
    "use strict";
    import_client6 = require("@prisma/client");
    prisma6 = new import_client6.PrismaClient();
    PushNotificationService = class {
      webpush = null;
      async getWebpush() {
        if (this.webpush) return this.webpush;
        try {
          this.webpush = await import("web-push");
          const vapidEmail = process.env.VAPID_EMAIL || "admin@zaphir.io";
          const vapidPublic = process.env.VAPID_PUBLIC_KEY;
          const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
          if (vapidPublic && vapidPrivate) {
            this.webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
          } else {
            console.warn("[push] VAPID keys not configured \u2014 push disabled");
          }
        } catch (e) {
          console.warn("[push] web-push not installed \u2014 push notifications disabled");
        }
        return this.webpush;
      }
      /** Envoie une notification à tous les appareils d'un user */
      async sendToUser(userId, payload) {
        const subscriptions = await prisma6.pushSubscription.findMany({
          where: { userId }
        });
        if (subscriptions.length === 0) return;
        await this.sendToSubscriptions(subscriptions, payload);
      }
      /** Envoie à une liste d'endpoints */
      async sendToMany(endpoints, payload) {
        if (endpoints.length === 0) return;
        const subscriptions = await prisma6.pushSubscription.findMany({
          where: { endpoint: { in: endpoints } }
        });
        await this.sendToSubscriptions(subscriptions, payload);
      }
      async sendToSubscriptions(subscriptions, payload) {
        const wp = await this.getWebpush();
        if (!wp || !process.env.VAPID_PUBLIC_KEY) return;
        const notification = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/badge-72.png",
          tag: payload.tag,
          data: { url: payload.url, ...payload.data }
        });
        const results = await Promise.allSettled(
          subscriptions.map(
            (sub) => wp.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              notification
            ).catch(async (err) => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await prisma6.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {
                });
              }
              throw err;
            })
          )
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
          console.warn(`[push] ${failed}/${results.length} notifications failed`);
        }
      }
    };
    pushNotificationService = new PushNotificationService();
  }
});

// server.ts
var import_config2 = require("dotenv/config");
var import_express8 = __toESM(require("express"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_http = require("http");
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/server/microservices.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "tonal-legacy-v07pf",
  appId: "1:1037154403107:web:2984f2dfd3b53580f24296",
  apiKey: "AIzaSyD7mgV3ypfuBdaTaCSPEZEEOgBG6Kxrb0I",
  authDomain: "tonal-legacy-v07pf.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-c03eed34-6b98-437a-b865-3de7e2a9ecd6",
  storageBucket: "tonal-legacy-v07pf.firebasestorage.app",
  messagingSenderId: "1037154403107",
  measurementId: ""
};

// src/server/microservices.ts
var app = (0, import_app.initializeApp)(firebase_applet_config_default);
var db = (0, import_firestore.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId || "ai-studio-c03eed34-6b98-437a-b865-3de7e2a9ecd6");
async function getSettingDoc(tenantId, id, defaultData) {
  try {
    const docRef = (0, import_firestore.doc)(db, "tenants", tenantId || "default", "settings", id);
    const snap = await (0, import_firestore.getDoc)(docRef);
    if (snap.exists()) {
      return { ...defaultData, ...snap.data() };
    }
    await (0, import_firestore.setDoc)(docRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error(`Error reading setting ${id} from Firestore, using fallback:`, error);
    return defaultData;
  }
}
async function saveSettingDoc(tenantId, id, data) {
  try {
    const docRef = (0, import_firestore.doc)(db, "tenants", tenantId || "default", "settings", id);
    await (0, import_firestore.setDoc)(docRef, data);
  } catch (error) {
    console.error(`Error saving setting ${id} to Firestore:`, error);
  }
}
var defaultArrivals = {
  arrivalsApproved: false,
  guests: [
    { guest: "H.R.H. Prince Al-Waleed", flight: "LJG-747", suite: "301", status: "En Approche / Flying", eta: "8 mins", color: "text-amber-400" },
    { guest: "Elena Petrova (Elite Student)", flight: "LX-982", suite: "101", status: "Atterri / Landed", eta: "V\xE9rifi\xE9", color: "text-emerald-400" },
    { guest: "Alexandre Beaumont", flight: "PJS-550", suite: "201", status: "Transfert / En Route", eta: "15 mins", color: "text-[#c19a6b]" }
  ]
};
var defaultRoomService = {
  roomServiceCompleted: false,
  orders: [
    { item: "Caviar Beluga Imp\xE9rial (50g)", suite: "Suite 301", notes: "Extra toast & chilled silver spoon", status: "EN PR\xC9PARATION", time: "18:45" },
    { item: "Champagne Louis Roederer Cristal", suite: "Suite 201", notes: "Two custom lead crystal flutes", status: "LIVRAISON INSTANTAN\xC9E", time: "18:50" },
    { item: "Filet Mignon aux Truffes Noires", suite: "Suite 101", notes: "Medium rare, hot plates covered", status: "EN CUISINE", time: "19:02" }
  ]
};
var defaultSuiteControls = {
  suiteTemp: 21.5,
  suiteGlass: 40,
  suiteLight: "AMBIENT"
};
var defaultSuitePortal = {
  suiteActiveId: "201"
};
var defaultWellness = {
  selectedWellnessSlot: "facial",
  wellnessSlots: [
    { id: "1", time: "10:00 AM", guest: "Elena Petrova", service: "Royal Cellular Facial", room: "Treatment Room 2", therapist: "Camille", status: "CONFIRMED" },
    { id: "2", time: "11:30 AM", guest: "Prince Al-Waleed", service: "Deep Tissue Massage", room: "Treatment Room 1", therapist: "Sofia", status: "IN_PROGRESS" },
    { id: "3", time: "02:00 PM", guest: "Alexandre Beaumont", service: "Detoxifying Body Wrap", room: "Hydrotherapy Suite", therapist: "Marc", status: "COMPLETED" }
  ]
};
var defaultFleet = {
  selectedFleetVehicle: "sedan",
  fleetCars: [
    { id: "sedan", model: "Rolls-Royce Spectre Black Badge", driver: "Jean-Luc", status: "EN ROUTE", battery: 88, destination: "Altiport Courchevel (CVF)" },
    { id: "suv", model: "Mercedes-Maybach EQS SUV", driver: "Antoine", status: "DISPONIBLE", battery: 94, destination: "Lobby Principal" },
    { id: "hyper", model: "Bugatti Tourbillon (Escorte Priv\xE9e)", driver: "Marc-Aur\xE8le", status: "MAINTENANCE", battery: 100, destination: "Hangar Elite" }
  ]
};
var defaultYachting = {
  yachtName: "The Sovereign",
  mooringSpot: "Port de Saint-Tropez - Quai d'Honneur",
  anchorDepth: 14.8,
  waterTemp: 22.4,
  deckTemp: 24.1,
  engineLoad: 0,
  tenderStatus: "DOCK\xC9"
};
var defaultWineCellar = {
  sommelierAdvice: null,
  bottles: [
    { id: "c1", name: "Romanee-Conti Grand Cru", year: 2015, stock: 4, rating: 99 },
    { id: "c2", name: "Ch\xE2teau Petrus Pomerol", year: 2010, stock: 6, rating: 98 },
    { id: "c3", name: "Dom P\xE9rignon Pl\xE9nitude 2", year: 2004, stock: 12, rating: 97 }
  ]
};
var defaultMemberships = {
  platinumConcierge: true,
  platinumSpa: true,
  platinumHost: true,
  goldConcierge: true,
  goldSpa: false,
  goldHost: true,
  onyxConcierge: true,
  onyxSpa: true,
  onyxHost: true,
  platinumFee: "50000",
  goldFee: "25000",
  onyxFee: "10000"
};
var defaultMetalCards = {
  customCardName: "Alexandre Beaumont",
  cardWeight: 28,
  cardFinish: "BRUSHED_GOLD"
};
var defaultChannelSync = {
  syncingChannels: false,
  syncSuccess: false,
  channels: [
    { name: "Sovereign Booking Engine", latency: "1.2ms", status: "SYNCHRONIS\xC9" },
    { name: "GDS Amadeus Prime", latency: "14.5ms", status: "SYNCHRONIS\xC9" },
    { name: "Sabre Luxury Network", latency: "22.1ms", status: "SYNCHRONIS\xC9" }
  ]
};
var defaultPricing = {
  solutionsRoomsCount: 45,
  solutionsTier: "PALACE"
};
var defaultCMS = {
  cmsPalette: "gold",
  cmsSerif: true,
  cmsSliders: 65,
  cmsUpendions: 80
};
var defaultBusiness = {
  businessHours: "24/7 VIP Access",
  roomBookings: [
    { id: "b1", room: "Sovereign Executive Boardroom", time: "09:00 AM - 11:00 AM", bookedBy: "Prince Al-Waleed" },
    { id: "b2", room: "Prestige Suite A", time: "02:00 PM - 03:30 PM", bookedBy: "Elena Petrova" }
  ]
};
var defaultTestimonials = {
  list: [
    { id: "1", name: "Lady Charlotte Vane", role: "Royal Patron", text: "Zaphir is the crown jewel of operations. Its predictive modules and bespoke automation elevated our guest satisfaction metrics to unprecedented heights.", hotel: "Royal Chalet, Zermatt", rating: 5 },
    { id: "2", name: "Marc-Antoine de Bouvier", role: "General Director", text: "We customized Zaphir for our private fleet and custom sommelier cellars. It operates as an invisible butler of pure software precision.", hotel: "H\xF4tel Splendide, Courchevel", rating: 5 }
  ]
};
var defaultVault = {
  vaultDecrypted: false,
  vaultDecrypting: false,
  multisigApprovals: [
    { approver: "General Manager", approved: true, role: "Principal Executive" },
    { approver: "Director of Cyber Defense", approved: false, role: "System Administrator" },
    { approver: "Owner's Trustee Representative", approved: false, role: "External Validator" }
  ]
};
var defaultMaintenance = {
  diagnosticsRunning: false,
  diagnosticsOutput: [],
  maintenanceTasks: [
    { id: "t1", title: "Calibration Capteurs de Pression Spa", location: "Piscine Thermale", severity: "MEDIUM", assignedTo: "Stefan Keller", status: "IN_PROGRESS", time: "14:20" },
    { id: "t2", title: "Contr\xF4le Filtre Cellar Temp\xE9rature", location: "Cave Souterraine 3", severity: "HIGH", assignedTo: "Pierre Laurent", status: "AFFECTED", time: "14:50" },
    { id: "t3", title: "V\xE9rification Cryog\xE8ne Vault Backup", location: "Chambre du Coffre", severity: "CRITICAL", assignedTo: "Marc Aurel", status: "SOLVED", time: "11:15" }
  ]
};
var defaultLedger = {
  ledgerGenerating: false,
  ledgerSuccess: false,
  blocks: [
    { index: 1, hash: "0000a12f6b89c3d4e5f67a...", previousHash: "0000000000000000000000...", timestamp: "2026-06-29 10:15:22", data: "Suite 301 Access Activated (H.R.H. Prince Al-Waleed)" },
    { index: 2, hash: "0000f48e9c0b1a2d3e4f5a...", previousHash: "0000a12f6b89c3d4e5f67a...", timestamp: "2026-06-29 11:32:04", data: "Secured Vault Multi-Signature Request Initiated" }
  ]
};
var defaultPredictive = {
  diagnosticsStatus: "EXCELLENT",
  anomaliesCount: 0,
  systems: [
    { name: "HVAC Penthouse Compressor", health: 98, wearFactor: 12, status: "NOMINAL" },
    { name: "Pool Thermal Heater Exchange", health: 87, wearFactor: 34, status: "MONITOR" },
    { name: "Vault Cryogenic Compressor", health: 99, wearFactor: 4, status: "NOMINAL" },
    { name: "Secondary Power Inverter", health: 92, wearFactor: 18, status: "NOMINAL" }
  ]
};
var defaultCyber = {
  threatLevel: "LOW",
  blockedIPs: 1422,
  firewallActive: true,
  nodes: [
    { name: "Central Console Ingress", status: "ONLINE", uptime: "99.99%" },
    { name: "Suite Smart IoT Grid", status: "ONLINE", uptime: "99.95%" },
    { name: "Secure Crypt Vault Node", status: "ONLINE", uptime: "100.00%" },
    { name: "Chauffeur Fleet GNSS Relay", status: "ONLINE", uptime: "99.98%" }
  ]
};
var defaultEnergy = {
  energyReportOpen: false,
  energyHvacLoad: 75,
  energyWaterUsage: 1200,
  energyProduction: 4500
};
var defaultEmergency = {
  lockdownTimer: "00:02:30",
  emergencyActive: false,
  connectedResponders: []
};
var defaultHeatmap = {
  selectedHeatmapZone: "suite",
  zoneTraffic: {
    suite: { currentCount: 14, maxCapacity: 40, status: "LOW" },
    lobby: { currentCount: 45, maxCapacity: 100, status: "OPTIMAL" },
    spa: { currentCount: 12, maxCapacity: 30, status: "LOW" }
  }
};
var microserviceService = {
  // Get all states (one massive handshake)
  async getAllStates(tenantId) {
    const arrivals = await getSettingDoc(tenantId, "cockpit_arrivals", defaultArrivals);
    const roomService = await getSettingDoc(tenantId, "cockpit_room_service", defaultRoomService);
    const suiteControls = await getSettingDoc(tenantId, "cockpit_suite_controls", defaultSuiteControls);
    const suitePortal = await getSettingDoc(tenantId, "cockpit_suite_portal", defaultSuitePortal);
    const wellness = await getSettingDoc(tenantId, "cockpit_wellness", defaultWellness);
    const fleet = await getSettingDoc(tenantId, "cockpit_fleet", defaultFleet);
    const yachting = await getSettingDoc(tenantId, "cockpit_yachting", defaultYachting);
    const wineCellar = await getSettingDoc(tenantId, "cockpit_wine_cellar", defaultWineCellar);
    const memberships = await getSettingDoc(tenantId, "cockpit_memberships", defaultMemberships);
    const metalCards = await getSettingDoc(tenantId, "cockpit_metal_cards", defaultMetalCards);
    const channelSync = await getSettingDoc(tenantId, "cockpit_channel_sync", defaultChannelSync);
    const pricing = await getSettingDoc(tenantId, "cockpit_pricing", defaultPricing);
    const cms = await getSettingDoc(tenantId, "cockpit_cms", defaultCMS);
    const business = await getSettingDoc(tenantId, "cockpit_business", defaultBusiness);
    const testimonials = await getSettingDoc(tenantId, "cockpit_testimonials", defaultTestimonials);
    const vault = await getSettingDoc(tenantId, "cockpit_vault", defaultVault);
    const maintenance = await getSettingDoc(tenantId, "cockpit_maintenance", defaultMaintenance);
    const ledger = await getSettingDoc(tenantId, "cockpit_ledger", defaultLedger);
    const predictive = await getSettingDoc(tenantId, "cockpit_predictive", defaultPredictive);
    const cyber = await getSettingDoc(tenantId, "cockpit_cyber", defaultCyber);
    const energy = await getSettingDoc(tenantId, "cockpit_energy", defaultEnergy);
    const emergency = await getSettingDoc(tenantId, "cockpit_emergency", defaultEmergency);
    const heatmap = await getSettingDoc(tenantId, "cockpit_heatmap", defaultHeatmap);
    return {
      arrivals,
      roomService,
      suiteControls,
      suitePortal,
      wellness,
      fleet,
      yachting,
      wineCellar,
      memberships,
      metalCards,
      channelSync,
      pricing,
      cms,
      business,
      testimonials,
      vault,
      maintenance,
      ledger,
      predictive,
      cyber,
      energy,
      emergency,
      heatmap
    };
  },
  // Logistics
  async getArrivals(tenantId) {
    return getSettingDoc(tenantId, "cockpit_arrivals", defaultArrivals);
  },
  async saveArrivals(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_arrivals", data);
  },
  async getFleet(tenantId) {
    return getSettingDoc(tenantId, "cockpit_fleet", defaultFleet);
  },
  async saveFleet(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_fleet", data);
  },
  async getHeatmap(tenantId) {
    return getSettingDoc(tenantId, "cockpit_heatmap", defaultHeatmap);
  },
  async saveHeatmap(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_heatmap", data);
  },
  async getYachting(tenantId) {
    return getSettingDoc(tenantId, "cockpit_yachting", defaultYachting);
  },
  async saveYachting(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_yachting", data);
  },
  // Hospitality
  async getRoomService(tenantId) {
    return getSettingDoc(tenantId, "cockpit_room_service", defaultRoomService);
  },
  async saveRoomService(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_room_service", data);
  },
  async getSuiteControls(tenantId) {
    return getSettingDoc(tenantId, "cockpit_suite_controls", defaultSuiteControls);
  },
  async saveSuiteControls(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_suite_controls", data);
  },
  async getSuitePortal(tenantId) {
    return getSettingDoc(tenantId, "cockpit_suite_portal", defaultSuitePortal);
  },
  async saveSuitePortal(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_suite_portal", data);
  },
  async getWellness(tenantId) {
    return getSettingDoc(tenantId, "cockpit_wellness", defaultWellness);
  },
  async saveWellness(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_wellness", data);
  },
  // Commerce
  async getWineCellar(tenantId) {
    return getSettingDoc(tenantId, "cockpit_wine_cellar", defaultWineCellar);
  },
  async saveWineCellar(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_wine_cellar", data);
  },
  async getMemberships(tenantId) {
    return getSettingDoc(tenantId, "cockpit_memberships", defaultMemberships);
  },
  async saveMemberships(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_memberships", data);
  },
  async getMetalCards(tenantId) {
    return getSettingDoc(tenantId, "cockpit_metal_cards", defaultMetalCards);
  },
  async saveMetalCards(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_metal_cards", data);
  },
  async getChannelSync(tenantId) {
    return getSettingDoc(tenantId, "cockpit_channel_sync", defaultChannelSync);
  },
  async saveChannelSync(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_channel_sync", data);
  },
  async getPricing(tenantId) {
    return getSettingDoc(tenantId, "cockpit_pricing", defaultPricing);
  },
  async savePricing(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_pricing", data);
  },
  async getCMS(tenantId) {
    return getSettingDoc(tenantId, "cockpit_cms", defaultCMS);
  },
  async saveCMS(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_cms", data);
  },
  async getBusiness(tenantId) {
    return getSettingDoc(tenantId, "cockpit_business", defaultBusiness);
  },
  async saveBusiness(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_business", data);
  },
  async getTestimonials(tenantId) {
    return getSettingDoc(tenantId, "cockpit_testimonials", defaultTestimonials);
  },
  async saveTestimonials(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_testimonials", data);
  },
  // Security & Technical
  async getVault(tenantId) {
    return getSettingDoc(tenantId, "cockpit_vault", defaultVault);
  },
  async saveVault(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_vault", data);
  },
  async getMaintenance(tenantId) {
    return getSettingDoc(tenantId, "cockpit_maintenance", defaultMaintenance);
  },
  async saveMaintenance(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_maintenance", data);
  },
  async getLedger(tenantId) {
    return getSettingDoc(tenantId, "cockpit_ledger", defaultLedger);
  },
  async saveLedger(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_ledger", data);
  },
  async getPredictive(tenantId) {
    return getSettingDoc(tenantId, "cockpit_predictive", defaultPredictive);
  },
  async savePredictive(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_predictive", data);
  },
  async getCyber(tenantId) {
    return getSettingDoc(tenantId, "cockpit_cyber", defaultCyber);
  },
  async saveCyber(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_cyber", data);
  },
  async getEnergy(tenantId) {
    return getSettingDoc(tenantId, "cockpit_energy", defaultEnergy);
  },
  async saveEnergy(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_energy", data);
  },
  async getEmergency(tenantId) {
    return getSettingDoc(tenantId, "cockpit_emergency", defaultEmergency);
  },
  async saveEmergency(tenantId, data) {
    return saveSettingDoc(tenantId, "cockpit_emergency", data);
  }
};

// src/server/middleware/cookieAuth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
init_prisma();
var COOKIE_NAMES = {
  ACCESS: "zafir_access_token",
  REFRESH: "zafir_refresh_token"
};
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS];
    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: "Non authentifi\xE9", code: "AUTH_REQUIRED" }
      });
      return;
    }
    const decoded = import_jsonwebtoken2.default.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    const session = await prisma.userSession.findUnique({
      where: { id: decoded.sessionId }
    });
    if (!session || session.revokedAt || session.expiresAt < /* @__PURE__ */ new Date()) {
      res.clearCookie(COOKIE_NAMES.ACCESS, { path: "/" });
      res.clearCookie(COOKIE_NAMES.REFRESH, { path: "/" });
      res.status(401).json({
        success: false,
        error: { message: "Session invalide", code: "SESSION_INVALID" }
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, isActive: true, role: true }
    });
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { message: "Compte d\xE9sactiv\xE9", code: "ACCOUNT_DISABLED" }
      });
      return;
    }
    req.auth = decoded;
    prisma.userSession.update({
      where: { id: session.id },
      data: { lastSeenAt: /* @__PURE__ */ new Date() }
    }).catch(() => {
    });
    next();
  } catch (e) {
    res.status(401).json({
      success: false,
      error: { message: "Token invalide", code: "INVALID_TOKEN" }
    });
    return;
  }
}
function requirePermission(...required2) {
  return async (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: { message: "Non authentifi\xE9" }
      });
    }
    if (!req.auth.activeHotelId) {
      return res.status(403).json({
        success: false,
        error: { message: "Aucun h\xF4tel actif", code: "NO_ACTIVE_HOTEL" }
      });
    }
    const { prisma: prisma14 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
    const membership = await prisma14.hotelMembership.findFirst({
      where: {
        userId: req.auth.sub,
        hotelId: req.auth.activeHotelId,
        isActive: true,
        removedAt: null
      }
    });
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { message: "Acc\xE8s refus\xE9 \xE0 cet h\xF4tel" }
      });
    }
    const { authService: authService2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
    let parsedPerms = [];
    try {
      parsedPerms = JSON.parse(membership.permissions || "[]");
    } catch (e) {
      parsedPerms = [];
    }
    const permissions = authService2.computePermissions(membership.role, parsedPerms);
    const hasAll = required2.every((p) => authService2.hasPermission(permissions, p));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Permissions insuffisantes (besoin: ${required2.join(", ")})`,
          code: "INSUFFICIENT_PERMISSIONS",
          required: required2
        }
      });
    }
    next();
  };
}

// src/server/security/tokenTracker.ts
var import_client2 = require("@prisma/client");
var prisma2 = new import_client2.PrismaClient();
var quotaCache = /* @__PURE__ */ new Map();
var trackTokens = (costPerRequest = 1) => {
  return async (req, res, next) => {
    if (!req.path.startsWith("/api") || req.path === "/api/state") {
      return next();
    }
    const auth = req.auth;
    const hotelId = auth?.hotelId || auth?.tenantId || "hotel-dev";
    const actorId = auth?.uid || auth?.sub || "anonymous";
    const actorType = auth?.role ? "role" : "user";
    const cacheKey = `${hotelId}:${actorType}:${actorId}`;
    let quota = quotaCache.get(cacheKey);
    if (!quota || quota.expiresAt < Date.now()) {
      try {
        let dbQuota = await prisma2.apiTokenQuota.findUnique({
          where: { hotelId_actorType_actorId: { hotelId, actorType, actorId } }
        });
        if (!dbQuota) {
          dbQuota = await prisma2.apiTokenQuota.create({
            data: {
              hotelId,
              actorId,
              actorType,
              dailyLimit: actorType === "system" ? 1e5 : 1e3
            }
          });
        }
        quota = {
          consumed: dbQuota.consumedToday,
          limit: dbQuota.dailyLimit,
          suspended: dbQuota.isSuspended,
          expiresAt: Date.now() + 6e4
          // Cache 1 minute
        };
        quotaCache.set(cacheKey, quota);
      } catch (e) {
        console.error("[TokenTracker] Error fetching quota", e);
        return next();
      }
    }
    if (quota.suspended) {
      console.warn(`[TokenTracker] ACCESS DENIED: Account suspended (${cacheKey})`);
      return res.status(403).json({
        success: false,
        error: { message: "Account API access suspended", code: "ACCOUNT_SUSPENDED" }
      });
    }
    if (quota.consumed + costPerRequest > quota.limit) {
      console.warn(`[TokenTracker] QUOTA EXCEEDED: ${cacheKey}`);
      return res.status(429).json({
        success: false,
        error: { message: "API Token Quota Exceeded", code: "QUOTA_EXCEEDED" }
      });
    }
    quota.consumed += costPerRequest;
    prisma2.apiTokenQuota.update({
      where: { hotelId_actorType_actorId: { hotelId, actorType, actorId } },
      data: { consumedToday: { increment: costPerRequest } }
    }).catch((e) => console.error("[TokenTracker] Failed to persist usage", e));
    res.setHeader("X-Tokens-Used", quota.consumed.toString());
    res.setHeader("X-Tokens-Limit", quota.limit.toString());
    next();
  };
};

// src/server/realtime/socketServer.ts
var import_socket = require("socket.io");
var instance = null;
var RealtimeServer = class {
  io;
  constructor(httpServer) {
    this.io = new import_socket.Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"]
      },
      transports: ["websocket", "polling"],
      pingTimeout: 3e4,
      pingInterval: 25e3
    });
    this.io.use(this.authMiddleware.bind(this));
    this.io.on("connection", this.onConnection.bind(this));
    console.log("[socket] RealtimeServer initialized");
  }
  // --------------------------------------------------------------------------
  // Auth : Bearer token via query param (envoyé par useSocket.ts)
  // On accepte aussi l'header auth pour les clients REST
  // --------------------------------------------------------------------------
  async authMiddleware(socket, next) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("AUTH_REQUIRED"));
      }
      if (token === "sandbox-token-proprietor") {
        socket.data = {
          userId: "dev-proprietor",
          userRole: "administrateur",
          activeHotelId: "hotel-dev"
        };
        return next();
      }
      const parts = token.split(".");
      if (parts.length !== 3) return next(new Error("INVALID_TOKEN"));
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      socket.data = {
        userId: payload.uid || payload.sub || "unknown",
        userRole: payload.role || "operateur",
        activeHotelId: payload.hotelId || payload.activeHotelId || "hotel-default"
      };
      next();
    } catch (e) {
      next(new Error("AUTH_FAILED"));
    }
  }
  // --------------------------------------------------------------------------
  // Connexion : rejoindre les rooms multi-tenant
  // --------------------------------------------------------------------------
  onConnection(socket) {
    const data = socket.data;
    const hotelId = data.activeHotelId;
    socket.join(`hotel:${hotelId}`);
    socket.join(`role:${data.userRole}:hotel:${hotelId}`);
    socket.join(`user:${data.userId}`);
    console.log(
      `[socket] User ${data.userId} (${data.userRole}) \u2192 hotel:${hotelId}`
    );
    socket.on("disconnect", (reason) => {
      console.log(`[socket] User ${data.userId} disconnected (${reason})`);
    });
    socket.on("hotel:switched", (newHotelId) => {
      socket.leave(`hotel:${hotelId}`);
      socket.join(`hotel:${newHotelId}`);
      socket.data.activeHotelId = newHotelId;
    });
  }
  // --------------------------------------------------------------------------
  // Émetteurs publics (appelés depuis les routes Express)
  // --------------------------------------------------------------------------
  /** Broadcast à tous les users d'un hôtel */
  emitToHotel(hotelId, event, payload) {
    this.io.to(`hotel:${hotelId}`).emit(event, payload);
  }
  /** Broadcast à un rôle spécifique dans un hôtel */
  emitToRole(hotelId, role, event, payload) {
    this.io.to(`role:${role}:hotel:${hotelId}`).emit(event, payload);
  }
  /** Notification privée à un user */
  emitToUser(userId, event, payload) {
    this.io.to(`user:${userId}`).emit(event, payload);
  }
};
function initRealtimeServer(httpServer) {
  if (instance) return instance;
  instance = new RealtimeServer(httpServer);
  return instance;
}
function getRealtimeServer() {
  if (!instance) throw new Error("RealtimeServer not initialized");
  return instance;
}

// src/server/core/orchestrator.ts
var import_client4 = require("@prisma/client");

// src/server/core/eventBus.ts
var import_events = require("events");
var ZaphirEventBus = class extends import_events.EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
  /**
   * Publie un événement interne
   */
  publish(eventName, payload) {
    this.emit(eventName, payload);
  }
};
var eventBus = new ZaphirEventBus();

// src/server/domains/shared/services/audit.service.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var import_client3 = require("@prisma/client");
var prisma3 = new import_client3.PrismaClient();
var AuditService = class {
  isWriting = false;
  queue = [];
  /**
   * Append un événement au ledger avec hash chain.
   * Les écritures sont sérialisées pour garantir l'intégrité de la chaîne.
   */
  async append(event) {
    return new Promise((resolve, reject) => {
      this.queue.push({ event, resolve, reject });
      this.drain();
    });
  }
  async drain() {
    if (this.isWriting || this.queue.length === 0) return;
    this.isWriting = true;
    while (this.queue.length > 0) {
      const { event, resolve, reject } = this.queue.shift();
      try {
        const log = await this.writeOne(event);
        resolve(log);
      } catch (e) {
        reject(e);
      }
    }
    this.isWriting = false;
  }
  async writeOne(event) {
    const last = await prisma3.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: { hash: true }
    });
    const previousHash = last?.hash ?? "GENESIS";
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const payload = JSON.stringify({
      eventType: event.eventType,
      hotelId: event.tenantId ?? null,
      actorId: event.actorId ?? null,
      actorType: event.actorType,
      resourceType: event.resourceType ?? null,
      resourceId: event.resourceId ?? null,
      action: event.action,
      metadata: event.metadata ?? null,
      previousHash,
      createdAt: now
    });
    const hash = import_crypto2.default.createHash("sha256").update(payload).digest("hex");
    const log = await prisma3.auditLog.create({
      data: {
        eventType: event.eventType,
        hotelId: event.tenantId ?? void 0,
        actorId: event.actorId ?? void 0,
        actorType: event.actorType,
        resourceType: event.resourceType ?? void 0,
        resourceId: event.resourceId ?? void 0,
        action: event.action,
        metadata: event.metadata ? JSON.stringify(event.metadata) : void 0,
        previousHash,
        hash,
        ipAddress: event.ipAddress ?? void 0,
        userAgent: event.userAgent ?? void 0
      }
    });
    return log;
  }
  /**
   * Vérifie l'intégrité de toute la chaîne (à lancer via cron ou admin)
   */
  async verifyChain() {
    const logs = await prisma3.auditLog.findMany({
      orderBy: { createdAt: "asc" }
    });
    let previousHash = null;
    for (const log of logs) {
      const payload = JSON.stringify({
        eventType: log.eventType,
        hotelId: log.hotelId,
        actorId: log.actorId,
        actorType: log.actorType,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        action: log.action,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        previousHash: log.previousHash,
        createdAt: log.createdAt.toISOString()
      });
      const expectedHash = import_crypto2.default.createHash("sha256").update(payload).digest("hex");
      if (log.hash !== expectedHash || log.previousHash !== previousHash) {
        return {
          valid: false,
          brokenAt: BigInt(logs.indexOf(log)),
          totalLogs: logs.length
        };
      }
      previousHash = log.hash;
    }
    return { valid: true, totalLogs: logs.length };
  }
  /**
   * Récupère les logs d'un tenant avec filtres
   */
  async listForTenant(tenantId, options = {}) {
    const where = { hotelId: tenantId };
    if (options.eventType) where.eventType = options.eventType;
    if (options.resourceType) where.resourceType = options.resourceType;
    if (options.actorId) where.actorId = options.actorId;
    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = options.from;
      if (options.to) where.createdAt.lte = options.to;
    }
    return prisma3.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 100
    });
  }
};
var auditService = new AuditService();

// src/server/core/orchestrator.ts
var prisma4 = new import_client4.PrismaClient();
var ZaphirCoreOrchestrator = class {
  initialized = false;
  init() {
    if (this.initialized) return;
    this.initialized = true;
    eventBus.on("logistics:driver_status", this.handleDriverStatus.bind(this));
    eventBus.on("suite:occupancy_changed", this.handleOccupancyChanged.bind(this));
    eventBus.on("order:status_changed", this.handleOrderStatusChanged.bind(this));
    console.log("\u{1F9E0} [Zaphir Core] AI Orchestrator initialized & listening");
  }
  // --------------------------------------------------------------------------
  // Règle 1 : Chauffeur VIP approche → Allumer la suite
  // --------------------------------------------------------------------------
  async handleDriverStatus(payload) {
    if (payload.status === "APPROACHING_HOTEL") {
      console.log(`\u{1F9E0} [Zaphir Core] VIP approaching suite ${payload.roomId}. Triggering WELCOME scene...`);
      try {
        const state = await prisma4.suiteState.findFirst({
          where: { hotelId: payload.hotelId, roomId: payload.roomId }
        });
        if (state) {
          const updated = await prisma4.suiteState.update({
            where: { id: state.id },
            data: {
              scene: "WELCOME",
              temperatureC: 22,
              lightLevel: 70,
              curtainsOpen: true,
              musicPlaying: true,
              version: { increment: 1 },
              lastUpdatedById: "system"
            },
            include: { room: true }
          });
          await auditService.append({
            eventType: "suite.update",
            tenantId: payload.hotelId,
            actorId: "system",
            actorType: "system",
            resourceType: "SuiteState",
            resourceId: state.id,
            action: "scene.change:WELCOME",
            metadata: { trigger: "logistics:driver_status", reason: "VIP Approaching" }
          });
          const realtime = getRealtimeServer();
          realtime.emitToHotel(payload.hotelId, "suite:updated", {
            roomId: payload.roomId,
            state: updated,
            updatedBy: "system"
          });
        }
      } catch (e) {
        console.error("\u{1F9E0} [Zaphir Core] Failed to process driver status rule", e);
      }
    }
  }
  // --------------------------------------------------------------------------
  // Règle 2 : Économie d'énergie (Green AI)
  // --------------------------------------------------------------------------
  async handleOccupancyChanged(payload) {
    if (!payload.isOccupied) {
      console.log(`\u{1F9E0} [Zaphir Core] Suite ${payload.roomId} vacant. Scheduling AWAY scene...`);
      setTimeout(async () => {
        try {
          const state = await prisma4.suiteState.findFirst({
            where: { hotelId: payload.hotelId, roomId: payload.roomId }
          });
          if (state && !state.isOccupied && state.scene !== "AWAY") {
            const updated = await prisma4.suiteState.update({
              where: { id: state.id },
              data: {
                scene: "AWAY",
                temperatureC: 15,
                lightLevel: 0,
                curtainsOpen: false,
                musicPlaying: false,
                version: { increment: 1 },
                lastUpdatedById: "system"
              },
              include: { room: true }
            });
            await auditService.append({
              eventType: "suite.update",
              tenantId: payload.hotelId,
              actorId: "system",
              actorType: "system",
              resourceType: "SuiteState",
              resourceId: state.id,
              action: "scene.change:AWAY",
              metadata: { trigger: "suite:occupancy_changed", reason: "Energy optimization" }
            });
            const realtime = getRealtimeServer();
            realtime.emitToHotel(payload.hotelId, "suite:updated", {
              roomId: payload.roomId,
              state: updated,
              updatedBy: "system"
            });
          }
        } catch (e) {
          console.error("\u{1F9E0} [Zaphir Core] Failed to process green AI rule", e);
        }
      }, 1e4);
    }
  }
  // --------------------------------------------------------------------------
  // Règle 3 : Orchestration Room Service
  // --------------------------------------------------------------------------
  async handleOrderStatusChanged(payload) {
    if (payload.toStatus === "READY") {
      console.log(`\u{1F9E0} [Zaphir Core] Order ${payload.orderId} READY. Auto-assigning nearest server...`);
      try {
        const order = await prisma4.roomOrder.findUnique({ where: { id: payload.orderId } });
        if (order && !order.assignedServerId) {
          const staffMember = await prisma4.membership.findFirst({
            where: { hotelId: payload.hotelId, role: "STAFF" }
          });
          if (staffMember) {
            const updated = await prisma4.roomOrder.update({
              where: { id: payload.orderId },
              data: {
                assignedServerId: staffMember.userId,
                version: { increment: 1 }
              },
              include: {
                room: true,
                items: true,
                assignedChef: { select: { displayName: true } },
                assignedServer: { select: { displayName: true } }
              }
            });
            const realtime = getRealtimeServer();
            realtime.emitToHotel(payload.hotelId, "order:updated", updated);
            await auditService.append({
              eventType: "order.auto_assign",
              tenantId: payload.hotelId,
              actorId: "system",
              actorType: "system",
              resourceType: "RoomOrder",
              resourceId: payload.orderId,
              action: "order.auto_assign",
              metadata: { serverId: staffMember.userId }
            });
          }
        }
      } catch (e) {
        console.error("\u{1F9E0} [Zaphir Core] Failed to process auto-assign rule", e);
      }
    }
  }
};
var orchestrator = new ZaphirCoreOrchestrator();

// src/server/routes/suite-controls.routes.ts
var import_express = require("express");
var import_client5 = require("@prisma/client");
var router = (0, import_express.Router)();
var prisma5 = new import_client5.PrismaClient();
var SCENE_PRESETS = {
  IDLE: { temperatureC: 20, lightLevel: 30, curtainsOpen: false, musicPlaying: false },
  WELCOME: { temperatureC: 22, lightLevel: 70, curtainsOpen: true, musicPlaying: true },
  MORNING: { temperatureC: 21, lightLevel: 100, curtainsOpen: true, musicPlaying: false },
  WORK: { temperatureC: 21, lightLevel: 90, curtainsOpen: true, musicPlaying: false },
  DINNER: { temperatureC: 22, lightLevel: 40, curtainsOpen: false, musicPlaying: true },
  NIGHT: { temperatureC: 19, lightLevel: 0, curtainsOpen: false, musicPlaying: false },
  AWAY: { temperatureC: 15, lightLevel: 0, curtainsOpen: false, musicPlaying: false }
};
function getTenantId(req) {
  const auth = req.auth;
  return auth?.hotelId || auth?.tenantId || "hotel-dev";
}
function getActorId(req) {
  const auth = req.auth;
  return auth?.uid || auth?.sub || auth?.userId || "system";
}
router.get("/", async (req, res) => {
  try {
    const hotelId = getTenantId(req);
    const states = await prisma5.suiteState.findMany({
      where: { hotelId },
      include: {
        room: {
          select: { id: true, number: true, floor: true, type: true }
        }
      },
      orderBy: { room: { number: "asc" } }
    });
    res.json({ success: true, data: states });
  } catch (e) {
    console.error("[suite-controls] GET / error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router.get("/:roomId", async (req, res) => {
  try {
    const hotelId = getTenantId(req);
    const state = await prisma5.suiteState.findFirst({
      where: { hotelId: String(hotelId), roomId: String(req.params.roomId) },
      include: { room: true }
    });
    if (!state) {
      return res.status(404).json({
        success: false,
        error: { message: "Suite introuvable" }
      });
    }
    res.json({ success: true, data: state });
  } catch (e) {
    console.error("[suite-controls] GET /:roomId error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router.patch("/:roomId", async (req, res) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const { version, scene, ...updates } = req.body;
    if (typeof version !== "number") {
      return res.status(400).json({
        success: false,
        error: { message: "`version` est requis" }
      });
    }
    const current = await prisma5.suiteState.findFirst({
      where: { hotelId: String(hotelId), roomId: String(req.params.roomId) },
      include: { room: { select: { number: true } } }
    });
    if (!current) {
      return res.status(404).json({
        success: false,
        error: { message: "Suite introuvable" }
      });
    }
    if (current.version !== version) {
      return res.status(409).json({
        success: false,
        error: {
          message: "Conflit : la suite a \xE9t\xE9 modifi\xE9e simultan\xE9ment",
          code: "VERSION_CONFLICT",
          currentVersion: current.version,
          currentState: current
        }
      });
    }
    let dataToUpdate = { ...updates };
    if (scene) {
      const preset = SCENE_PRESETS[scene] || {};
      dataToUpdate = { ...preset, ...dataToUpdate, scene };
    }
    const updatedState = await prisma5.$transaction(async (tx) => {
      const u = await tx.suiteState.update({
        where: { id: current.id },
        data: {
          ...dataToUpdate,
          version: { increment: 1 },
          lastUpdatedById: actorId
        },
        include: { room: true }
      });
      await auditService.append(
        {
          eventType: "suite.update",
          tenantId: hotelId,
          actorId,
          actorType: "user",
          resourceType: "SuiteState",
          resourceId: u.id,
          action: "suite.update",
          metadata: { updates: Object.keys(dataToUpdate), version: u.version },
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null
        }
      );
      return u;
    });
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, "suite:updated", {
        roomId: req.params.roomId,
        state: updatedState,
        updatedBy: actorId
      });
    } catch (e) {
      console.warn("Realtime server not available", e);
    }
    if ("isOccupied" in dataToUpdate) {
      eventBus.publish("suite:occupancy_changed", {
        hotelId,
        roomId: req.params.roomId,
        isOccupied: dataToUpdate.isOccupied
      });
    }
    if ("scene" in dataToUpdate) {
      eventBus.publish("suite:scene_changed", {
        hotelId,
        roomId: req.params.roomId,
        scene: dataToUpdate.scene
      });
    }
    res.json({ success: true, data: updatedState });
  } catch (e) {
    console.error("[suite-controls] PATCH error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router.get("/:roomId/history", async (req, res) => {
  try {
    const hotelId = getTenantId(req);
    const events = await prisma5.suiteControlEvent.findMany({
      where: {
        hotelId,
        suiteState: { roomId: String(req.params.roomId) }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json({ success: true, data: events });
  } catch (e) {
    console.error("[suite-controls] GET history error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router.get("/audit/verify", async (_req, res) => {
  try {
    const result = await auditService.verifyChain();
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur v\xE9rification" } });
  }
});
var suite_controls_routes_default = router;

// src/server/routes/room-orders.routes.ts
var import_express2 = require("express");
var import_client7 = require("@prisma/client");
init_push_notification_service();
var router2 = (0, import_express2.Router)();
var prisma7 = new import_client7.PrismaClient();
var ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: []
};
var STATUS_TIMESTAMPS = {
  CONFIRMED: "acknowledgedAt",
  PREPARING: "startedPrepAt",
  READY: "readyAt",
  DELIVERED: "deliveredAt"
};
function getTenantId2(req) {
  const auth = req.auth;
  return auth?.hotelId || auth?.tenantId || "hotel-dev";
}
function getActorId2(req) {
  const auth = req.auth;
  return auth?.uid || auth?.sub || "system";
}
function getActorRole(req) {
  const auth = req.auth;
  return (auth?.role || "hotel").toLowerCase();
}
async function generateOrderNumber(hotelId) {
  const now = /* @__PURE__ */ new Date();
  const prefix = `RS-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma7.roomOrder.count({
    where: {
      hotelId,
      placedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    }
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
router2.get("/", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const actorId = getActorId2(req);
    const actorRole = getActorRole(req);
    const { status, roomId, assignedToMe } = req.query;
    const where = { hotelId };
    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    } else {
      where.status = { in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] };
    }
    if (roomId) where.roomId = roomId;
    if (assignedToMe === "true") {
      if (actorRole === "client") {
        where.guestId = actorId;
      } else {
        where.OR = [{ assignedChefId: actorId }, { assignedServerId: actorId }];
      }
    } else if (actorRole === "client") {
      where.guestId = actorId;
    }
    const orders = await prisma7.roomOrder.findMany({
      where,
      include: {
        room: { select: { id: true, number: true, floor: true } },
        items: true,
        assignedChef: { select: { id: true, displayName: true } },
        assignedServer: { select: { id: true, displayName: true } }
      },
      orderBy: { placedAt: "desc" },
      take: 100
    });
    res.json({ success: true, data: orders });
  } catch (e) {
    console.error("[room-orders] GET / error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const actorId = getActorId2(req);
    const actorRole = getActorRole(req);
    const order = await prisma7.roomOrder.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: {
        room: true,
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 20 },
        placedBy: { select: { displayName: true, email: true } },
        assignedChef: { select: { id: true, displayName: true } },
        assignedServer: { select: { id: true, displayName: true } }
      }
    });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: "Commande introuvable" } });
    }
    if (actorRole === "client" && order.guestId !== actorId) {
      return res.status(403).json({ success: false, error: { message: "Acc\xE8s refus\xE9" } });
    }
    res.json({ success: true, data: order });
  } catch (e) {
    console.error("[room-orders] GET /:id error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router2.post("/", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const actorId = getActorId2(req);
    const actorRole = getActorRole(req);
    const { roomId, guestName, guestNotes, items, source } = req.body;
    if (!roomId || !guestName || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: { message: "Donn\xE9es requises manquantes" } });
    }
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma7.menuItem.findMany({
      where: { id: { in: menuItemIds }, hotelId }
    });
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ success: false, error: { message: "Plat(s) introuvable(s)" } });
    }
    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: `Plats indisponibles : ${unavailable.map((m) => m.name).join(", ")}`,
          code: "ITEMS_UNAVAILABLE"
        }
      });
    }
    let subtotalCents = 0;
    let maxPrepMinutes = 0;
    const orderItemsData = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      const lineTotal = menuItem.priceCents * item.quantity;
      subtotalCents += lineTotal;
      maxPrepMinutes = Math.max(maxPrepMinutes, menuItem.prepMinutes);
      return {
        menuItemId: item.menuItemId,
        nameSnapshot: menuItem.name,
        priceCentsSnapshot: menuItem.priceCents,
        prepMinutesSnapshot: menuItem.prepMinutes,
        quantity: item.quantity,
        customizations: item.customizations ? JSON.stringify(item.customizations) : null,
        itemNotes: item.itemNotes || null,
        unitPriceCents: menuItem.priceCents,
        totalPriceCents: lineTotal
      };
    });
    const serviceFeeCents = Math.round(subtotalCents * 0.1);
    const taxCents = Math.round((subtotalCents + serviceFeeCents) * 0.1);
    const totalCents = subtotalCents + serviceFeeCents + taxCents;
    const estimatedReadyAt = new Date(Date.now() + (maxPrepMinutes + 10) * 6e4);
    const orderNumber = await generateOrderNumber(hotelId);
    const order = await prisma7.roomOrder.create({
      data: {
        hotelId,
        roomId,
        orderNumber,
        guestName,
        guestId: actorRole === "client" ? actorId : null,
        placedById: actorId,
        placedBySource: source || "GUEST_PORTAL",
        status: "PENDING",
        guestNotes: guestNotes || null,
        subtotalCents,
        serviceFeeCents,
        taxCents,
        totalCents,
        currency: menuItems[0]?.currency || "EUR",
        estimatedReadyAt,
        items: { create: orderItemsData },
        statusHistory: {
          create: {
            toStatus: "PENDING",
            actorId,
            actorType: "user",
            reason: "Commande cr\xE9\xE9e"
          }
        }
      },
      include: {
        room: true,
        items: true
      }
    });
    await auditService.append({
      eventType: "order.create",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "RoomOrder",
      resourceId: order.id,
      action: "order.create",
      metadata: { orderNumber, totalCents, itemCount: items.length },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, "order:new", order);
    } catch (_) {
    }
    try {
      const staffMembers = await prisma7.hotelMembership.findMany({
        where: { hotelId, role: { in: ["OWNER", "MANAGER", "STAFF"] } },
        include: { user: { include: { pushSubscriptions: true } } }
      });
      const endpoints = staffMembers.flatMap((m) => m.user.pushSubscriptions.map((s) => s.endpoint));
      await pushNotificationService.sendToMany(endpoints, {
        title: `\u{1F37D}\uFE0F Nouvelle commande ${orderNumber}`,
        body: `${guestName} \u2014 Suite ${order.room.number} \u2014 ${items.length} article(s)`,
        url: `/room-service/orders/${order.id}`,
        tag: "new-order"
      });
    } catch (_) {
    }
    res.status(201).json({ success: true, data: order });
  } catch (e) {
    console.error("[room-orders] POST / error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router2.patch("/:id/transition", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const actorId = getActorId2(req);
    const { toStatus, reason, version, metadata } = req.body;
    if (!toStatus || typeof version !== "number") {
      return res.status(400).json({ success: false, error: { message: "`toStatus` et `version` requis" } });
    }
    const order = await prisma7.roomOrder.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: { room: true }
    });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: "Commande introuvable" } });
    }
    if (order.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: "Conflit de version", code: "VERSION_CONFLICT", currentState: order }
      });
    }
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(toStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Transition ${order.status} \u2192 ${toStatus} non autoris\xE9e`,
          code: "INVALID_TRANSITION",
          allowed
        }
      });
    }
    const now = /* @__PURE__ */ new Date();
    const updateData = {
      status: toStatus,
      previousStatus: order.status,
      version: { increment: 1 }
    };
    const tsField = STATUS_TIMESTAMPS[toStatus];
    if (tsField) updateData[tsField] = now;
    if (toStatus === "OUT_FOR_DELIVERY" && !order.assignedServerId) {
      updateData.assignedServerId = actorId;
    }
    const updated = await prisma7.$transaction(async (tx) => {
      const u = await tx.roomOrder.update({
        where: { id: order.id },
        data: updateData,
        include: {
          room: true,
          items: true,
          assignedChef: { select: { id: true, displayName: true } },
          assignedServer: { select: { id: true, displayName: true } }
        }
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus,
          actorId,
          actorType: "user",
          reason: reason || null,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
      return u;
    });
    await auditService.append({
      eventType: "order.transition",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "RoomOrder",
      resourceId: order.id,
      action: `order.${order.status}.to.${toStatus}`,
      metadata: { orderNumber: order.orderNumber, fromStatus: order.status, toStatus },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, "order:updated", updated);
      if (toStatus === "READY" && updated.assignedServerId) {
        await pushNotificationService.sendToUser(updated.assignedServerId, {
          title: `\u2705 Commande ${order.orderNumber} pr\xEAte`,
          body: `Suite ${updated.room.number} \u2014 ${updated.guestName}`,
          url: `/room-service/orders/${order.id}`,
          tag: "order-ready"
        });
      }
      if (toStatus === "DELIVERED" && updated.guestId) {
        await pushNotificationService.sendToUser(updated.guestId, {
          title: "\u{1F37D}\uFE0F Commande livr\xE9e !",
          body: `Votre commande ${order.orderNumber} a \xE9t\xE9 livr\xE9e. Bon app\xE9tit !`,
          url: `/room-service/orders/${order.id}`,
          tag: "order-delivered"
        });
      }
    } catch (_) {
    }
    eventBus.publish("order:status_changed", {
      hotelId,
      orderId: order.id,
      toStatus
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("[room-orders] transition error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router2.post("/:id/rate", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const actorId = getActorId2(req);
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: { message: "Note invalide (1-5)" } });
    }
    const order = await prisma7.roomOrder.findFirst({ where: { id: String(req.params.id), hotelId: String(hotelId) } });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: "Commande introuvable" } });
    }
    if (order.status !== "DELIVERED") {
      return res.status(400).json({ success: false, error: { message: "Commande non livr\xE9e" } });
    }
    const updated = await prisma7.roomOrder.update({
      where: { id: order.id },
      data: { rating, feedback: feedback || null, ratedAt: /* @__PURE__ */ new Date() }
    });
    await auditService.append({
      eventType: "order.rate",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "RoomOrder",
      resourceId: order.id,
      action: "order.rate",
      metadata: { rating, hasFeedback: !!feedback },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router2.get("/menu/items", async (req, res) => {
  try {
    const hotelId = getTenantId2(req);
    const items = await prisma7.menuItem.findMany({
      where: { hotelId, isAvailable: true, archivedAt: null },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }]
    });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
var room_orders_routes_default = router2;

// src/server/routes/push.routes.ts
var import_express3 = require("express");
var import_client8 = require("@prisma/client");
var router3 = (0, import_express3.Router)();
var prisma8 = new import_client8.PrismaClient();
router3.post("/subscribe", async (req, res) => {
  try {
    const actorId = req.auth?.uid || req.auth?.sub;
    if (!actorId) {
      return res.status(401).json({ success: false, error: { message: "Non authentifi\xE9" } });
    }
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ success: false, error: { message: "Subscription invalide" } });
    }
    await prisma8.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: actorId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router3.delete("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, error: { message: "`endpoint` requis" } });
    }
    await prisma8.pushSubscription.deleteMany({ where: { endpoint } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router3.get("/vapid-public-key", (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.json({ success: false, error: { message: "Push non configur\xE9" } });
  }
  res.json({ success: true, data: { vapidPublicKey: key } });
});
var push_routes_default = router3;

// src/server/routes/api-manager.routes.ts
var import_express4 = require("express");
var import_client9 = require("@prisma/client");
var router4 = (0, import_express4.Router)();
var prisma9 = new import_client9.PrismaClient();
router4.get("/", async (req, res) => {
  try {
    const auth = req.auth;
    const hotelId = auth?.hotelId || auth?.tenantId || "hotel-dev";
    const role = (auth?.role || "").toLowerCase();
    if (role !== "administrateur" && role !== "owner") {
      return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }
    const quotas = await prisma9.apiTokenQuota.findMany({
      where: { hotelId },
      orderBy: { consumedToday: "desc" }
    });
    res.json({ success: true, data: quotas });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router4.patch("/:id", async (req, res) => {
  try {
    const auth = req.auth;
    const hotelId = auth?.hotelId || auth?.tenantId || "hotel-dev";
    const actorId = auth?.uid || auth?.sub || "system";
    const { isSuspended, dailyLimit, suspendReason } = req.body;
    const quota = await prisma9.apiTokenQuota.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!quota || quota.hotelId !== hotelId) {
      return res.status(404).json({ success: false, error: { message: "Introuvable" } });
    }
    const updated = await prisma9.apiTokenQuota.update({
      where: { id: quota.id },
      data: {
        isSuspended: isSuspended !== void 0 ? isSuspended : quota.isSuspended,
        dailyLimit: dailyLimit !== void 0 ? dailyLimit : quota.dailyLimit,
        suspendReason: suspendReason !== void 0 ? suspendReason : quota.suspendReason,
        suspendedAt: isSuspended ? /* @__PURE__ */ new Date() : null
      }
    });
    await auditService.append({
      eventType: "security.quota_update",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "ApiTokenQuota",
      resourceId: updated.id,
      action: isSuspended ? "quota.suspend" : "quota.update",
      metadata: { actorTarget: updated.actorId, suspended: updated.isSuspended }
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
var api_manager_routes_default = router4;

// src/server/routes/arrivals.routes.ts
var import_express5 = require("express");
var import_client12 = require("@prisma/client");
init_push_notification_service();

// src/server/domains/arrivals/arrival-planner.service.ts
var import_client10 = require("@prisma/client");
var prisma10 = new import_client10.PrismaClient();
var HIGH_VIP_LEVELS = ["GOLD", "DIAMOND", "AMBASSADOR"];
var ArrivalPlannerService = class {
  planTasks(arrival) {
    const tasks = [];
    const arrivalTime = new Date(arrival.scheduledArrivalAt);
    const suiteReadyBy = new Date(arrival.suiteReadyBy);
    tasks.push({
      team: "HOUSEKEEPING",
      title: "Inspection finale de la suite",
      description: arrival.suiteNotes || "Pr\xE9paration VIP standard",
      dueAt: new Date(suiteReadyBy.getTime() - 30 * 6e4),
      priority: 1,
      isCritical: true
    });
    tasks.push({
      team: "HOUSEKEEPING",
      title: "Placement des amenities de bienvenue",
      description: arrival.welcomeAmenity || "Fleurs fra\xEEches + eau min\xE9rale",
      dueAt: new Date(suiteReadyBy.getTime() - 15 * 6e4),
      priority: 0,
      isCritical: false
    });
    tasks.push({
      team: "RESTAURANT",
      title: "Pr\xE9paration du welcome drink",
      description: arrival.dietaryNotes ? `Welcome drink \u2014 attention: ${arrival.dietaryNotes}` : "Champagne + eau p\xE9tillante + jus de fruits frais",
      dueAt: new Date(suiteReadyBy.getTime() - 45 * 6e4),
      priority: 1,
      isCritical: false
    });
    tasks.push({
      team: "CONCIERGE",
      title: "V\xE9rification profil & pr\xE9f\xE9rences guest",
      description: "Historique s\xE9jours, allergies, anniversaires, demandes sp\xE9ciales",
      dueAt: new Date(arrivalTime.getTime() - 24 * 60 * 6e4),
      // T-24h
      priority: 1,
      isCritical: true
    });
    if (arrival.transportMode !== "WALK_IN") {
      tasks.push({
        team: "BELL_SERVICE",
        title: "Voiturier en position",
        description: "Positionnement 10min avant l'arriv\xE9e pr\xE9vue du v\xE9hicule",
        dueAt: new Date(arrivalTime.getTime() - 10 * 6e4),
        priority: 1,
        isCritical: true
      });
    }
    if (["HELICOPTER", "YACHT"].includes(arrival.transportMode)) {
      tasks.push({
        team: "VALET",
        title: "Coordination avec compagnie jet/yacht",
        description: `Transport: ${arrival.flightNumber || "N/A"} \u2014 v\xE9rifier ETA et conditions d'accueil tarmac`,
        dueAt: new Date(arrivalTime.getTime() - 2 * 60 * 6e4),
        priority: 1,
        isCritical: true
      });
    }
    if (arrival.transportMode === "FLIGHT" && arrival.flightNumber) {
      tasks.push({
        team: "EXTERNAL",
        title: `Suivi vol ${arrival.flightNumber} en temps r\xE9el`,
        description: `Origine: ${arrival.flightOrigin || "?"} \u2014 Activer le tracking automatique`,
        dueAt: new Date(arrivalTime.getTime() - 3 * 60 * 6e4),
        priority: 0,
        isCritical: false
      });
    }
    tasks.push({
      team: "RECEPTION",
      title: "Pr\xE9-check-in dossier complet",
      description: "Documents ID, carte de cr\xE9dit, formulaire pr\xE9-rempli + cl\xE9 suite pr\xEAte",
      dueAt: new Date(arrivalTime.getTime() - 60 * 6e4),
      priority: 1,
      isCritical: false
    });
    tasks.push({
      team: "RECEPTION",
      title: "Accueil physique au meeting point",
      description: arrival.meetingPoint ? `Position: ${arrival.meetingPoint}` : "Position: Hall d'entr\xE9e principal",
      dueAt: new Date(arrivalTime.getTime() - 5 * 6e4),
      priority: 2,
      isCritical: true
    });
    if (HIGH_VIP_LEVELS.includes(arrival.vipLevel) && arrival.hostUserId) {
      tasks.push({
        team: "RECEPTION",
        title: "GM / Directeur pr\xEAt pour accueil personnalis\xE9",
        description: "Discours personnalis\xE9 selon profil, photo souvenir si souhait\xE9",
        dueAt: new Date(arrivalTime.getTime() - 15 * 6e4),
        priority: 2,
        isCritical: true
      });
    }
    if (arrival.vipLevel === "AMBASSADOR") {
      tasks.push({
        team: "RECEPTION",
        title: "P\xE9rim\xE8tre s\xE9curis\xE9 et briefing agents",
        description: "Coordonner avec service de s\xE9curit\xE9 VIP. V\xE9rifier acc\xE8s discrets.",
        dueAt: new Date(arrivalTime.getTime() - 60 * 6e4),
        priority: 2,
        isCritical: true
      });
    }
    if (arrival.vipLevel === "DIAMOND" || arrival.vipLevel === "AMBASSADOR") {
      tasks.push({
        team: "RESTAURANT",
        title: "Accueil personnalis\xE9 avec champagne",
        description: "Bouteille s\xE9lectionn\xE9e en chambre. Assurer la temp\xE9rature parfaite.",
        dueAt: new Date(arrivalTime.getTime() - 30 * 6e4),
        priority: 1,
        isCritical: false
      });
    }
    return tasks;
  }
  async createArrivalWithTasks(hotelId, input) {
    return await prisma10.$transaction(async (tx) => {
      const arrival = await tx.arrival.create({
        data: {
          hotelId,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          guestLanguage: input.guestLanguage || "fr",
          vipLevel: input.vipLevel,
          transportMode: input.transportMode,
          scheduledArrivalAt: input.scheduledArrivalAt,
          scheduledDepartureAt: input.scheduledDepartureAt || null,
          suiteReadyBy: input.suiteReadyBy,
          flightNumber: input.flightNumber || null,
          flightOrigin: input.flightOrigin || null,
          meetingPoint: input.meetingPoint || null,
          hostUserId: input.hostUserId || null,
          welcomeAmenity: input.welcomeAmenity || null,
          dietaryNotes: input.dietaryNotes || null,
          suiteNotes: input.suiteNotes || null,
          specialRequests: input.specialRequests || null,
          estimatedRevenueCents: input.estimatedRevenueCents || null,
          externalRef: input.externalRef || null,
          confirmationNumber: input.confirmationNumber || null,
          roomId: input.roomId || null,
          status: "SCHEDULED",
          createdById: input.createdById
        }
      });
      const planned = this.planTasks(input);
      for (const task of planned) {
        await tx.arrivalTask.create({
          data: {
            arrivalId: arrival.id,
            hotelId,
            team: task.team,
            title: task.title,
            description: task.description || null,
            dueAt: task.dueAt,
            priority: task.priority,
            isCritical: task.isCritical,
            status: "PENDING",
            blockedBy: "[]"
          }
        });
      }
      await tx.arrivalStatusEvent.create({
        data: {
          arrivalId: arrival.id,
          toStatus: "SCHEDULED",
          actorId: input.createdById,
          actorType: "user",
          reason: "Arriv\xE9e planifi\xE9e"
        }
      });
      return { arrival, taskCount: planned.length };
    });
  }
};
var arrivalPlannerService = new ArrivalPlannerService();

// src/server/domains/arrivals/external-sync.service.ts
var import_client11 = require("@prisma/client");
var prisma11 = new import_client11.PrismaClient();
var ExternalSyncService = class {
  async processFlightUpdate(payload, hotelId) {
    const arrival = await prisma11.arrival.findFirst({
      where: {
        hotelId,
        flightNumber: payload.flightNumber,
        status: { in: ["SCHEDULED", "CONFIRMED", "EN_ROUTE"] }
      }
    });
    if (!arrival) {
      console.log(`[flight-sync] No active arrival for flight ${payload.flightNumber}`);
      return;
    }
    const newEta = payload.estimatedArrival ? new Date(payload.estimatedArrival) : arrival.flightEta;
    await prisma11.externalUpdate.create({
      data: {
        arrivalId: arrival.id,
        source: "flight_tracking",
        updateType: payload.status,
        payload: JSON.stringify(payload),
        processedAt: /* @__PURE__ */ new Date()
      }
    });
    let newStatus = arrival.status;
    if (payload.status === "DELAYED" && newEta) {
      const delayMin = (newEta.getTime() - arrival.scheduledArrivalAt.getTime()) / 6e4;
      if (delayMin > 30) {
        await this.alertConcierge(arrival, `Vol retard\xE9 de ${Math.round(delayMin)} min`);
      }
    }
    if (payload.status === "LANDED") {
      newStatus = "EN_ROUTE";
      await prisma11.arrivalTask.create({
        data: {
          arrivalId: arrival.id,
          hotelId,
          team: "TRANSPORT",
          title: `Client a atterri \u2014 envoyer v\xE9hicule`,
          description: `Vol ${payload.flightNumber}${payload.gate ? ` \xB7 Porte ${payload.gate}` : ""}`,
          priority: 2,
          isCritical: true,
          status: "PENDING",
          blockedBy: "[]"
        }
      });
    }
    if (payload.status === "CANCELLED") {
      newStatus = "CANCELLED";
      await this.alertConcierge(arrival, `\u26D4 Vol ${payload.flightNumber} ANNUL\xC9`, "critical");
    }
    await prisma11.arrival.update({
      where: { id: arrival.id },
      data: { status: newStatus, flightEta: newEta, version: { increment: 1 } }
    });
    await auditService.append({
      eventType: "arrival.flight_update",
      tenantId: hotelId,
      actorId: "system",
      actorType: "system",
      resourceType: "Arrival",
      resourceId: arrival.id,
      action: `flight.${payload.status.toLowerCase()}`,
      metadata: { flightNumber: payload.flightNumber, newEta: newEta?.toISOString() }
    });
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, "arrival:flight-update", {
        arrivalId: arrival.id,
        flightStatus: payload.status,
        newEta,
        newStatus
      });
    } catch (_) {
    }
  }
  async processDriverUpdate(payload, hotelId) {
    const arrival = await prisma11.arrival.findFirst({
      where: { id: payload.arrivalId, hotelId }
    });
    if (!arrival) return;
    const driverEta = new Date(Date.now() + payload.etaMinutes * 6e4);
    await prisma11.externalUpdate.create({
      data: {
        arrivalId: arrival.id,
        source: "driver_api",
        updateType: "location",
        payload: JSON.stringify(payload),
        processedAt: /* @__PURE__ */ new Date()
      }
    });
    const newStatus = payload.status === "AT_LOCATION" ? "ARRIVED" : "EN_ROUTE";
    await prisma11.arrival.update({
      where: { id: arrival.id },
      data: { driverEta, status: newStatus, version: { increment: 1 } }
    });
    if (payload.status === "STUCK") {
      await this.alertConcierge(arrival, "Chauffeur bloqu\xE9 dans le trafic", "warning");
    }
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, "arrival:driver-update", {
        arrivalId: arrival.id,
        driverEta,
        etaMinutes: payload.etaMinutes,
        status: payload.status
      });
    } catch (_) {
    }
  }
  async alertConcierge(arrival, message, severity = "info") {
    if (arrival.hostUserId) {
      try {
        const { pushNotificationService: pushNotificationService2 } = await Promise.resolve().then(() => (init_push_notification_service(), push_notification_service_exports));
        await pushNotificationService2.sendToUser(arrival.hostUserId, {
          title: `${severity === "critical" ? "\u{1F6A8}" : "\u26A0\uFE0F"} ${arrival.guestName}`,
          body: message,
          url: `/arrivals/${arrival.id}`,
          tag: "arrival-alert",
          data: { arrivalId: arrival.id, severity }
        });
      } catch (_) {
      }
    }
    await auditService.append({
      eventType: "arrival.alert",
      tenantId: arrival.hotelId,
      actorId: "system",
      actorType: "system",
      resourceType: "Arrival",
      resourceId: arrival.id,
      action: "arrival.alert",
      metadata: { message, severity }
    });
  }
};
var externalSyncService = new ExternalSyncService();

// src/server/routes/arrivals.routes.ts
var router5 = (0, import_express5.Router)();
var prisma12 = new import_client12.PrismaClient();
function getAuth(req) {
  const auth = req.auth;
  return {
    hotelId: auth?.hotelId || auth?.tenantId || "hotel-dev",
    actorId: auth?.uid || auth?.sub || "system",
    role: (auth?.role || "hotel").toLowerCase()
  };
}
var ALLOWED_TRANSITIONS2 = {
  SCHEDULED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PREPARATION", "CANCELLED"],
  IN_PREPARATION: ["DRIVER_EN_ROUTE", "ENROUTE", "CANCELLED"],
  DRIVER_EN_ROUTE: ["ENROUTE", "AT_HOTEL", "CANCELLED"],
  ENROUTE: ["LANDED", "AT_HOTEL", "NO_SHOW", "CANCELLED"],
  LANDED: ["AT_HOTEL", "CANCELLED"],
  AT_HOTEL: ["CHECKED_IN"],
  CHECKED_IN: [],
  NO_SHOW: [],
  CANCELLED: []
};
router5.get("/", async (req, res) => {
  try {
    const { hotelId } = getAuth(req);
    const { status, vipLevel, upcoming, from, to } = req.query;
    const where = { hotelId };
    if (status) {
      where.status = status.includes(",") ? { in: status.split(",") } : status;
    } else if (upcoming === "true") {
      where.scheduledArrivalAt = { gte: /* @__PURE__ */ new Date() };
      where.status = {
        in: ["SCHEDULED", "CONFIRMED", "IN_PREPARATION", "DRIVER_EN_ROUTE", "ENROUTE", "LANDED"]
      };
    }
    if (vipLevel) where.vipLevel = vipLevel;
    if (from || to) {
      where.scheduledArrivalAt = {};
      if (from) where.scheduledArrivalAt.gte = new Date(from);
      if (to) where.scheduledArrivalAt.lte = new Date(to);
    }
    const arrivals = await prisma12.arrival.findMany({
      where,
      include: {
        room: { select: { number: true, type: true } },
        host: { select: { displayName: true } },
        tasks: {
          select: { id: true, team: true, status: true, isCritical: true, dueAt: true }
        }
      },
      orderBy: { scheduledArrivalAt: "asc" },
      take: 100
    });
    res.json({ success: true, data: arrivals });
  } catch (e) {
    console.error("[arrivals] GET /", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router5.get("/:id", async (req, res) => {
  try {
    const { hotelId } = getAuth(req);
    const arrival = await prisma12.arrival.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: {
        room: true,
        host: { select: { displayName: true, email: true } },
        createdBy: { select: { displayName: true } },
        tasks: {
          orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
          include: {
            assignedUser: { select: { id: true, displayName: true } }
          }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { actor: { select: { displayName: true } } }
        },
        externalUpdates: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });
    if (!arrival) {
      return res.status(404).json({ success: false, error: { message: "Arriv\xE9e introuvable" } });
    }
    res.json({ success: true, data: arrival });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router5.post("/", async (req, res) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const {
      guestName,
      guestEmail,
      guestPhone,
      guestLanguage,
      vipLevel,
      transportMode,
      scheduledArrivalAt,
      scheduledDepartureAt,
      flightNumber,
      flightOrigin,
      roomId,
      suiteReadyBy,
      suiteNotes,
      welcomeAmenity,
      dietaryNotes,
      specialRequests,
      meetingPoint,
      hostUserId,
      estimatedRevenueCents,
      externalRef,
      confirmationNumber
    } = req.body;
    if (!guestName || !transportMode || !scheduledArrivalAt || !suiteReadyBy) {
      return res.status(400).json({
        success: false,
        error: { message: "Champs requis manquants : guestName, transportMode, scheduledArrivalAt, suiteReadyBy" }
      });
    }
    if (roomId) {
      const room = await prisma12.room.findFirst({ where: { id: roomId } });
      if (!room) {
        return res.status(400).json({ success: false, error: { message: "Suite introuvable" } });
      }
    }
    const { arrival, taskCount } = await arrivalPlannerService.createArrivalWithTasks(hotelId, {
      guestName,
      guestEmail,
      guestPhone,
      guestLanguage: guestLanguage || "fr",
      vipLevel: vipLevel || "CLASSIC",
      transportMode,
      scheduledArrivalAt: new Date(scheduledArrivalAt),
      scheduledDepartureAt: scheduledDepartureAt ? new Date(scheduledDepartureAt) : void 0,
      flightNumber,
      flightOrigin,
      roomId,
      suiteReadyBy: new Date(suiteReadyBy),
      suiteNotes,
      welcomeAmenity,
      dietaryNotes,
      specialRequests,
      meetingPoint,
      hostUserId,
      estimatedRevenueCents,
      externalRef,
      confirmationNumber,
      createdById: actorId
    });
    await auditService.append({
      eventType: "arrival.create",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "Arrival",
      resourceId: arrival.id,
      action: "arrival.create",
      metadata: { guestName, vipLevel, transportMode, taskCount },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    try {
      getRealtimeServer().emitToHotel(hotelId, "arrival:new", { arrival, taskCount });
    } catch (_) {
    }
    if (hostUserId) {
      await pushNotificationService.sendToUser(hostUserId, {
        title: `\u{1F31F} Nouvelle arriv\xE9e ${vipLevel || "CLASSIC"}`,
        body: `${guestName} \u2014 ${new Date(scheduledArrivalAt).toLocaleString("fr-FR")}`,
        url: `/arrivals/${arrival.id}`,
        tag: "new-arrival"
      }).catch(() => {
      });
    }
    eventBus.publish("logistics:arrival", { hotelId, arrivalId: arrival.id, guestName, vipLevel });
    res.status(201).json({ success: true, data: { arrival, taskCount } });
  } catch (e) {
    console.error("[arrivals] POST /", e);
    res.status(500).json({ success: false, error: { message: e.message || "Erreur serveur" } });
  }
});
router5.patch("/:id/transition", async (req, res) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const { toStatus, reason, version, driverInfo, actualArrivalAt } = req.body;
    if (!toStatus || typeof version !== "number") {
      return res.status(400).json({ success: false, error: { message: "`toStatus` et `version` requis" } });
    }
    const arrival = await prisma12.arrival.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: { tasks: true }
    });
    if (!arrival) return res.status(404).json({ success: false, error: { message: "Arriv\xE9e introuvable" } });
    if (arrival.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: "Conflit de version", code: "VERSION_CONFLICT", currentVersion: arrival.version }
      });
    }
    const allowed = ALLOWED_TRANSITIONS2[arrival.status] || [];
    if (!allowed.includes(toStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Transition ${arrival.status} \u2192 ${toStatus} non autoris\xE9e`,
          code: "INVALID_TRANSITION",
          allowed
        }
      });
    }
    if (toStatus === "CHECKED_IN") {
      const criticalPending = arrival.tasks.filter(
        (t) => t.isCritical && !["COMPLETED", "CANCELLED"].includes(t.status)
      );
      if (criticalPending.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "T\xE2ches critiques non termin\xE9es",
            code: "CRITICAL_TASKS_PENDING",
            tasks: criticalPending.map((t) => t.title)
          }
        });
      }
    }
    const updateData = {
      status: toStatus,
      previousStatus: arrival.status,
      version: { increment: 1 }
    };
    if (actualArrivalAt) updateData.actualArrivalAt = new Date(actualArrivalAt);
    if (driverInfo) {
      updateData.driverName = driverInfo.driverName;
      updateData.driverPhone = driverInfo.driverPhone;
      updateData.driverVehicle = driverInfo.driverVehicle;
      updateData.driverAssignedAt = /* @__PURE__ */ new Date();
      if (driverInfo.driverEta) updateData.driverEta = new Date(driverInfo.driverEta);
    }
    let cancelledTaskIds = [];
    if (toStatus === "CANCELLED") {
      const toCancel = arrival.tasks.filter((t) => !["COMPLETED", "CANCELLED", "FAILED"].includes(t.status));
      cancelledTaskIds = toCancel.map((t) => t.id);
    }
    const updated = await prisma12.$transaction(async (tx) => {
      const u = await tx.arrival.update({
        where: { id: arrival.id },
        data: updateData,
        include: { room: true, tasks: true }
      });
      await tx.arrivalStatusEvent.create({
        data: {
          arrivalId: arrival.id,
          fromStatus: arrival.status,
          toStatus,
          actorId,
          actorType: "user",
          reason: reason || null
        }
      });
      for (const taskId of cancelledTaskIds) {
        await tx.arrivalTask.update({ where: { id: taskId }, data: { status: "CANCELLED" } });
      }
      return u;
    });
    await auditService.append({
      eventType: "arrival.transition",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "Arrival",
      resourceId: arrival.id,
      action: `arrival.${arrival.status.toLowerCase()}.to.${toStatus.toLowerCase()}`,
      metadata: { fromStatus: arrival.status, toStatus, guestName: arrival.guestName },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    try {
      getRealtimeServer().emitToHotel(hotelId, "arrival:updated", updated);
      if (toStatus === "AT_HOTEL" && arrival.hostUserId) {
        await pushNotificationService.sendToUser(arrival.hostUserId, {
          title: `\u{1F389} ${arrival.guestName} est arriv\xE9(e)`,
          body: `Niveau ${arrival.vipLevel} \u2014 accueil requis imm\xE9diatement`,
          url: `/arrivals/${arrival.id}`,
          tag: "arrival-on-site"
        });
      }
    } catch (_) {
    }
    if (toStatus === "DRIVER_EN_ROUTE") {
      eventBus.publish("logistics:driver_status", {
        hotelId,
        roomId: arrival.roomId,
        status: "APPROACHING_HOTEL"
      });
    }
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("[arrivals] transition error", e);
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router5.post("/:arrivalId/tasks", async (req, res) => {
  try {
    const { hotelId } = getAuth(req);
    const { team, title, description, dueAt, assignedUserId, priority, isCritical } = req.body;
    const arrival = await prisma12.arrival.findFirst({ where: { id: String(req.params.arrivalId), hotelId: String(hotelId) } });
    if (!arrival) return res.status(404).json({ success: false, error: { message: "Arriv\xE9e introuvable" } });
    const task = await prisma12.arrivalTask.create({
      data: {
        arrivalId: arrival.id,
        hotelId,
        team: team || "RECEPTION",
        title,
        description: description || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        assignedUserId: assignedUserId || null,
        priority: priority ?? 0,
        isCritical: isCritical ?? false,
        status: "PENDING",
        blockedBy: "[]"
      }
    });
    if (task.assignedUserId) {
      await pushNotificationService.sendToUser(task.assignedUserId, {
        title: `\u{1F4CB} Nouvelle t\xE2che : ${task.title}`,
        body: `Arriv\xE9e ${arrival.guestName} \xB7 \xC9quipe ${task.team}`,
        url: `/arrivals/${arrival.id}`,
        tag: "new-task"
      }).catch(() => {
      });
    }
    try {
      getRealtimeServer().emitToHotel(hotelId, "task:new", { task, arrivalId: arrival.id });
    } catch (_) {
    }
    res.status(201).json({ success: true, data: task });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router5.patch("/tasks/:taskId", async (req, res) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const { status, assignedUserId, version, notes, evidenceUrl } = req.body;
    const task = await prisma12.arrivalTask.findFirst({
      where: { id: String(req.params.taskId), hotelId: String(hotelId) }
    });
    if (!task) return res.status(404).json({ success: false, error: { message: "T\xE2che introuvable" } });
    if (typeof version === "number" && task.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: "Conflit de version", code: "VERSION_CONFLICT" }
      });
    }
    if (status === "IN_PROGRESS" || status === "COMPLETED") {
      const blockedByIds = JSON.parse(task.blockedBy || "[]");
      if (blockedByIds.length > 0) {
        const blockers = await prisma12.arrivalTask.findMany({
          where: { id: { in: blockedByIds } },
          select: { status: true, title: true }
        });
        const stillBlocking = blockers.filter((b) => !["COMPLETED", "CANCELLED"].includes(b.status));
        if (stillBlocking.length > 0) {
          return res.status(400).json({
            success: false,
            error: {
              message: "T\xE2che bloqu\xE9e",
              code: "TASK_BLOCKED",
              blockingTasks: stillBlocking.map((b) => b.title)
            }
          });
        }
      }
    }
    const now = /* @__PURE__ */ new Date();
    const updateData = { version: { increment: 1 } };
    if (status) {
      updateData.status = status;
      if (status === "IN_PROGRESS" && !task.startedAt) updateData.startedAt = now;
      if (status === "COMPLETED" && !task.completedAt) {
        updateData.completedAt = now;
        updateData.completedById = actorId;
        if (notes) updateData.completionNotes = notes;
      }
    }
    if (assignedUserId !== void 0) updateData.assignedUserId = assignedUserId || null;
    if (evidenceUrl) updateData.evidenceUrl = evidenceUrl;
    const updated = await prisma12.$transaction(async (tx) => {
      const u = await tx.arrivalTask.update({
        where: { id: task.id },
        data: updateData,
        include: { assignedUser: { select: { displayName: true } } }
      });
      await tx.taskEvent.create({
        data: {
          taskId: task.id,
          fromStatus: task.status,
          toStatus: status || task.status,
          actorId,
          notes: notes || null
        }
      });
      return u;
    });
    await auditService.append({
      eventType: "task.update",
      tenantId: hotelId,
      actorId,
      actorType: "user",
      resourceType: "ArrivalTask",
      resourceId: task.id,
      action: `task.${(status || task.status).toLowerCase()}`,
      metadata: { arrivalId: task.arrivalId, team: task.team, title: task.title },
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null
    });
    try {
      getRealtimeServer().emitToHotel(hotelId, "task:updated", { task: updated, arrivalId: task.arrivalId });
      if (status === "COMPLETED" && task.isCritical) {
        getRealtimeServer().emitToHotel(hotelId, "task:critical:done", {
          task: updated,
          arrivalId: task.arrivalId
        });
      }
    } catch (_) {
    }
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: "Erreur serveur" } });
  }
});
router5.post("/webhook/flight-update", async (req, res) => {
  const sig = req.headers["x-webhook-signature"];
  if (process.env.FLIGHT_WEBHOOK_SECRET && sig !== process.env.FLIGHT_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, error: { message: "Invalid signature" } });
  }
  const { hotelId } = getAuth(req);
  await externalSyncService.processFlightUpdate(req.body, hotelId);
  res.json({ success: true });
});
router5.post("/webhook/driver-location", async (req, res) => {
  const sig = req.headers["x-webhook-signature"];
  if (process.env.DRIVER_WEBHOOK_SECRET && sig !== process.env.DRIVER_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, error: { message: "Invalid signature" } });
  }
  const { hotelId } = getAuth(req);
  await externalSyncService.processDriverUpdate(req.body, hotelId);
  res.json({ success: true });
});
var arrivals_routes_default = router5;

// src/server/domains/auth/auth.routes.ts
var import_express6 = require("express");
var import_zod = require("zod");
init_auth_service();
var router6 = (0, import_express6.Router)();
var registerSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(12, "Mot de passe : 12 caract\xE8res minimum"),
  displayName: import_zod.z.string().min(2),
  hotelName: import_zod.z.string().min(2),
  phone: import_zod.z.string().optional()
});
router6.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Donn\xE9es invalides",
        details: parsed.error.flatten()
      }
    });
  }
  try {
    const { accessToken, refreshToken, auth } = await authService.register(parsed.data);
    authService.setAuthCookies(res, accessToken, refreshToken);
    await auditService.append({
      eventType: "auth.register",
      tenantId: auth.activeHotel?.id,
      actorId: auth.user.id,
      actorType: "user",
      action: "user.register",
      metadata: { email: auth.user.email, hotelName: auth.activeHotel?.name },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json({ success: true, data: auth });
  } catch (e) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(1),
  totpCode: import_zod.z.string().optional()
});
router6.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Donn\xE9es invalides" } });
  }
  try {
    const { accessToken, refreshToken, auth } = await authService.login({
      ...parsed.data,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip
    });
    authService.setAuthCookies(res, accessToken, refreshToken);
    await auditService.append({
      eventType: "auth.login",
      tenantId: auth.activeHotel?.id,
      actorId: auth.user.id,
      actorType: "user",
      action: "user.login",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true, data: auth });
  } catch (e) {
    if (e.message === "2FA_REQUIRED") {
      return res.json({ success: true, data: { requiresTotp: true } });
    }
    res.status(401).json({ success: false, error: { message: e.message } });
  }
});
router6.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.zafir_refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: { message: "No refresh token" } });
  }
  try {
    const tokens = await authService.refresh(refreshToken);
    authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({ success: true });
  } catch (e) {
    authService.clearAuthCookies(res);
    res.status(401).json({ success: false, error: { message: e.message } });
  }
});
router6.post("/logout", requireAuth, async (req, res) => {
  await authService.logout(req.auth.sessionId);
  authService.clearAuthCookies(res);
  res.json({ success: true });
});
router6.get("/me", requireAuth, async (req, res) => {
  const auth = await authService.buildAuthResult(
    req.auth.sub,
    req.auth.sessionId,
    req.auth.activeHotelId
  );
  res.json({ success: true, data: auth });
});
router6.post("/team/hotels/:hotelId/switch", requireAuth, async (req, res) => {
  try {
    const { accessToken } = await authService.switchHotel(
      req.auth.sub,
      req.params.hotelId,
      req.auth.sessionId
    );
    res.cookie("zafir_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1e3
    });
    const auth = await authService.buildAuthResult(
      req.auth.sub,
      req.auth.sessionId,
      req.params.hotelId
    );
    res.json({ success: true, data: auth });
  } catch (e) {
    res.status(403).json({ success: false, error: { message: e.message } });
  }
});
var inviteSchema = import_zod.z.object({
  hotelId: import_zod.z.string(),
  email: import_zod.z.string().email(),
  proposedRole: import_zod.z.enum([
    "OWNER",
    "MANAGER",
    "SOMMELIER",
    "CONCIERGE",
    "RECEPTION",
    "HOUSEKEEPING",
    "KITCHEN",
    "STAFF",
    "VIEWER"
  ]),
  message: import_zod.z.string().optional()
});
router6.post("/team/invitations", requireAuth, async (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Donn\xE9es invalides" } });
  }
  try {
    const result = await authService.createInvitation({
      ...parsed.data,
      invitedById: req.auth.sub
    });
    await auditService.append({
      eventType: "team.invite",
      tenantId: parsed.data.hotelId,
      actorId: req.auth.sub,
      actorType: "user",
      action: "invitation.create",
      metadata: {
        email: parsed.data.email,
        role: parsed.data.proposedRole
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});
var acceptSchema = import_zod.z.object({
  password: import_zod.z.string().min(12),
  displayName: import_zod.z.string().min(2).optional()
});
router6.post("/invitation/:token/accept", async (req, res) => {
  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Donn\xE9es invalides" } });
  }
  try {
    const { accessToken, refreshToken, auth } = await authService.acceptInvitation({
      token: req.params.token,
      password: parsed.data.password,
      displayName: parsed.data.displayName
    });
    authService.setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: auth });
  } catch (e) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});
var auth_routes_default = router6;

// src/server/routes/team.routes.ts
var import_express7 = require("express");
var import_zod2 = require("zod");
var import_client13 = require("@prisma/client");
var router7 = (0, import_express7.Router)();
var prisma13 = new import_client13.PrismaClient();
router7.use(requireAuth);
router7.get("/members", async (req, res) => {
  const { hotelId } = req.query;
  if (!hotelId) {
    return res.status(400).json({
      success: false,
      error: { message: "hotelId requis" }
    });
  }
  const membership = await prisma13.hotelMembership.findFirst({
    where: {
      hotelId,
      userId: req.auth.sub,
      isActive: true,
      removedAt: null
    }
  });
  if (!membership) {
    return res.status(403).json({
      success: false,
      error: { message: "Acc\xE8s refus\xE9" }
    });
  }
  const members = await prisma13.hotelMembership.findMany({
    where: {
      hotelId,
      isActive: true
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          lastLoginAt: true
        }
      }
    },
    orderBy: [
      { role: "asc" },
      // OWNER en premier alphabétiquement
      { joinedAt: "asc" }
    ]
  });
  res.json({ success: true, data: members });
});
var updateMemberSchema = import_zod2.z.object({
  role: import_zod2.z.enum([
    "OWNER",
    "MANAGER",
    "SOMMELIER",
    "CONCIERGE",
    "RECEPTION",
    "HOUSEKEEPING",
    "KITCHEN",
    "STAFF",
    "VIEWER"
  ]).optional(),
  permissions: import_zod2.z.array(import_zod2.z.string()).optional()
});
router7.patch(
  "/members/:id",
  requirePermission("members.invite"),
  async (req, res) => {
    const parsed = updateMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: "Donn\xE9es invalides" }
      });
    }
    const targetMembership = await prisma13.hotelMembership.findUnique({
      where: { id: req.params.id }
    });
    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        error: { message: "Membre introuvable" }
      });
    }
    const actorMembership = await prisma13.hotelMembership.findFirst({
      where: {
        hotelId: targetMembership.hotelId,
        userId: req.auth.sub,
        isActive: true
      }
    });
    if (!actorMembership) {
      return res.status(403).json({
        success: false,
        error: { message: "Acc\xE8s refus\xE9" }
      });
    }
    if (parsed.data.role === "OWNER" && actorMembership.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        error: { message: "Seul un OWNER peut promouvoir au rang OWNER" }
      });
    }
    if (targetMembership.userId === req.auth.sub && parsed.data.role && parsed.data.role !== "OWNER" && actorMembership.role === "OWNER") {
      const otherOwners = await prisma13.hotelMembership.count({
        where: {
          hotelId: targetMembership.hotelId,
          role: "OWNER",
          isActive: true,
          id: { not: targetMembership.id }
        }
      });
      if (otherOwners === 0) {
        return res.status(400).json({
          success: false,
          error: { message: "Impossible : vous \xEAtes le seul OWNER" }
        });
      }
    }
    const updated = await prisma13.hotelMembership.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data.role && { role: parsed.data.role },
        ...parsed.data.permissions && { permissions: parsed.data.permissions ? JSON.stringify(parsed.data.permissions) : void 0 }
      },
      include: {
        user: { select: { email: true, displayName: true } }
      }
    });
    await auditService.append({
      eventType: "team.member.update",
      tenantId: targetMembership.hotelId,
      actorId: req.auth.sub,
      actorType: "user",
      resourceType: "HotelMembership",
      resourceId: targetMembership.id,
      action: "member.update",
      metadata: {
        targetUserId: targetMembership.userId,
        changes: parsed.data
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true, data: updated });
  }
);
router7.delete(
  "/members/:id",
  requirePermission("members.remove"),
  async (req, res) => {
    const targetMembership = await prisma13.hotelMembership.findUnique({
      where: { id: req.params.id }
    });
    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        error: { message: "Membre introuvable" }
      });
    }
    const actorMembership = await prisma13.hotelMembership.findFirst({
      where: {
        hotelId: targetMembership.hotelId,
        userId: req.auth.sub,
        isActive: true
      }
    });
    if (!actorMembership) {
      return res.status(403).json({
        success: false,
        error: { message: "Acc\xE8s refus\xE9" }
      });
    }
    if (targetMembership.role === "OWNER" && actorMembership.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        error: { message: "Seul un OWNER peut retirer un OWNER" }
      });
    }
    if (targetMembership.userId === req.auth.sub && targetMembership.role === "OWNER") {
      const otherOwners = await prisma13.hotelMembership.count({
        where: {
          hotelId: targetMembership.hotelId,
          role: "OWNER",
          isActive: true,
          id: { not: targetMembership.id }
        }
      });
      if (otherOwners === 0) {
        return res.status(400).json({
          success: false,
          error: { message: "Impossible : vous \xEAtes le seul OWNER" }
        });
      }
    }
    await prisma13.hotelMembership.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        removedAt: /* @__PURE__ */ new Date()
      }
    });
    await prisma13.userSession.updateMany({
      where: {
        userId: targetMembership.userId,
        activeHotelId: targetMembership.hotelId,
        revokedAt: null
      },
      data: { revokedAt: /* @__PURE__ */ new Date() }
    });
    await auditService.append({
      eventType: "team.member.remove",
      tenantId: targetMembership.hotelId,
      actorId: req.auth.sub,
      actorType: "user",
      resourceType: "HotelMembership",
      resourceId: targetMembership.id,
      action: "member.remove",
      metadata: { targetUserId: targetMembership.userId },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  }
);
router7.get("/invitations", async (req, res) => {
  const { hotelId } = req.query;
  if (!hotelId) {
    return res.status(400).json({
      success: false,
      error: { message: "hotelId requis" }
    });
  }
  const membership = await prisma13.hotelMembership.findFirst({
    where: {
      hotelId,
      userId: req.auth.sub,
      isActive: true
    }
  });
  if (!membership) {
    return res.status(403).json({
      success: false,
      error: { message: "Acc\xE8s refus\xE9" }
    });
  }
  const invitations = await prisma13.hotelInvitation.findMany({
    where: {
      hotelId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: /* @__PURE__ */ new Date() }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: invitations });
});
router7.delete(
  "/invitations/:id",
  requirePermission("members.invite"),
  async (req, res) => {
    const invitation = await prisma13.hotelInvitation.findUnique({
      where: { id: req.params.id }
    });
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: { message: "Invitation introuvable" }
      });
    }
    if (invitation.acceptedAt || invitation.revokedAt) {
      return res.status(400).json({
        success: false,
        error: { message: "Cette invitation n'est plus valide" }
      });
    }
    const actorMembership = await prisma13.hotelMembership.findFirst({
      where: {
        hotelId: invitation.hotelId,
        userId: req.auth.sub,
        isActive: true
      }
    });
    if (!actorMembership) {
      return res.status(403).json({
        success: false,
        error: { message: "Acc\xE8s refus\xE9" }
      });
    }
    await prisma13.hotelInvitation.update({
      where: { id: req.params.id },
      data: { revokedAt: /* @__PURE__ */ new Date() }
    });
    await auditService.append({
      eventType: "team.invitation.revoke",
      tenantId: invitation.hotelId,
      actorId: req.auth.sub,
      actorType: "user",
      resourceType: "HotelInvitation",
      resourceId: invitation.id,
      action: "invitation.revoke",
      metadata: { email: invitation.email },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  }
);
var team_routes_default = router7;

// server.ts
var import_cors = __toESM(require("cors"), 1);

// src/server/config.ts
var import_config = require("dotenv/config");
function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
  return value;
}
var config = {
  isProd: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    inviteSecret: process.env.JWT_INVITE_SECRET || "dev-invite-secret-change-me"
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN || "",
    secure: process.env.COOKIE_SECURE === "true"
  },
  smtp: {
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "1025"),
    // MailHog par défaut en dev
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@ziffir.local"
  },
  database: {
    url: required("DATABASE_URL")
  }
};

// server.ts
async function startServer() {
  const app2 = (0, import_express8.default)();
  const httpServer = (0, import_http.createServer)(app2);
  const PORT = 3e3;
  app2.use((0, import_cors.default)({
    origin: config.frontendUrl,
    credentials: true
    // ⚠️ indispensable pour les cookies
  }));
  app2.use(import_express8.default.json());
  app2.use((0, import_cookie_parser.default)(config.cookies.domain));
  app2.use("/api/auth", auth_routes_default);
  app2.use("/api/team", team_routes_default);
  app2.use("/api", requireAuth);
  app2.use("/api", trackTokens(1));
  app2.use("/api/suite-controls", suite_controls_routes_default);
  app2.use("/api/room-orders", room_orders_routes_default);
  app2.use("/api/push", push_routes_default);
  app2.use("/api/tokens", api_manager_routes_default);
  app2.use("/api/arrivals", arrivals_routes_default);
  app2.get("/api/state", async (req, res) => {
    try {
      const state = await microserviceService.getAllStates(req.user?.tenantId || "default");
      res.json(state);
    } catch (err) {
      res.status(500).json({ error: err.message || "Error fetching state" });
    }
  });
  app2.get("/api/logistics/arrivals", async (req, res) => {
    try {
      const data = await microserviceService.getArrivals(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/logistics/arrivals", async (req, res) => {
    try {
      await microserviceService.saveArrivals(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/logistics/fleet", async (req, res) => {
    try {
      const data = await microserviceService.getFleet(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/logistics/fleet", async (req, res) => {
    try {
      await microserviceService.saveFleet(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/logistics/heatmap", async (req, res) => {
    try {
      const data = await microserviceService.getHeatmap(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/logistics/heatmap", async (req, res) => {
    try {
      await microserviceService.saveHeatmap(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/logistics/yachting", async (req, res) => {
    try {
      const data = await microserviceService.getYachting(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/logistics/yachting", async (req, res) => {
    try {
      await microserviceService.saveYachting(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/hospitality/room-service", async (req, res) => {
    try {
      const data = await microserviceService.getRoomService(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/hospitality/room-service", async (req, res) => {
    try {
      await microserviceService.saveRoomService(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/hospitality/suite-controls", async (req, res) => {
    try {
      const data = await microserviceService.getSuiteControls(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/hospitality/suite-controls", async (req, res) => {
    try {
      await microserviceService.saveSuiteControls(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/hospitality/suite-portal", async (req, res) => {
    try {
      const data = await microserviceService.getSuitePortal(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/hospitality/suite-portal", async (req, res) => {
    try {
      await microserviceService.saveSuitePortal(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/hospitality/wellness", async (req, res) => {
    try {
      const data = await microserviceService.getWellness(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/hospitality/wellness", async (req, res) => {
    try {
      await microserviceService.saveWellness(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/wine-cellar", async (req, res) => {
    try {
      const data = await microserviceService.getWineCellar(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/wine-cellar", async (req, res) => {
    try {
      await microserviceService.saveWineCellar(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/memberships", async (req, res) => {
    try {
      const data = await microserviceService.getMemberships(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/memberships", async (req, res) => {
    try {
      await microserviceService.saveMemberships(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/metal-cards", async (req, res) => {
    try {
      const data = await microserviceService.getMetalCards(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/metal-cards", async (req, res) => {
    try {
      await microserviceService.saveMetalCards(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/pricing", async (req, res) => {
    try {
      const data = await microserviceService.getPricing(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/pricing", async (req, res) => {
    try {
      await microserviceService.savePricing(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/cms", async (req, res) => {
    try {
      const data = await microserviceService.getCMS(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/cms", async (req, res) => {
    try {
      await microserviceService.saveCMS(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/business", async (req, res) => {
    try {
      const data = await microserviceService.getBusiness(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/business", async (req, res) => {
    try {
      await microserviceService.saveBusiness(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/testimonials", async (req, res) => {
    try {
      const data = await microserviceService.getTestimonials(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/testimonials", async (req, res) => {
    try {
      await microserviceService.saveTestimonials(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/vault", async (req, res) => {
    try {
      const data = await microserviceService.getVault(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/vault", async (req, res) => {
    try {
      await microserviceService.saveVault(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/maintenance", async (req, res) => {
    try {
      const data = await microserviceService.getMaintenance(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/maintenance", async (req, res) => {
    try {
      await microserviceService.saveMaintenance(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/ledger", async (req, res) => {
    try {
      const data = await microserviceService.getLedger(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/ledger", async (req, res) => {
    try {
      await microserviceService.saveLedger(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/commerce/channel-sync", async (req, res) => {
    try {
      const data = await microserviceService.getChannelSync(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/commerce/channel-sync", async (req, res) => {
    try {
      await microserviceService.saveChannelSync(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/predictive", async (req, res) => {
    try {
      const data = await microserviceService.getPredictive(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/predictive", async (req, res) => {
    try {
      await microserviceService.savePredictive(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/cyber", async (req, res) => {
    try {
      const data = await microserviceService.getCyber(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/cyber", async (req, res) => {
    try {
      await microserviceService.saveCyber(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/energy", async (req, res) => {
    try {
      const data = await microserviceService.getEnergy(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/energy", async (req, res) => {
    try {
      await microserviceService.saveEnergy(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/security-tech/emergency", async (req, res) => {
    try {
      const data = await microserviceService.getEmergency(req.user?.tenantId || "default");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/security-tech/emergency", async (req, res) => {
    try {
      await microserviceService.saveEmergency(req.user?.tenantId || "default", req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app2.use(import_express8.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  initRealtimeServer(httpServer);
  orchestrator.init();
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Zaphir Full-Stack Hub running on port ${PORT}`);
    console.log(`\u26A1 Socket.IO realtime server active`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
