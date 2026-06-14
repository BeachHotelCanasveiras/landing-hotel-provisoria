// client/src/locales/schemas/excursions.schema.ts
import { z } from 'zod';

const ExcursionItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  includes: z.string().min(1),
});

export const ExcursionsTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta_whatsapp: z.string().min(1),
  cta_maps: z.string().min(1),
  whatsapp_template: z.string().min(1),
  items: z.object({
    city_tour: ExcursionItemSchema,
    beto_carrero: ExcursionItemSchema,
    ilha_campeche: ExcursionItemSchema,
    bombinhas: ExcursionItemSchema,
    guarda_embau: ExcursionItemSchema,
    joaquina: ExcursionItemSchema,
  }),
});

export type ExcursionsTranslation = z.infer<typeof ExcursionsTranslationSchema>;