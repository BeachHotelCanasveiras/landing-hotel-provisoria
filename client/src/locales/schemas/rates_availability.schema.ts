/**
 * @file rates_availability.schema.ts
 * @description Esquema Zod de validación para asegurar la integridad de las traducciones del gestor de tarifas.
 */

import { z } from 'zod';

export const RatesAvailabilityTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  save_btn: z.string().min(1),
  sync_btn: z.string().min(1),
  saving: z.string().min(1),
  save_success: z.string().min(1),
  row_labels: z.object({
    availability: z.string().min(1),
    min_stay: z.string().min(1),
    min_nights_arrival: z.string().min(1),
    closed: z.string().min(1),
    no_check_in: z.string().min(1),
    no_check_out: z.string().min(1),
    rates_brl: z.string().min(1),
    rates_usd: z.string().min(1),
  }),
});

export type RatesAvailabilityTranslation = z.infer<typeof RatesAvailabilityTranslationSchema>;