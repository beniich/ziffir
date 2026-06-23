import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ZAPHIR_SECURE_COSMIC_KEY_9812A';
const JWT_EXPIRES_IN = '8h';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'OPERATOR' | 'MANAGER';
}

export class AuthService {
  /**
   * Securely hash a raw password with salt rounds
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // High-grade security hashing rounds
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password input against stored password hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Sign a JSON Web Token representing session clearance credentials
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Decode & decrypt a JSON Web Token, validating cryptographic integrity
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      throw new Error('Cryptographic token signature verification failed.');
    }
  }
}
