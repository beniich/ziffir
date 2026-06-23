import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../../../../../types';

const JWT_SECRET  = process.env.JWT_SECRET  || 'ZAPHIR_SECURE_COSMIC_KEY_9812A';
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET || 'ZAPHIR_REFRESH_SECRET_8821B';
const ACCESS_TTL  = '8h';
const REFRESH_TTL = '30d';

// ── Type partagé entre front et back ─────────────────────────────────────────
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  hotelId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    hotelId?: string | null;
    isActive: boolean;
    createdAt: string;
  };
  tokens: AuthTokens;
}

// ── Mock DB en mémoire (à remplacer par Prisma) ───────────────────────────────
const mockUserDB: Record<string, any> = {
  'admin@zaphir-admin.com': {
    id: 'usr-admin-001',
    email: 'admin@zaphir-admin.com',
    username: 'SuperAdmin',
    passwordHash: '',  // set via hashPassword au démarrage
    role: 'SUPER_ADMIN' as UserRole,
    hotelId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
};

// Stockage en mémoire des refresh tokens révoqués
const revokedTokens = new Set<string>();

export class AuthService {

  // ── Hashing ───────────────────────────────────────────────────────────────
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ── JWT ───────────────────────────────────────────────────────────────────
  static generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken  = jwt.sign(payload, JWT_SECRET,  { expiresIn: ACCESS_TTL });
    const refreshToken = jwt.sign({ userId: payload.userId }, JWT_REFRESH, { expiresIn: REFRESH_TTL });
    return { accessToken, refreshToken };
  }

  /** @deprecated use generateTokens */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw new Error('Token JWT invalide ou expiré.');
    }
  }

  // ── Connexion email/password ───────────────────────────────────────────────
  static async loginWithPassword(email: string, password: string): Promise<AuthResult> {
    const user = Object.values(mockUserDB).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) throw new Error('Identifiants incorrects.');

    // Si pas encore de hash (premier démarrage), créer un hash par défaut
    if (!user.passwordHash) {
      user.passwordHash = await AuthService.hashPassword('Zaphir2026!');
    }

    const valid = await AuthService.verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Mot de passe incorrect.');
    if (!user.isActive) throw new Error('Compte désactivé.');

    const tokens = AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId,
    });

    return { user: { ...user, passwordHash: undefined }, tokens };
  }

  // ── Vérification idToken Firebase (JWT decode simplifié — firebase-admin en prod) ──
  static async verifyFirebaseToken(idToken: string): Promise<any> {
    try {
      // En dev : on décode sans vérifier la signature (utiliser firebase-admin en production)
      const decoded = jwt.decode(idToken);
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Token Firebase invalide');
      }
      return decoded;
    } catch {
      throw new Error('Impossible de décoder le token Firebase.');
    }
  }

  // ── Création / mise à jour utilisateur Firebase ───────────────────────────
  static async createOrUpdateFirebaseUser(data: {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
  }): Promise<AuthResult> {
    const existing = mockUserDB[data.email];
    const user = existing || {
      id: `usr-firebase-${data.uid.slice(0, 8)}`,
      email: data.email,
      username: data.displayName,
      passwordHash: null,
      role: data.role,
      hotelId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (!existing) {
      mockUserDB[data.email] = user;
    } else if (!existing.role || existing.role === 'VISITOR') {
      existing.role = data.role;
    }

    const tokens = AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId,
    });

    return { user: { ...user, passwordHash: undefined }, tokens };
  }

  // ── Register ──────────────────────────────────────────────────────────────
  static async register(data: {
    email: string;
    username: string;
    password: string;
    role: UserRole;
  }): Promise<AuthResult> {
    if (mockUserDB[data.email]) throw new Error('Email déjà utilisé.');

    const passwordHash = await AuthService.hashPassword(data.password);
    const user = {
      id: `usr-${Date.now()}`,
      email: data.email,
      username: data.username,
      passwordHash,
      role: data.role,
      hotelId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockUserDB[data.email] = user;

    const tokens = AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: { ...user, passwordHash: undefined }, tokens };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────
  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (revokedTokens.has(refreshToken)) throw new Error('Token révoqué.');

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH);
    } catch {
      throw new Error('Refresh token invalide.');
    }

    const user = Object.values(mockUserDB).find((u) => u.id === payload.userId);
    if (!user || !user.isActive) throw new Error('Utilisateur introuvable.');

    return AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId,
    });
  }

  // ── Révocation ────────────────────────────────────────────────────────────
  static async revokeRefreshToken(userId: string): Promise<void> {
    // En production : invalider en base. Ici on marque l'userId comme révoqué.
    revokedTokens.add(userId);
  }
}
