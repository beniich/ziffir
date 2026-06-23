import { Request, Response } from 'express';
export declare class BillingController {
    /**
     * GET /api/billing/plans
     * Liste publique des plans
     */
    static listPlans(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/billing/subscription
     * Subscription actuelle de l'hôtel
     */
    static getSubscription(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/billing/usage
     * Usage actuel vs limites
     */
    static getUsage(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/billing/checkout
     * Crée une session de checkout
     */
    static createCheckout(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/billing/portal
     * Crée une session du portail client Stripe
     */
    static createPortal(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/billing/invoices
     * Historique des factures
     */
    static listInvoices(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/billing/cancel
     * Annulation à la fin de la période
     */
    static cancel(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/billing/resume
     * Réactive un abonnement annulé
     */
    static resume(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=billing.controller.d.ts.map