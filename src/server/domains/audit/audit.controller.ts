import { Request, Response } from 'express';
import { auditService } from '../shared/services/audit.service';
import { prisma } from '../../lib/prisma.js';
import { format } from 'date-fns';

export class AuditController {
  async getLogs(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId || (req as any).activeHotel?.id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Tenant ID required' });
      }

      // Basic pagination & filtering
      const { eventType, actorId, limit = 100 } = req.query;

      const logs = await auditService.listForTenant(tenantId, {
        eventType: eventType as string,
        actorId: actorId as string,
        limit: Number(limit)
      });

      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async exportCsv(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId || (req as any).activeHotel?.id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Tenant ID required' });
      }

      const logs = await auditService.listForTenant(tenantId, { limit: 10000 }); // Export up to 10k logs

      // Build CSV
      const headers = ['ID', 'Date', 'Event Type', 'Actor ID', 'Actor Type', 'Action', 'IP Address', 'Hash'];
      const rows = logs.map(log => {
        return [
          log.id,
          format(log.createdAt, "yyyy-MM-dd HH:mm:ss"),
          log.eventType,
          log.actorId || 'N/A',
          log.actorType,
          `"${log.action.replace(/"/g, '""')}"`, // escape quotes for CSV
          log.ipAddress || 'N/A',
          log.hash
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv"`);
      res.send(csvContent);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      // In a real scenario, restrict this to Super Admins only
      const result = await auditService.verifyChain();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}

export const auditController = new AuditController();
