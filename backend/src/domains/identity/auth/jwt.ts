import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export type JwtPayload = {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CLIENT';
  hotelId?: string; // Gardé pour compatibilité temporaire
  activeHotelId?: string;
  sessionId?: string;
};

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: '12h', // ISO 27001 compliance
    issuer: 'sapphire-backend',
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'sapphire-backend',
  });
  if (typeof decoded === 'string') {
    throw new Error('Token invalide');
  }
  return decoded as JwtPayload;
}
