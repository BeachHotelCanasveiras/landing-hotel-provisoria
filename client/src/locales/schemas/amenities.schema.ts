/**
 * @file amenities.schema.ts
 * @description Contrato estricto para validar las traducciones del catálogo de Amenities de habitaciones.
 */

import { z } from 'zod';

export const AmenitiesTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  save_button: z.string().min(1),
  labels: z.object({
    has_ac: z.string().min(1),
    has_minibar: z.string().min(1),
    has_tv: z.string().min(1),
    has_bathtub: z.string().min(1),
    has_balcony: z.string().min(1),
    has_wifi: z.string().min(1),
    has_ocean_view: z.string().min(1),
    has_safe: z.string().min(1),
    has_hairdryer: z.string().min(1),
    has_coffee: z.string().min(1),
    double_beds: z.string().min(1),
    single_beds: z.string().min(1),
  }),
});

export type AmenitiesTranslation = z.infer<typeof AmenitiesTranslationSchema>;