import { z } from 'zod';

/**
 * @file rooms.schema.ts
 * @description Contrato estricto para los diccionarios de la sección Rooms.
 */
const RoomSuiteSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  amenities: z.array(z.string().min(1)).min(2),
});

export const RoomsTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  discount_badge: z.string().min(1),
  special_badge: z.string().min(1),
  availability_label: z.string().min(1),
  active_status: z.string().min(1),
  book_button: z.string().min(1),
  suites: z.object({
    single: RoomSuiteSchema,
    double: RoomSuiteSchema,
    triple: RoomSuiteSchema,
    grupal: RoomSuiteSchema,
  }),
});

export type RoomsTranslation = z.infer<typeof RoomsTranslationSchema>;