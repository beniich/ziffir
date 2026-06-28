import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const settingsSchema = z.object({
  checkInTime: z.string().regex(timeRegex, 'Format HH:MM requis').optional(),
  checkOutTime: z.string().regex(timeRegex, 'Format HH:MM requis').optional(),
  currency: z.string().length(3).toUpperCase().default('EUR'),
  languages: z.array(z.string().length(2)).default(['fr', 'en']),
  timezone: z.string().default('Europe/Paris'),
  taxRate: z.number().min(0).max(1).default(0.10),
  cancellationPolicy: z.string().max(500).optional(),
}).strict();

export const createHotelSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(slugRegex, 'Slug invalide (a-z, 0-9, -)'),
  description: z.string().max(1000).optional(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).toUpperCase().default('FR'),
  phone: z.string().max(30).optional(),
  email: z.string().email(),
  stars: z.number().int().min(1).max(5).default(4),
  category: z.string().max(50).optional(),
  settings: settingsSchema.optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export const updateSettingsSchema = settingsSchema;

export const hotelIdParamSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

export const listHotelsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  city: z.string().optional(),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
