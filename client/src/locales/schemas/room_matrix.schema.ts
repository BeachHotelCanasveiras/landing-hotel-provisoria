/**
 * @file room_matrix.schema.ts
 * @description Esquema de validación estricta Zod para asegurar la integridad de las traducciones de la matriz.
 */

import { z } from 'zod';

export const RoomMatrixTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  smart_allocate_btn: z.string().min(1),
  smart_allocating: z.string().min(1),
  smart_allocate_success: z.string().min(1),
  no_rooms_found: z.string().min(1),
  columns: z.object({
    room: z.string().min(1),
    type: z.string().min(1),
  }),
});

export type RoomMatrixTranslation = z.infer<typeof RoomMatrixTranslationSchema>;