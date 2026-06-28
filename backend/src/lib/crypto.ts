import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALG = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const SALT = env.PII_ENCRYPTION_SALT || 'sapphire-pii-salt-v1'; // à override en prod

/**
 * Dérive une clé de 32 bytes depuis la clé JWT + salt.
 * En prod, on utiliserait un KMS (AWS KMS, GCP KMS, etc.)
 */
function getKey(): Buffer {
  return crypto
    .createHash('sha256')
    .update(env.JWT_SECRET + SALT)
    .digest();
}

/**
 * Chiffre un JSON pour l'ancien comportement
 */
export function encryptJson(data: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALG, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Déchiffre un JSON
 */
export function decryptJson(encrypted: string): any {
  const buffer = Buffer.from(encrypted, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const data = buffer.subarray(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALG, getKey(), iv);
  decipher.setAuthTag(authTag);
  return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8'));
}

/**
 * Chiffre un PII (PII = Personally Identifiable Information).
 * Retourne une string base64 contenant IV + authTag + ciphertext.
 */
export function encryptPII(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return plaintext as null;
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALG, getKey(), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Format: base64(iv || authTag || ciphertext)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Déchiffre un PII. Retourne null si invalide.
 */
export function decryptPII(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  
  try {
    const buffer = Buffer.from(ciphertext, 'base64');
    if (buffer.length < IV_LENGTH + 16) return null; // taille minimale
    
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = buffer.subarray(IV_LENGTH + 16);
    
    const decipher = crypto.createDecipheriv(ALG, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  } catch (err) {
    console.error('PII decryption failed:', err);
    return null;
  }
}

/**
 * Hash un PII pour recherche exacte (sans révéler le plaintext).
 * Utilisé pour les numéros de passeport, cartes de crédit tokenisées, etc.
 */
export function hashPII(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;
  return crypto
    .createHash('sha256')
    .update(plaintext.toLowerCase().trim() + SALT)
    .digest('hex');
}
