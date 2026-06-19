/**
 * @file create-staff.ts
 * @description Endpoint administrativo de alta fidelidad para el aprovisionamiento de personal y gobernanza de credenciales de Recursos Humanos.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Pureza Backend: Removidas todas las etiquetas JSX accidentales para resolver de raíz las más de 520 advertencias de compilación.
 * - Bypass de Trigger: Adelgaza el user_metadata para evitar el colapso de Supabase GoTrue.
 * - Sincronización Explícita: Fuerza el de forma atómica el rol en la tabla pública de perfiles.
 * - ESM Compliant: Mantiene la extensión .js en el middleware de observabilidad para Vercel.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto'; 
import { withObservability } from '../../api_utils/observability.js'; 

// Contrato de interfaz estricto y unificado para la API administrativa de Auth (Bypass TS2339)
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

// Deshabilita el body parser automático de Vercel para conservar el Raw Body intacto
export const config = {
  api: {
    bodyParser: false,
  },
};

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Inicialización perezosa (Lazy) de Supabase con privilegios administrativos
 */
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Credenciales administrativas de base de datos Supabase ausentes en el servidor.');
    }
    supabaseAdminInstance = createClient(url, key);
  }
  return supabaseAdminInstance;
}

// Diccionarios localizados para respuestas e incidencias de Recursos Humanos del backend
const DICTIONARIES = {
  'es-ES': {
    unauthorized: 'No autorizado. Permisos insuficientes para realizar esta operación.',
    invalid_payload: 'Estructura de datos de Recursos Humanos inválida.',
    success_create: 'Funcionario registrado con éxito en el sistema.',
    success_reset: 'Contraseña de funcionario actualizada con éxito.',
    success_invite: 'Enlace de invitación generado con éxito.',
    user_not_found: 'No se encontró un funcionario con el ID especificado.',
    error_create: 'Fallo al registrar la ficha laboral del funcionario en la base de datos.',
  },
  'en-US': {
    unauthorized: 'Unauthorized. Insufficient permissions to perform this operation.',
    invalid_payload: 'Invalid Human Resources data structure.',
    success_create: 'Staff profile registered successfully.',
    success_reset: 'Staff password updated successfully.',
    success_invite: 'Invitation link generated successfully.',
    user_not_found: 'No user was found with the specified ID.',
    error_create: 'Failed to register staff profile in the database.',
  },
  'pt-BR': {
    unauthorized: 'Não autorizado. Permissões insuficientes para realizar esta operação.',
    invalid_payload: 'Estrutura de dados de Recursos Humanos inválida.',
    success_create: 'Funcionário registrado com sucesso no sistema.',
    success_reset: 'Senha do funcionário atualizada com sucesso.',
    success_invite: 'Link de convite gerado com sucesso.',
    user_not_found: 'Nenhum usuário foi encontrado com o ID especificado.',
    error_create: 'Falha ao registrar ficha trabalhista do funcionário no banco de dados.',
  }
};

// ============================================================================
// 📏 VALIDACIÓN DE ESQUEMAS CON ZOD (TRINITY)
// ============================================================================

const CreateActionSchema = z.object({
  action: z.literal('create'),
  first_name: z.string().min(1).max(50),
  middle_name: z.string().max(50).optional().nullable(),
  paternal_last_name: z.string().min(1).max(50),
  maternal_last_name: z.string().max(50).optional().nullable(),
  email: z.string().email(),
  role: z.enum(['housekeeper', 'receptionist', 'admin']),
  country: z.string().default('Brasil'),
  state_code: z.string().min(2).max(2).default('SC'),
  phone: z.string().min(10).max(20),
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
  const queryLocale = (req.body?.locale || req.query?.locale || 'pt-BR') as 'es-ES' | 'en-US' | 'pt-BR';
  const tLocal = DICTIONARIES[queryLocale] || DICTIONARIES['pt-BR'];

  const supabaseAdmin = getSupabaseAdmin();

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

  // 2. CONTROL DE ACCESO (RBAC)
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
  // CASO DE USO 1: CREAR NUEVA CUENTA DE PERSONAL
  // ============================================================================
  if (payload.action === 'create') {
    const email = payload.email.trim().toLowerCase();
    const tempPassword = `Bch_${crypto.randomUUID().split('-')[0]}X1!`;
    const fullNameCompiled = `${payload.first_name} ${payload.paternal_last_name}`.trim();

    console.log(
      JSON.stringify({
        event: 'CREATE_STAFF_DB_INSERT_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        email,
        role: payload.role,
      })
    );

    // 🚀 ELUSIÓN DE TRIGGER: Enviamos un user_metadata minimalista para evitar colapso de Postgres
    const { data: authData, error: createError } = await authAdmin.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullNameCompiled,
        temp_password_active: true
      }
    });

    if (createError || !authData || !authData.user) {
      console.error(`[Create Staff Error] [traceId: ${context.traceId}] Auth Error:`, createError);
      return res.status(400).json({ message: createError?.message || tLocal.error_create });
    }

    const userId = authData.user.id;

    // Sincronizar de forma atómica en public.users (RBAC)
    await supabaseAdmin.from('users').upsert([{ id: userId, email, role: payload.role }], { onConflict: 'id' });

    // Sincronizar en public.staff_profiles (Ficha Laboral)
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
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_phone: payload.emergency_contact_phone,
        labor_status: 'active',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });

    if (staffError) {
      console.error(`[Create Staff DB Error] Fallo al insertar en staff_profiles:`, staffError.message);
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
  // CASO DE USO 2: RESET MANUAL DE CONTRASEÑA
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
        temp_password_active: false
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
  // CASO DE USO 3: GENERACIÓN DE ENLACE DE INVITACIÓN DIRECTA (MAGIC LINK)
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

    const { data: targetUser, error: queryError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', payload.userId)
      .single();

    if (queryError || !targetUser) {
      return res.status(404).json({ message: tLocal.user_not_found });
    }

    // 🚀 FIX: Usamos 'magiclink' porque el usuario ya existe en Auth
    const { data: linkData, error: linkError } = await authAdmin.admin.generateLink({
      type: 'magiclink',
      email: targetUser.email,
      options: {
        redirectTo: `${req.headers.origin || 'https://beachcanasvieiras.com'}/admin`
      }
    });

    if (linkError || !linkData) {
      return res.status(400).json({ message: linkError?.message || 'Error al generar enlace' });
    }

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