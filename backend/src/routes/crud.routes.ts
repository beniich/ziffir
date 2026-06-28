import type { Request, Response } from 'express';
import { Router } from 'express';

const router = Router();

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     tags: [CRUD]
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', (req: Request, res: Response) => {
  res.json(items);
});

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [CRUD]
 *     responses:
 *       201:
 *         description: Item created
 */
router.post('/', (req: Request, res: Response) => {
  const newItem = { id: items.length + 1, ...req.body };
  items.push(newItem);
  res.status(201).json(newItem);
});

export default router;
