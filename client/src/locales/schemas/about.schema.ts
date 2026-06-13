import { z } from 'zod';

/**
 * @file about.schema.ts
 * @description Contrato estricto para las traducciones de la sección de propuesta de valor (About).
 */
const FeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const AboutTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  features: z.object({
    location: FeatureSchema,
    breakfast: FeatureSchema,
    warmth: FeatureSchema,
  }),
});

export type AboutTranslation = z.infer<typeof AboutTranslationSchema>;