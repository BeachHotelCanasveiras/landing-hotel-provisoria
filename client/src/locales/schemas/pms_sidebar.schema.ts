/**
 * @file pms_sidebar.schema.ts
 * @description Esquema Zod de validación para asegurar la integridad de las traducciones del menú lateral.
 */

import { z } from 'zod';

export const PMSSidebarTranslationSchema = z.object({
  menu_principal: z.string().min(1),
  overview: z.string().min(1),
  bookings: z.object({
    title: z.string().min(1),
    room_map: z.string().min(1),
    search: z.string().min(1),
  }),
  reports: z.object({
    title: z.string().min(1),
    revenue: z.string().min(1),
    meals: z.string().min(1),
    police: z.string().min(1),
  }),
  accounting: z.object({
    title: z.string().min(1),
    cash_flow: z.string().min(1),
    expenses: z.string().min(1),
    invoiced: z.string().min(1),
  }),
  rates: z.string().min(1),
  housekeeping: z.string().min(1),
  booking_engine: z.string().min(1),
  settings: z.object({
    title: z.string().min(1),
    all_settings: z.string().min(1),
    email_templates: z.string().min(1),
    exchange_rates: z.string().min(1),
    pos: z.string().min(1),
  }),
  logout: z.string().min(1),
});

export type PMSSidebarTranslation = z.infer<typeof PMSSidebarTranslationSchema>;