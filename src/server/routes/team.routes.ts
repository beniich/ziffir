import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, HotelRole } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/cookieAuth';
import { auditService } from '../domains/shared/services/audit.service';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

// ----------------------------------------------------------------------------
// GET /api/team/members?hotelId=xxx
// Liste les membres d'un hôtel
// ----------------------------------------------------------------------------
router.get('/members', async (req: any, res) => {
  const { hotelId } = req.query;
  
  if (!hotelId) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'hotelId requis' } 
    });
  }
  
  // Vérif que le user est membre
  const membership = await prisma.hotelMembership.findFirst({
    where: { 
      hotelId: hotelId as string, 
      userId: req.auth.sub,
      isActive: true,
      removedAt: null,
    },
  });
  
  if (!membership) {
    return res.status(403).json({ 
      success: false, 
      error: { message: 'Accès refusé' } 
    });
  }
  
  const members = await prisma.hotelMembership.findMany({
    where: { 
      hotelId: hotelId as string,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // OWNER en premier alphabétiquement
      { joinedAt: 'asc' },
    ],
  });
  
  res.json({ success: true, data: members });
});

// ----------------------------------------------------------------------------
// PATCH /api/team/members/:id
// Modifier le rôle d'un membre (OWNER only pour promotions MANAGER+)
// ----------------------------------------------------------------------------
const updateMemberSchema = z.object({
  role: z.enum([
    'OWNER', 'MANAGER', 'SOMMELIER', 'CONCIERGE', 'RECEPTION',
    'HOUSEKEEPING', 'KITCHEN', 'STAFF', 'VIEWER'
  ]).optional(),
  permissions: z.array(z.string()).optional(),
});

router.patch('/members/:id', 
  requirePermission('members.invite'),
  async (req: any, res) => {
    const parsed = updateMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Données invalides' } 
      });
    }
    
    const targetMembership = await prisma.hotelMembership.findUnique({
      where: { id: req.params.id },
    });
    
    if (!targetMembership) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Membre introuvable' } 
      });
    }
    
    // Vérif que l'actor est aussi membre de cet hôtel
    const actorMembership = await prisma.hotelMembership.findFirst({
      where: { 
        hotelId: targetMembership.hotelId, 
        userId: req.auth.sub,
        isActive: true,
      },
    });
    
    if (!actorMembership) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Accès refusé' } 
      });
    }
    
    // Règle : seul un OWNER peut créer un autre OWNER
    if (parsed.data.role === 'OWNER' && actorMembership.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: { message: 'Seul un OWNER peut promouvoir au rang OWNER' },
      });
    }
    
    // Empêcher de se retirer soi-même si on est le seul OWNER
    if (targetMembership.userId === req.auth.sub && 
        parsed.data.role && parsed.data.role !== 'OWNER' &&
        actorMembership.role === 'OWNER') {
      const otherOwners = await prisma.hotelMembership.count({
        where: {
          hotelId: targetMembership.hotelId,
          role: 'OWNER',
          isActive: true,
          id: { not: targetMembership.id },
        },
      });
      
      if (otherOwners === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Impossible : vous êtes le seul OWNER' },
        });
      }
    }
    
    const updated = await prisma.hotelMembership.update({
      where: { id: req.params.id },
      data: {
        ...(parsed.data.role && { role: parsed.data.role as HotelRole }),
        ...(parsed.data.permissions && { permissions: parsed.data.permissions ? JSON.stringify(parsed.data.permissions) : undefined }),
      },
      include: {
        user: { select: { email: true, displayName: true } },
      },
    });
    
    await auditService.append({
      eventType: 'team.member.update',
      tenantId: targetMembership.hotelId,
      actorId: req.auth.sub,
      actorType: 'user',
      resourceType: 'HotelMembership',
      resourceId: targetMembership.id,
      action: 'member.update',
      metadata: {
        targetUserId: targetMembership.userId,
        changes: parsed.data,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ success: true, data: updated });
  }
);

