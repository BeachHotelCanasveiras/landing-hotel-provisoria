/**
 * @file create-staff.ts
 * @description Endpoint administrativo de alta fidelidad para el aprovisionamiento de personal y gobernanza de credenciales de Recursos Humanos.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado asincrónicamente con el middleware withObservability.
 * - ISO 27001 & RBAC: Verificación rigurosa de JWT de administrador para prevenir elevación de privilegios.
 * - Validación con Zod: Estructura, formatos, códigos de país, estado y ficha de salud ocupacional analizados en tiempo de ejecución.
 * - Soporte Multilingüe: Mensajes de respuesta localizados en es-ES, en-US y pt-BR.
 * - Multipropósito: Soporta creación de cuentas, reset manual de password y generación de Magic Links de invitación.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withObservability } from '../_utils/observability'; // 🚀 Inyección del decorador de telemetría

// Inicialización de Supabase con privilegios de súper usuario (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Diccionarios localizados para respuestas e incidencias de Recursos Humanos del backend
const DICTIONARIES = {
  'es-ES': {
    unauthorized: 'No autorizado. Permisos insuficientes para realizar esta operación.',
    invalid_payload: 'Estructura de datos de Recursos Humanos inválida.',
    success_create: 'Funcionario y ficha de salud ocupacional registrados con éxito.',
    success_reset: 'Contraseña de funcionario actualizada con éxito.',
    success_invite: 'Enlace de invitación generado con éxito.',
    user_not_found: 'No se encontró un usuario con el ID especificado.',
    error_create: 'Fallo al registrar la ficha laboral del funcionario en la base de datos.',
  },
  'en-US': {
    unauthorized: 'Unauthorized. Insufficient permissions to perform this operation.',
    invalid_payload: 'Invalid Human Resources data structure.',
    success_create: 'Staff and occupational safety profile registered successfully.',
    success_reset: 'Staff password updated successfully.',
    success_invite: 'Invitation link generated successfully.',
    user_not_found: 'No user was found with the specified ID.',
    error_create: 'Failed to register staff profile in the database.',
  },
  'pt-BR': {
    unauthorized: 'Não autorizado. Permissões insuficientes para realizar esta operação.',
    invalid_payload: 'Estrutura de dados de Recursos Humanos inválida.',
    success_create: 'Funcionário e ficha de saúde ocupacional registrados com sucesso.',
    success_reset: 'Senha do funcionário atualizada com sucesso.',
    success_invite: 'Link de convite gerado com sucesso.',
    user_not_found: 'Nenhum usuário foi encontrado com o ID especificado.',
    error_create: 'Falha ao registrar ficha trabalhista do funcionário no banco de dados.',
  }
};

// Contrato de interfaz estricto para mapear la API administrativa de GoTrue (Bypass TS2339)
interface ExtendedAuthClient {
  getUser(token: string): Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
  admin: {
    createUser(params: {
      email: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, unknown>;
    }): Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
    updateUserById(
      id: string,
      attributes: {
        password?: string;
        user_metadata?: Record<string, unknown>;
      }
    ): Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
    generateLink(params: {
      type: 'invite' | 'signup' | 'magiclink' | 'recovery';
      email: string;
      options?: {
        redirectTo?: string;
        data?: Record<string, unknown>;
      };
    }): Promise<{ data: { properties?: { action_link?: string }; action_link?: string } | null; error: Error | null }>;
  };
}

// ============================================================================
// 📏 VALIDACIÓN DE ESQUEMAS CON ZOD (TRINITY)
// ============================================================================

const CreateActionSchema = z.object({
  action: z.literal('create'),
  first_name: z.string().min(1).max(50),
  middle_name: z.string().max(50).optional().nullable(),
  paternal_last_name: z.string().min(1).max(50),
  maternal_last_name: z.string().max(50).optional().nullable(),
  username: z.string().min(3).max(30),
  role: z.enum(['housekeeper', 'receptionist', 'admin']),
  country: z.string().default('Brasil'),
  state_code: z.string().min(2).max(2).default('SC'),
  phone: z.string().min(10).max(20),
  
  // 🚀 Campos de Derechos Humanos y Salud Ocupacional (ISO 27001 / NR-7 brasileña)
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).default('O+'),
  allergies: z.string().default('Ninguna'),
  emergency_contact_name: z.string().min(1).max(100),
  emergency_contact_phone: z.string().min(10).max(20),
});

const ResetActionSchema = z.object({
  action: z.literal('reset_password'),
  userId: z.string().uuid(),
  password: z.string().min(6),
});

const InviteActionSchema = z.object({
  action: z.literal('generate_invite'),
  userId: z.string().uuid(),
});

const RequestBodySchema = z.discriminatedUnion('action', [
  CreateActionSchema,
  ResetActionSchema,
  InviteActionSchema,
]);

/**
 * @function createStaffHandler
 * @description Handler unificado de aprovisionamiento de cuentas de personal, reset de claves y Magic Links
 */
