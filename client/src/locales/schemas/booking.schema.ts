import { z } from 'zod';

/**
 * @file booking.schema.ts
 * @description Contrato estricto de traducción para el motor de reserva BookingDialog.
 */
export const BookingTranslationSchema = z.object({
  step1_title: z.string().min(1),
  step2_title: z.string().min(1),
  check_in_label: z.string().min(1),
  check_out_label: z.string().min(1),
  select_placeholder: z.string().min(1),
  continue_button: z.string().min(1),
  guest_name_label: z.string().min(1),
  guest_name_placeholder: z.string().min(1),
  guests_label: z.string().min(1),
  guests_suffix: z.string().min(1),
  trust_badge: z.string().min(1),
  trust_badge_stripe: z.string().min(1), // Validando llave de Stripe
  pay_now_button: z.string().min(1),      // Validando botón de procesamiento de pago
  whatsapp_button: z.string().min(1),
  whatsapp_template: z.object({
    header: z.string().min(1),
    room: z.string().min(1),
    check_in: z.string().min(1),
    check_out: z.string().min(1),
    nights: z.string().min(1),
    guests: z.string().min(1),
    name: z.string().min(1),
    footer: z.string().min(1),
  }),
});

export type BookingTranslation = z.infer<typeof BookingTranslationSchema>;