// ----------------------------------------------------------------------------
// DELETE /api/team/members/:id
// Retirer un membre (soft delete)
// ----------------------------------------------------------------------------
router.delete('/members/:id',
  requirePermission('members.remove'),
  async (req: any, res) => {
    const targetMembership = await prisma.hotelMembership.findUnique({
      where: { id: req.params.id },
    });
    
    if (!targetMembership) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Membre introuvable' } 
      });
    }
    
    // Vérif actor
    const actorMembership = await prisma.hotelMembership.findFirst({
      where: { 
        hotelId: targetMembership.hotelId, 
        userId: req.auth.sub,
        isActive: true,
      },
    });
    
    if (!actorMembership) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Accès refusé' } 
      });
    }
    
    // Pas le droit de retirer un OWNER sauf si on est OWNER soi-même
    if (targetMembership.role === 'OWNER' && actorMembership.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: { message: 'Seul un OWNER peut retirer un OWNER' },
      });
    }
    
    // Pas le droit de se retirer soi-même si seul OWNER
    if (targetMembership.userId === req.auth.sub && targetMembership.role === 'OWNER') {
      const otherOwners = await prisma.hotelMembership.count({
        where: {
          hotelId: targetMembership.hotelId,
          role: 'OWNER',
          isActive: true,
          id: { not: targetMembership.id },
        },
      });
      
      if (otherOwners === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Impossible : vous êtes le seul OWNER' },
        });
      }
    }
    
    await prisma.hotelMembership.update({
      where: { id: req.params.id },
      data: { 
        isActive: false, 
        removedAt: new Date() 
      },
    });
    
    // Révoque toutes les sessions actives de cet user pour cet hôtel
    await prisma.userSession.updateMany({
      where: {
        userId: targetMembership.userId,
        activeHotelId: targetMembership.hotelId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    
    await auditService.append({
      eventType: 'team.member.remove',
      tenantId: targetMembership.hotelId,
      actorId: req.auth.sub,
      actorType: 'user',
      resourceType: 'HotelMembership',
      resourceId: targetMembership.id,
      action: 'member.remove',
      metadata: { targetUserId: targetMembership.userId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ success: true });
  }
);

// ----------------------------------------------------------------------------
// GET /api/team/invitations?hotelId=xxx
// ----------------------------------------------------------------------------
router.get('/invitations', async (req: any, res) => {
  const { hotelId } = req.query;
  
  if (!hotelId) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'hotelId requis' } 
      });
  }
  
  const membership = await prisma.hotelMembership.findFirst({
    where: { 
      hotelId: hotelId as string, 
      userId: req.auth.sub,
      isActive: true,
    },
  });
  
  if (!membership) {
    return res.status(403).json({ 
      success: false, 
      error: { message: 'Accès refusé' } 
    });
  }
  
  const invitations = await prisma.hotelInvitation.findMany({
    where: {
      hotelId: hotelId as string,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  res.json({ success: true, data: invitations });
});

// ----------------------------------------------------------------------------
// DELETE /api/team/invitations/:id
// Révoquer une invitation
// ----------------------------------------------------------------------------
router.delete('/invitations/:id',
  requirePermission('members.invite'),
  async (req: any, res) => {
    const invitation = await prisma.hotelInvitation.findUnique({
      where: { id: req.params.id },
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Invitation introuvable' } 
      });
    }
    
    if (invitation.acceptedAt || invitation.revokedAt) {
      return res.status(400).json({
        success: false,
        error: { message: "Cette invitation n'est plus valide" },
      });
    }
    
    // Vérif actor
    const actorMembership = await prisma.hotelMembership.findFirst({
      where: { 
        hotelId: invitation.hotelId, 
        userId: req.auth.sub,
        isActive: true,
      },
    });
    
    if (!actorMembership) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Accès refusé' } 
      });
    }
    
    await prisma.hotelInvitation.update({
      where: { id: req.params.id },
      data: { revokedAt: new Date() },
    });
    
    await auditService.append({
      eventType: 'team.invitation.revoke',
      tenantId: invitation.hotelId,
      actorId: req.auth.sub,
      actorType: 'user',
      resourceType: 'HotelInvitation',
      resourceId: invitation.id,
      action: 'invitation.revoke',
      metadata: { email: invitation.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ success: true });
  }
);

export default router;
