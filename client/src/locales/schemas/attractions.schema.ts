import { z } from 'zod';

/**
 * @file attractions.schema.ts
 * @description Contrato estricto para los diccionarios de la sección de Atracciones (Fase 5 del Embudo).
 */
const AttractionItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  distance: z.string().min(1),
  time: z.string().min(1),
});

export const AttractionsTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta_button: z.string().min(1),
  whatsapp_query_template: z.string().min(1),
  items: z.object({
    brava: AttractionItemSchema,
    jurere: AttractionItemSchema,
    aguashow: AttractionItemSchema,
    centro: AttractionItemSchema,
    frances: AttractionItemSchema,
    fortaleza: AttractionItemSchema,
  }),
});

export type AttractionsTranslation = z.infer<typeof AttractionsTranslationSchema>;