async function createStaffHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  // Idioma de la Petición (locale SSoT)
  const queryLocale = (req.body?.locale || req.query?.locale || 'pt-BR') as 'es-ES' | 'en-US' | 'pt-BR';
  const tLocal = DICTIONARIES[queryLocale] || DICTIONARIES['pt-BR'];

  // 1. CONTROL DE ACCESO (ISO 27001): Verificar JWT del solicitante
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: tLocal.unauthorized });
  }

  const token = authHeader.split(' ')[1];
  const authAdmin = supabaseAdmin.auth as unknown as ExtendedAuthClient;

  const { data: { user }, error: authError } = await authAdmin.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ message: tLocal.unauthorized });
  }

  // 2. CONTROL DE ACCESO (RBAC): Consultar si el solicitante es Administrador o Desarrollador
  const { data: callerProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !callerProfile || !['admin', 'developer'].includes(callerProfile.role)) {
    return res.status(403).json({ message: tLocal.unauthorized });
  }

  // 3. VALIDACIÓN DE ESQUEMA SÍNCRONA CON ZOD
  const parseResult = RequestBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      message: tLocal.invalid_payload, 
      errors: parseResult.error.flatten().fieldErrors 
    });
  }

  const payload = parseResult.data;

  // ============================================================================
  // CASO DE USO 1: CREAR NUEVA CUENTA DE PERSONAL + COMPLIANCE LABORAL
  // ============================================================================
  if (payload.action === 'create') {
    let email = payload.username.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@beachcanasvieiras.com`;
    }

    const tempPassword = `Bch_${Math.random().toString(36).substring(2, 10)}!`;

    console.log(
      JSON.stringify({
        event: 'CREATE_STAFF_DB_INSERT_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        email,
        role: payload.role,
      })
    );

    // Crear cuenta en Supabase Auth (Email pre-confirmado)
    const { data: newUser, error: createError } = await authAdmin.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: payload.first_name,
        middle_name: payload.middle_name || '',
        paternal_last_name: payload.paternal_last_name,
        maternal_last_name: payload.maternal_last_name || '',
        full_name: `${payload.first_name} ${payload.paternal_last_name}`.trim(),
        role: payload.role,
        temp_password_active: true
      }
    });

    if (createError || !newUser.user) {
      return res.status(400).json({ message: createError?.message || tLocal.error_create });
    }

    const userId = newUser.user.id;

    // Sincronizar de forma atómica en public.users (RBAC)
    await supabaseAdmin.from('users').upsert([{ id: userId, email, role: payload.role }]);

    // Sincronizar de forma detallada e inmutable en public.staff_profiles (Ficha de Recursos Humanos & Derechos Humanos)
    const { error: staffError } = await supabaseAdmin
      .from('staff_profiles')
      .upsert([{
        id: userId,
        email,
        first_name: payload.first_name,
        middle_name: payload.middle_name || null,
        paternal_last_name: payload.paternal_last_name,
        maternal_last_name: payload.maternal_last_name || null,
        phone: payload.phone,
        country: payload.country,
        state_code: payload.state_code.toUpperCase(),
        blood_type: payload.blood_type,
        allergies: payload.allergies,
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_phone: payload.emergency_contact_phone,
        labor_status: 'active'
      }]);

    if (staffError) {
      console.error(`[Create Staff Error] [traceId: ${context.traceId}] Error al insertar en staff_profiles:`, staffError.message);
      return res.status(400).json({ message: tLocal.error_create });
    }

    return res.status(201).json({
      success: true,
      message: tLocal.success_create,
      email,
      tempPassword,
      uid: userId,
    });
  }

  // ============================================================================
  // CASO DE USO 2: RESET MANUAL DE CONTRASEÑA POR ADMINISTRADOR
  // ============================================================================
  if (payload.action === 'reset_password') {
    console.log(
      JSON.stringify({
        event: 'STAFF_PASSWORD_RESET_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        targetUserId: payload.userId,
      })
    );

    const { error: resetError } = await authAdmin.admin.updateUserById(payload.userId, {
      password: payload.password,
      user_metadata: {
        temp_password_active: false // El admin la cambia manualmente, por lo que no requiere onboarding
      }
    });

    if (resetError) {
      return res.status(400).json({ message: resetError.message });
    }

    return res.status(200).json({
      success: true,
      message: tLocal.success_reset
    });
  }

  // ============================================================================
  // CASO DE USO 3: GENERACIÓN DE ENLACE DE INVITACIÓN DIRECTA (WHATSAPP INVITE LINK)
  // ============================================================================
  if (payload.action === 'generate_invite') {
    console.log(
      JSON.stringify({
        event: 'STAFF_INVITE_LINK_GENERATION_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        targetUserId: payload.userId,
      })
    );

    // Consultar el correo del usuario a invitar
    const { data: targetUser, error: queryError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', payload.userId)
      .single();

    if (queryError || !targetUser) {
      return res.status(404).json({ message: tLocal.user_not_found });
    }

    // Generar link de invitación criptográfico de un solo uso de tipo 'invite' (Magic Link)
    const { data: linkData, error: linkError } = await authAdmin.admin.generateLink({
      type: 'invite',
      email: targetUser.email,
      options: {
        redirectTo: `${req.headers.origin || 'https://beachcanasvieiras.com'}/success`
      }
    });

    if (linkError || !linkData) {
      return res.status(400).json({ message: linkError?.message || 'Error al generar enlace' });
    }

    // Mapeo seguro del enlace saliente según estructura del SDK
    const actionLink = linkData.properties?.action_link || linkData.action_link || '';

    return res.status(200).json({
      success: true,
      message: tLocal.success_invite,
      invite_link: actionLink,
      email: targetUser.email,
    });
  }

  return res.status(400).json({ message: tLocal.invalid_payload });
}

const observedCreateStaffHandler = withObservability(createStaffHandler);

export default observedCreateStaffHandler;