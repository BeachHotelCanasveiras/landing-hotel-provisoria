// client/src/locales/schemas/auth.schema.ts
import { z } from 'zod';

export const AuthTranslationSchema = z.object({
  title_login: z.string().min(1),
  title_register: z.string().min(1),
  subtitle_login: z.string().min(1),
  subtitle_register: z.string().min(1),
  email_label: z.string().min(1),
  email_placeholder: z.string().min(1),
  password_label: z.string().min(1),
  password_placeholder: z.string().min(1),
  role_label: z.string().min(1),
  roles: z.object({
    guest: z.string().min(1),
    agency: z.string().min(1),
    admin: z.string().min(1),
    developer: z.string().min(1),
  }),
  button_login: z.string().min(1),
  button_register: z.string().min(1),
  switch_to_register: z.string().min(1),
  switch_to_login: z.string().min(1),
  validation_email_required: z.string().min(1),
  validation_email_invalid: z.string().min(1),
  validation_password_required: z.string().min(1),
  validation_password_min: z.string().min(1),
  toast_login_success: z.string().min(1),
  toast_register_success: z.string().min(1),
});

export type AuthTranslation = z.infer<typeof AuthTranslationSchema>;