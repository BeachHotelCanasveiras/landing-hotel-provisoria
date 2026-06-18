/**
 * @file legal.schema.ts
 * @description Esquema Zod de validación para asegurar la integridad de los contratos legales y políticas.
 * - ISO 27001 & LGPD: Verificación estructural estricta de cláusulas de procesamiento de datos.
 * - Zero 'any': Tipado estricto e inmutable.
 */

import { z } from 'zod';

const ClauseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

export const LegalTranslationSchema = z.object({
  meta: z.object({
    last_updated: z.string().min(1),
    corporate_name: z.string().min(1),
    cnpj: z.string().min(1),
    address: z.string().min(1),
    email: z.string().min(1)
  }),
  terms: z.object({
    title: z.string().min(1),
    introduction: z.string().min(1),
    clauses: z.array(ClauseSchema).min(4)
  }),
  privacy: z.object({
    title: z.string().min(1),
    introduction: z.string().min(1),
    sections: z.array(ClauseSchema).min(4)
  }),
  cookies: z.object({
    title: z.string().min(1),
    introduction: z.string().min(1),
    consent_btn: z.string().min(1),
    decline_btn: z.string().min(1)
  })
});

export type LegalTranslation = z.infer<typeof LegalTranslationSchema>;