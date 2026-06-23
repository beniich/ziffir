/**
 * Service de sanitization des inputs utilisateur.
 * Bloque toute injection HTML/JS (XSS).
 */
export declare class SanitizeService {
    /**
     * Nettoie une chaîne de texte en supprimant tout HTML/script.
     */
    static text(input: string): string;
    /**
     * Nettoie un champ optionnel (retourne null si vide).
     */
    static textOptional(input: string | null | undefined): string | null;
    /**
     * Valide et nettoie un email.
     */
    static email(input: string): string | null;
    /**
     * Sanitize récursivement un objet.
     */
    static object<T extends Record<string, any>>(obj: T): T;
}
//# sourceMappingURL=sanitize.service.d.ts.map