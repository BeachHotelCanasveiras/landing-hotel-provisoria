import { z } from 'zod';

/**
 * @file testimonials.schema.ts
 * @description Esquema Zod para validar las reseñas estáticas de respaldo y dinámicas de Google.
 */
export const TestimonialItemSchema = z.object({
  author_name: z.string().min(1),
  profile_photo_url: z.string().url().or(z.string()),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
  relative_time_description: z.string().optional(),
});

export const TestimonialsTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  fallback_reviews: z.array(TestimonialItemSchema).min(2),
});

export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;
export type TestimonialsTranslation = z.infer<typeof TestimonialsTranslationSchema>;