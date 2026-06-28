import type { Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';

// Récupérer toutes les commandes Room Service d'un hôtel
export const getRoomServiceOrders = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;

    if (!hotelId || typeof hotelId !== 'string') {
      return res.status(400).json({ error: 'hotelId is required as a query parameter.' });
    }

    const orders = await prisma.roomServiceOrder.findMany({
      where: { hotelId },
      include: {
        room: true,
        reservation: {
          include: {
            guest: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching room service orders:', error);
    res.status(500).json({ error: 'An error occurred while fetching room service orders.' });
  }
};

// Créer une nouvelle commande
export const createRoomServiceOrder = async (req: Request, res: Response) => {
  try {
    const { hotelId, reservationId, roomId, items, notes } = req.body;

    if (!hotelId || !reservationId || !roomId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Missing required fields or invalid items array.' });
    }

    let totalCents = 0;
    const orderItemsToCreate = items.map((item: any) => {
      const lineTotal = item.quantity * item.unitPriceCents;
      totalCents += lineTotal;
      return {
        catalogItemId: item.catalogItemId || null,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalCents: lineTotal,
      };
    });

    const newOrder = await prisma.roomServiceOrder.create({
      data: {
        hotelId,
        reservationId,
        roomId,
        notes,
        totalCents,
        status: 'RECEIVED',
        progress: 10, // Initial progress
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        room: true,
        reservation: {
          include: { guest: true },
        },
        items: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating room service order:', error);
    res.status(500).json({ error: 'An error occurred while creating the order.' });
  }
};

// Mettre à jour le statut d'une commande
export const updateRoomServiceOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    if (!status && progress === undefined) {
      return res.status(400).json({ error: 'Status or progress is required.' });
    }

    const updatedOrder = await prisma.roomServiceOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
      },
      include: {
        room: true,
        reservation: {
          include: { guest: true },
        },
        items: true,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating room service order:', error);
    res.status(500).json({ error: 'An error occurred while updating the order.' });
  }
};

// Obtenir le catalogue Room Service
export const getRoomServiceCatalog = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;

    if (!hotelId || typeof hotelId !== 'string') {
      return res.status(400).json({ error: 'hotelId is required.' });
    }

    const catalog = await prisma.roomServiceCatalogItem.findMany({
      where: { hotelId, available: true },
    });

    res.json(catalog);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ error: 'An error occurred while fetching the catalog.' });
  }
};
