import { MongoAbility } from '@casl/ability';
export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type Subject = 'all' | 'Hotel' | 'RoomOrder' | 'Room' | 'StaffMember' | 'Course' | 'VaultDocument' | 'Analytics' | 'PricingRule' | 'SuiteControl' | 'AuditLog' | 'User' | 'OwnOrder' | 'OwnInvoice' | 'OwnProfile' | 'Advertisement' | 'Activity';
export type AppAbility = MongoAbility<[Action, Subject]>;
export interface UserContext {
    userId: string;
    role: 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';
    hotelId?: string | null;
}
/**
 * Définit les permissions selon le rôle + contexte.
 */
export declare const defineAbilityFor: (ctx: UserContext) => AppAbility;
export declare class PermissionsService {
    /**
     * Vérifie si l'utilisateur PEUT effectuer une action.
     */
    static can(ctx: UserContext, action: Action, subject: Subject, resource?: Record<string, any>): boolean;
    /**
     * Throw une erreur 403 si l'utilisateur ne peut PAS.
     */
    static require(ctx: UserContext, action: Action, subject: Subject, resource?: Record<string, any>): void;
    /**
     * Retourne le filtre Prisma WHERE selon le rôle.
     * C'EST LA CLÉ DU MULTI-TENANT.
     */
    static getPrismaFilter(ctx: UserContext, subject: Subject): Record<string, any>;
}
//# sourceMappingURL=permissions.service.d.ts.map