import { z } from 'zod';

/**
 * @file hero.schema.ts
 * @description Contrato estricto para los diccionarios del componente Hero.
 * Garantiza que ninguna traducción en es, en o pt-BR omita claves críticas.
 */
export const HeroTranslationSchema = z.object({
  title_prefix: z.string().min(1),
  title_highlight: z.string().min(1),
  subtitle: z.string().min(1),
  cta_primary: z.string().min(1),
  cta_secondary: z.string().min(1),
});

export type HeroTranslation = z.infer<typeof HeroTranslationSchema>;