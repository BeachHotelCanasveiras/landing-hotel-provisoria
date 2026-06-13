import { z } from 'zod';

export const FooterTranslationSchema = z.object({
  tagline: z.string().min(1),
  contact_title: z.string().min(1),
  explore_title: z.string().min(1),
  social_title: z.string().min(1),
  strategy_credits_label: z.string().min(1),
});