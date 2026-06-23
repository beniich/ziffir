"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = exports.defineAbilityFor = void 0;
const ability_1 = require("@casl/ability");
/**
 * Définit les permissions selon le rôle + contexte.
 */
const defineAbilityFor = (ctx) => {
    const { can, cannot, build } = new ability_1.AbilityBuilder(ability_1.createMongoAbility);
    // Coerce hotelId to string for MongoQuery conditions (null/undefined guarded below)
    const hid = ctx.hotelId ?? '';
    switch (ctx.role) {
        case 'VISITOR':
            // Aucune permission (accès public géré en amont)
            break;
        case 'CLIENT':
            can('read', 'OwnOrder');
            can('create', 'OwnOrder');
            can('update', 'OwnOrder', { guestId: ctx.userId });
            can('read', 'OwnInvoice');
            can('read', 'OwnProfile', { id: ctx.userId });
            can('update', 'OwnProfile', { id: ctx.userId });
            can('read', 'Advertisement');
            can('read', 'Activity');
            // Bloquer explicitement l'accès aux ressources hôtel
            cannot('read', 'StaffMember');
            cannot('read', 'AuditLog');
            cannot('read', 'Analytics');
            break;
        case 'HOTEL':
            can('manage', 'Hotel', { id: hid });
            can('manage', 'RoomOrder', { hotelId: hid });
            can('manage', 'Room', { hotelId: hid });
            can('manage', 'StaffMember', { hotelId: hid });
            can('manage', 'SuiteControl', { hotelId: hid });
            can('manage', 'PricingRule', { hotelId: hid });
            can('read', 'VaultDocument', { hotelId: hid });
            can('create', 'VaultDocument', { hotelId: hid });
            can('read', 'Analytics', { hotelId: hid });
            can('read', 'AuditLog', { hotelId: hid });
            can('read', 'Course');
            can('create', 'Course', { hotelId: hid });
            break;
        case 'SUPER_ADMIN':
            can('manage', 'all');
            break;
    }
    return build();
};
exports.defineAbilityFor = defineAbilityFor;
// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════
class PermissionsService {
    /**
     * Vérifie si l'utilisateur PEUT effectuer une action.
     */
    static can(ctx, action, subject, resource) {
        const ability = (0, exports.defineAbilityFor)(ctx);
        // ability.can 3rd arg is the resource object; cast to any to avoid strict MongoQuery mismatch
        return ability.can(action, subject, resource);
    }
    /**
     * Throw une erreur 403 si l'utilisateur ne peut PAS.
     */
    static require(ctx, action, subject, resource) {
        const ability = (0, exports.defineAbilityFor)(ctx);
        ability_1.ForbiddenError.from(ability).throwUnlessCan(action, subject, resource);
    }
    /**
     * Retourne le filtre Prisma WHERE selon le rôle.
     * C'EST LA CLÉ DU MULTI-TENANT.
     */
    static getPrismaFilter(ctx, subject) {
        if (ctx.role === 'SUPER_ADMIN') {
            return {}; // Pas de filtre
        }
        if (ctx.role === 'HOTEL') {
            if (!ctx.hotelId) {
                return { id: '__never_match__' }; // Bloqué
            }
            // Si la ressource est liée à un hôtel
            if (['Hotel', 'RoomOrder', 'Room', 'StaffMember', 'SuiteControl', 'PricingRule', 'VaultDocument'].includes(subject)) {
                return { hotelId: ctx.hotelId };
            }
            // Pour les ressources globales (Course, AuditLog)
            if (subject === 'AuditLog') {
                return { hotelId: ctx.hotelId };
            }
            return { hotelId: ctx.hotelId };
        }
        if (ctx.role === 'CLIENT') {
            if (subject === 'OwnOrder')
                return { guestId: ctx.userId };
            if (subject === 'OwnInvoice')
                return { userId: ctx.userId };
            if (subject === 'OwnProfile')
                return { id: ctx.userId };
            // Bloquer tout le reste
            return { id: '__never_match__' };
        }
        return { id: '__never_match__' };
    }
}
exports.PermissionsService = PermissionsService;
//# sourceMappingURL=permissions.service.js.map