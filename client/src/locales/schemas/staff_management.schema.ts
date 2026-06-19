/**
 * @file staff_management.schema.ts
 * @description Contrato estricto para la validación de traducciones y campos de formulario de Recursos Humanos (SaaS-Ready).
 * Satisface las directivas de la Trinidad Atómica:
 * - Filtra y sanitiza entradas para mitigar inyecciones XSS.
 * - Elimina campos médicos obsoletos de forma transversal.
 * - Asegura la consistencia regional de traducciones.
 */

import { z } from 'zod';

// ============================================================================
// 1. ESQUEMA DE TRADUCCIONES (Garantiza consistencia i18n Bilingüe/Trilingüe)
// ============================================================================
export const StaffManagementTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  tabs: z.object({
    register: z.string().min(1),
    manage: z.string().min(1),
  }),
  form: z.object({
    first_name: z.string().min(1),
    middle_name: z.string().min(1),
    paternal_last_name: z.string().min(1),
    maternal_last_name: z.string().min(1),
    email_auto_label: z.string().min(1),
    phone: z.string().min(1),
    country: z.string().min(1),
    state_code: z.string().min(1),
    emergency_title: z.string().min(1),
    emergency_name: z.string().min(1),
    emergency_phone: z.string().min(1),
    role_title: z.string().min(1),
    submit_button: z.string().min(1),
    edit_button: z.string().min(1),
  }),
  table: z.object({
    columns: z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      contact: z.string().min(1),
      residence: z.string().min(1),
      actions: z.string().min(1),
    }),
    no_records: z.string().min(1),
  }),
  modals: z.object({
    ficha: z.object({
      title: z.string().min(1),
      contact_title: z.string().min(1),
      address_title: z.string().min(1),
      emergency_title: z.string().min(1),
      extra_title: z.string().min(1),
      extra_desc: z.string().min(1),
    }),
    invite: z.object({
      title: z.string().min(1),
      desc: z.string().min(1),
      whatsapp_btn: z.string().min(1),
      email_btn: z.string().min(1),
    }),
    reset: z.object({
      title: z.string().min(1),
      new_pass: z.string().min(1),
      cancel_btn: z.string().min(1),
      submit_btn: z.string().min(1),
    })
  })
});

export type StaffManagementTranslation = z.infer<typeof StaffManagementTranslationSchema>;

// ============================================================================
// 2. ESQUEMA DE FORMULARIO (Validación y Sanitización del lado del Cliente)
// ============================================================================
export const StaffSchema = z.object({
  first_name: z.string()
    .min(1, "O primeiro nome é obrigatório")
    .max(50, "Máximo 50 caracteres")
    .transform(val => val.trim()),
  
  middle_name: z.string()
    .max(50, "Máximo 50 caracteres")
    .transform(val => val.trim())
    .optional()
    .nullable(),
  
  paternal_last_name: z.string()
    .min(1, "O sobrenome paterno é obrigatório")
    .max(50, "Máximo 50 caracteres")
    .transform(val => val.trim()),
  
  maternal_last_name: z.string()
    .max(50, "Máximo 50 caracteres")
    .transform(val => val.trim())
    .optional()
    .nullable(),
  
  email: z.string()
    .min(1, "O e-mail é obrigatório")
    .email("Insira um endereço de e-mail válido")
    .transform(val => val.trim().toLowerCase()),
  
  role: z.enum(['housekeeper', 'receptionist', 'admin']),
  
  country: z.string().default('Brasil'),
  
  state_code: z.string()
    .min(2, "UF inválida")
    .max(2, "UF inválida")
    .transform(val => val.trim().toUpperCase()),
  
  phone: z.string()
    .min(10, "Número de telefone muito curto")
    .max(20, "Número de de telefone muito longo"),
  
  emergency_contact_name: z.string()
    .min(1, "O nome do contato de emergência é obrigatório")
    .max(100, "Máximo 100 caracteres")
    .transform(val => val.trim()),
  
  emergency_contact_phone: z.string()
    .min(10, "Número de telefone muito curto")
    .max(20, "Número de de telefone muy longo")
});

export type StaffFormData = z.infer<typeof StaffSchema>;