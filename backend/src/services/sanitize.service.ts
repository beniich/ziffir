// src/services/sanitize.service.ts

import DOMPurify from 'isomorphic-dompurify';

/**
 * Service de sanitization des inputs utilisateur.
 * Bloque toute injection HTML/JS (XSS).
 */
export class SanitizeService {
  /**
   * Nettoie une chaîne de texte en supprimant tout HTML/script.
   */
  static text(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    }).trim();
  }

  /**
   * Nettoie un champ optionnel (retourne null si vide).
   */
  static textOptional(input: string | null | undefined): string | null {
    if (input === null || input === undefined) return null;
    const cleaned = this.text(input);
    return cleaned === '' ? null : cleaned;
  }

  /**
   * Valide et nettoie un email.
   */
  static email(input: string): string | null {
    const cleaned = this.text(input);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleaned) ? cleaned : null;
  }

  /**
   * Sanitize récursivement un objet.
   */
  static object<T extends Record<string, any>>(obj: T): T {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.text(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.object(value);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }
}
