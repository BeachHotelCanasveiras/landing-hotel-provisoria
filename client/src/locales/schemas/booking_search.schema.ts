/**
 * @file booking_search.schema.ts
 * @description Esquema Zod de validación para asegurar la integridad de las traducciones del buscador CRM.
 */

import { z } from 'zod';

export const BookingSearchTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  search_placeholder: z.string().min(1),
  filter_status_all: z.string().min(1),
  status: z.object({
    pending: z.string().min(1),
    confirmed: z.string().min(1),
    checked_in: z.string().min(1),
    checked_out: z.string().min(1),
    cancelled: z.string().min(1),
  }),
  columns: z.object({
    reference: z.string().min(1),
    guest: z.string().min(1),
    room: z.string().min(1),
    dates: z.string().min(1),
    total: z.string().min(1),
    status: z.string().min(1),
    actions: z.string().min(1),
  }),
  no_bookings_found: z.string().min(1),
});

export type BookingSearchTranslation = z.infer<typeof BookingSearchTranslationSchema>;