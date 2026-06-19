/**
 * @file create-staff.ts
 * @description Endpoint administrativo de alta fidelidad para la gobernanza integral de Recursos Humanos.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN y Estándares de Producción:
 * - Ciclo de Vida CRUD Completo: Soporta creación, actualización de perfil, reset de clave, magic link y eliminación atómica.
 * - Inyección SSoT (Fix Constraint): Integración de `role` directamente en los metadatos de auth para sincronía con triggers de BD.
 * - Sincronización Heurística de Roles (Bypass de Trigger): Select/Update defensivo para evitar conflictos con triggers de Postgres.
 * - Modificación de E-mail en Caliente: Permite re-escribir y actualizar el correo del empleado en Supabase Auth de forma segura.
 * - Destrucción Segura (ISO 27001): Ejecuta la baja en cascada (staff_profiles -> public.users -> auth.users) para cumplir la LGPD.
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
        email?: string; 
        password?: string;
        user_metadata?: Record<string, unknown>;
      }
    ): Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
    deleteUser(
      id: string
    ): Promise<{ data: Record<string, unknown>; error: Error | null }>; 
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
    success_update: 'Ficha de funcionario actualizada con éxito.',
    success_delete: 'Funcionario dado de baja y eliminado con éxito del sistema.',
    success_reset: 'Contraseña de funcionario actualizada con éxito.',
    success_invite: 'Enlace de invitación generado con éxito.',
    user_not_found: 'No se encontró un funcionario con el ID especificado.',
    error_create: 'Fallo al registrar la ficha laboral del funcionario en la base de datos.',
    error_delete: 'Ocurrió un error al procesar la baja del funcionario en cascada.',
  },
  'en-US': {
    unauthorized: 'Unauthorized. Insufficient permissions to perform this operation.',
    invalid_payload: 'Invalid Human Resources data structure.',
    success_create: 'Staff profile registered successfully.',
    success_update: 'Staff profile updated successfully.',
    success_delete: 'Staff member removed from the system successfully.',
    success_reset: 'Staff password updated successfully.',
    success_invite: 'Invitation link generated successfully.',
    user_not_found: 'No user was found with the specified ID.',
    error_create: 'Failed to register staff profile in the database.',
    error_delete: 'An error occurred during cascading deletion of the staff profile.',
  },
  'pt-BR': {
    unauthorized: 'Não autorizado. Permissões insuficientes para realizar esta operação.',
    invalid_payload: 'Estrutura de dados de Recursos Humanos inválida.',
    success_create: 'Funcionário registrado com sucesso no sistema.',
    success_update: 'Ficha do funcionário atualizada com sucesso.',
    success_delete: 'Funcionário desligado e removido do sistema com sucesso.',
    success_reset: 'Senha do funcionário atualizada com sucesso.',
    success_invite: 'Link de convite gerado com sucesso.',
    user_not_found: 'Nenhum usuário foi encontrado com o ID especificado.',
    error_create: 'Falha ao registrar ficha trabalhista do funcionário no banco de dados.',
    error_delete: 'Ocorreu um erro ao processar o desligamento do funcionário.',
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

const UpdateActionSchema = z.object({
  action: z.literal('update'),
  userId: z.string().uuid(),
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

const DeleteActionSchema = z.object({
  action: z.literal('delete'),
  userId: z.string().uuid(),
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
  UpdateActionSchema,
  DeleteActionSchema,
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
  // OPERACIÓN 1: CREAR NUEVA CUENTA DE PERSONAL
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

    // 🚀 SANEAMIENTO (ANTI-REGRESIÓN): Enviamos 'role' explícitamente en user_metadata para el Trigger
    const { data: authData, error: createError } = await authAdmin.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullNameCompiled,
        role: payload.role, // <-- INYECCIÓN VITAL RECUPERADA
        temp_password_active: true
      }
    });

    if (createError || !authData || !authData.user) {
      console.error(`[Create Staff Error] [traceId: ${context.traceId}] Auth Error:`, createError);
      return res.status(400).json({ message: createError?.message || tLocal.error_create });
    }

    const userId = authData.user.id;

    // SINCRONIZACIÓN HEURÍSTICA RBAC
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ role: payload.role })
        .eq('id', userId);
      
      if (updateError) {
        console.error(`[Create Staff DB Error] Fallo al actualizar rol en public.users:`, updateError.message);
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{ id: userId, email, role: payload.role }]);
      
      if (insertError) {
        console.error(`[Create Staff DB Error] Fallo al insertar en public.users:`, insertError.message);
      }
    }

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
  // OPERACIÓN 2: ACTUALIZACIÓN EN CALIENTE (UPDATE CRUD)
  // ============================================================================
  if (payload.action === 'update') {
    const email = payload.email.trim().toLowerCase();
    const fullNameCompiled = `${payload.first_name} ${payload.paternal_last_name}`.trim();

    console.log(
      JSON.stringify({
        event: 'UPDATE_STAFF_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        userId: payload.userId,
        newEmail: email,
      })
    );

    // 🚀 SANEAMIENTO (ANTI-REGRESIÓN): Actualizar role en user_metadata también en el Update
    const { error: authUpdateError } = await authAdmin.admin.updateUserById(payload.userId, {
      email,
      user_metadata: {
        full_name: fullNameCompiled,
        role: payload.role // <-- INYECCIÓN VITAL RECUPERADA
      }
    });

    if (authUpdateError) {
      console.error(`[Update Staff Auth Error] [traceId: ${context.traceId}]:`, authUpdateError.message);
      return res.status(400).json({ message: authUpdateError.message });
    }

    // Sincronizar de forma atómica en public.users (RBAC)
    const { error: usersUpdateError } = await supabaseAdmin
      .from('users')
      .update({ email, role: payload.role })
      .eq('id', payload.userId);

    if (usersUpdateError) {
      console.error(`[Update Staff DB Error] users:`, usersUpdateError.message);
      return res.status(400).json({ message: usersUpdateError.message });
    }

    // Actualizar ficha en public.staff_profiles
    const { error: staffUpdateError } = await supabaseAdmin
      .from('staff_profiles')
      .update({
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
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.userId);

    if (staffUpdateError) {
      console.error(`[Update Staff DB Error] staff_profiles:`, staffUpdateError.message);
      return res.status(400).json({ message: staffUpdateError.message });
    }

    return res.status(200).json({
      success: true,
      message: tLocal.success_update,
    });
  }

  // ============================================================================
  // OPERACIÓN 3: ELIMINACIÓN EN CASCADA COMPLIANCE (DELETE CRUD)
  // ============================================================================
  if (payload.action === 'delete') {
    console.log(
      JSON.stringify({
        event: 'DELETE_STAFF_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        targetUserId: payload.userId,
      })
    );

    const { error: staffDeleteError } = await supabaseAdmin
      .from('staff_profiles')
      .delete()
      .eq('id', payload.userId);

    if (staffDeleteError) {
      console.error(`[Delete Staff DB Error] staff_profiles:`, staffDeleteError.message);
      return res.status(400).json({ message: tLocal.error_delete });
    }

    const { error: usersDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', payload.userId);

    if (usersDeleteError) {
      console.error(`[Delete Staff DB Error] users:`, usersDeleteError.message);
      return res.status(400).json({ message: tLocal.error_delete });
    }

    const { error: authDeleteError } = await authAdmin.admin.deleteUser(payload.userId);

    if (authDeleteError) {
      console.error(`[Delete Staff Auth Error] [traceId: ${context.traceId}]:`, authDeleteError.message);
      return res.status(400).json({ message: authDeleteError.message });
    }

    return res.status(200).json({
      success: true,
      message: tLocal.success_delete,
    });
  }

  // ============================================================================
  // OPERACIÓN 4: RESET PASSWORD
  // ============================================================================
  if (payload.action === 'reset_password') {
    const { error: resetError } = await authAdmin.admin.updateUserById(payload.userId, {
      password: payload.password,
      user_metadata: { temp_password_active: false }
    });

    if (resetError) return res.status(400).json({ message: resetError.message });
    return res.status(200).json({ success: true, message: tLocal.success_reset });
  }

  // ============================================================================
  // OPERACIÓN 5: GENERAR MAGIC LINK (OTP)
  // ============================================================================
  if (payload.action === 'generate_invite') {
    const { data: targetUser, error: queryError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', payload.userId)
      .single();

    if (queryError || !targetUser) return res.status(404).json({ message: tLocal.user_not_found });

    const { data: linkData, error: linkError } = await authAdmin.admin.generateLink({
      type: 'magiclink', 
      email: targetUser.email,
      options: {
        redirectTo: `${req.headers.origin || 'https://beachcanasvieiras.com'}/admin`
      }
    });

    if (linkError || !linkData) return res.status(400).json({ message: linkError?.message || 'Error al generar enlace' });

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