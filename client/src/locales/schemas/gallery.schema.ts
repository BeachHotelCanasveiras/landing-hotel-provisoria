import { z } from 'zod';

/**
 * @file gallery.schema.ts
 * @description Contrato estricto para los diccionarios de la sección Gallery (Fase 4 del Embudo).
 */
const GalleryItemSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
});

export const GalleryTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  items: z.object({
    reception: GalleryItemSchema,
    facade: GalleryItemSchema,
    pool: GalleryItemSchema,
    sunset: GalleryItemSchema,
    suite: GalleryItemSchema,
    family: GalleryItemSchema,
  }),
});

export type GalleryTranslation = z.infer<typeof GalleryTranslationSchema>;