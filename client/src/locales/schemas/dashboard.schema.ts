// client/src/locales/schemas/dashboard.schema.ts
import { z } from 'zod';

export const DashboardTranslationSchema = z.object({
  welcome_message: z.string().min(1),
  logout_button: z.string().min(1),
  role_badge: z.string().min(1),
  views: z.object({
    guest: z.object({
      title: z.string().min(1),
      my_bookings: z.string().min(1),
      no_bookings: z.string().min(1),
      guide_title: z.string().min(1),
      guide_desc: z.string().min(1),
    }),
    agency: z.object({
      title: z.string().min(1),
      wholesale_rates: z.string().min(1),
      discount_label: z.string().min(1),
      priority_contact: z.string().min(1),
    }),
    admin: z.object({
      title: z.string().min(1),
      occupancy: z.string().min(1),
      monthly_revenue: z.string().min(1),
      active_bookings: z.string().min(1),
      bookings_list: z.string().min(1),
    }),
    developer: z.object({
      title: z.string().min(1),
      system_logs: z.string().min(1),
      db_connection: z.string().min(1),
      cloudinary_inventory: z.string().min(1),
      status_healthy: z.string().min(1),
    }),
  }),
});

export type DashboardTranslation = z.infer<typeof DashboardTranslationSchema>;