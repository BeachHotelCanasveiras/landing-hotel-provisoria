/**
 * @file pms_sidebar.schema.ts
 * @description Contrato estricto y tipado para la navegación lateral del PMS (Gobernación RBAC).
 */
import { z } from 'zod';

export const PMSSidebarTranslationSchema = z.object({
  menu_principal: z.string().min(1),
  overview: z.string().min(1),
  check_in: z.string().min(1),
  
  bookings: z.object({
    title: z.string().min(1),
    room_map: z.string().min(1),
    search: z.string().min(1),
    daily: z.string().min(1),
    weekly: z.string().min(1),
    monthly: z.string().min(1),
    available: z.string().min(1),
    occupied: z.string().min(1),
    reserved: z.string().min(1),
    blocked: z.string().min(1),
    maintenance: z.string().min(1),
  }),
  
  rates: z.object({
    title: z.string().min(1),
    wholesale: z.string().min(1),
    public: z.string().min(1),
    flexible: z.string().min(1),
    last_minute: z.string().min(1),
  }),
  
  guests: z.object({
    title: z.string().min(1),
    search: z.string().min(1),
  }),
  
  housekeeping: z.object({
    title: z.string().min(1),
    checklist: z.string().min(1),
    schedule: z.string().min(1),
    messages: z.string().min(1),
    inventory: z.string().min(1),
    missing: z.string().min(1),
  }),
  
  accounting: z.object({
    title: z.string().min(1),
    invoice_input: z.string().min(1),
    cost_centers: z.string().min(1),
  }),
  
  inventory: z.object({
    title: z.string().min(1),
    stock: z.string().min(1),
  }),
  
  laundry: z.object({
    title: z.string().min(1),
    dirty_sheets: z.string().min(1),
  }),
  
  breakfast: z.object({
    title: z.string().min(1),
    menu_today: z.string().min(1),
    special_requests: z.string().min(1),
  }),
  
  hr: z.object({
    title: z.string().min(1),
    employees: z.string().min(1),
    schedules: z.string().min(1),
    calculations: z.string().min(1),
  }),
  
  promotions: z.object({
    title: z.string().min(1),
    packages: z.string().min(1),
    receipts: z.string().min(1),
    coupons: z.string().min(1),
  }),
  
  database: z.object({
    title: z.string().min(1),
  }),
  
  agency_retail: z.object({
    title: z.string().min(1),
  }),
  
  agency_wholesale: z.object({
    title: z.string().min(1),
  }),
  
  settings: z.object({
    title: z.string().min(1),
    dashboard: z.string().min(1),
    templates: z.string().min(1),
  }),
  
  booking_engine: z.string().min(1),
  logout: z.string().min(1),
});

export type PMSSidebarTranslation = z.infer<typeof PMSSidebarTranslationSchema>;