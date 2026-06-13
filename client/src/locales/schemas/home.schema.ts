import { z } from 'zod';

/**
 * @file home.schema.ts
 * @description Contrato estricto de traducción para los elementos nativos de la página de inicio (Home).
 */
export const HomeTranslationSchema = z.object({
  map_badge: z.string().min(1),
  map_title: z.string().min(1),
  map_subtitle: z.string().min(1),
});

export type HomeTranslation = z.infer<typeof HomeTranslationSchema>;