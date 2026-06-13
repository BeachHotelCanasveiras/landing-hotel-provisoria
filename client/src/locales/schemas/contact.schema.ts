import { z } from 'zod';

/**
 * @file contact.schema.ts
 * @description Contrato estricto de traducción para la sección de Contacto (Formulario).
 */
export const ContactTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  name_label: z.string().min(1),
  name_placeholder: z.string().min(1),
  email_label: z.string().min(1),
  email_placeholder: z.string().min(1),
  message_label: z.string().min(1),
  message_placeholder: z.string().min(1),
  submit_button: z.string().min(1),
  validation_name_required: z.string().min(1),
  validation_email_required: z.string().min(1),
  validation_email_invalid: z.string().min(1),
  validation_message_required: z.string().min(1),
  toast_success: z.string().min(1),
});

export type ContactTranslation = z.infer<typeof ContactTranslationSchema>;