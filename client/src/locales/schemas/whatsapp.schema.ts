/**
 * @file whatsapp.schema.ts
 * @description Contrato estricto para centralizar todas las plantillas de comunicación de WhatsApp del sistema.
 */

import { z } from 'zod';

export const WhatsappTranslationSchema = z.object({
  booking_confirmation: z.string().min(1),
  excursion_inquiry: z.string().min(1),
  attraction_directions: z.string().min(1),
  general_contact: z.string().min(1),
});

export type WhatsappTranslation = z.infer<typeof WhatsappTranslationSchema>;