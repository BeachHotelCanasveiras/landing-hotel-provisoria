/**
 * @file room_management.schema.ts
 * @description Contrato estricto para la validación de traducciones y campos de formulario de inventario físico.
 */
import { z } from 'zod';

// 1. Esquema para validar las traducciones del aparato (i18n)
export const RoomManagementTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  add_button: z.string().min(1),
  table: z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    price: z.string().min(1),
    status: z.string().min(1),
    actions: z.string().min(1),
  }),
  form: z.object({
    create_title: z.string().min(1),
    room_name: z.string().min(1),
    room_type: z.string().min(1),
    nightly_price: z.string().min(1),
    save_button: z.string().min(1),
  })
});

export type RoomManagementTranslation = z.infer<typeof RoomManagementTranslationSchema>;

// 2. Esquema para validar los datos de creación de habitaciones (TS2307 Saneado)
export const RoomSchema = z.object({
  name: z.string().min(1, "El identificador de la habitación es requerido"),
  type: z.enum(['single', 'double', 'triple', 'grupal']),
  price_per_night: z.number().min(0, "El precio por noche debe ser mayor o igual a cero"),
  status: z.enum(['available', 'maintenance', 'occupied']).default('available'),
  housekeeping_status: z.enum(['clean', 'dirty', 'cleaning']).default('clean')
});

export type RoomFormData = z.infer<typeof RoomSchema>;