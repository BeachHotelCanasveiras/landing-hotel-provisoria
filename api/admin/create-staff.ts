/**
 * @file create-staff.ts
 * @description Endpoint administrativo para la creación automatizada de personal del hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - ISO 27001: Verificación estricta de JWT de administrador para prevenir escalada de privilegios.
 * - SaaS Ready: Normalización automática de correos corporativos y contraseñas temporales.
 * - Tipo Saneado: Saneado el error TS2339 inyectando la interfaz ExtendedAuthClient sin recurrir a 'any'.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { withObservability } from '../_utils/observability'; // 🚀 Inyección del decorador de telemetría

// Inicialización de Supabase con privilegios de súper usuario (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  };
}

/**
 * @function createStaffHandler
 * @description Handler interno que gestiona la creación de cuentas de personal con tracing de traceId
 */
async function createStaffHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  // 1. CONTROL DE ACCESO (ISO 27001): Verificar JWT del solicitante
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error(`[Create Staff Error] [traceId: ${context.traceId}] Token de autorización ausente en la cabecera.`);
    return res.status(401).json({ message: 'Falta token de autorización' });
  }

  const token = authHeader.split(' ')[1];
  
  // Asertar de forma segura el cliente al contrato administrativo de GoTrue
  const authAdmin = supabaseAdmin.auth as unknown as ExtendedAuthClient;

  // 📊 Traza de Observabilidad: Inicio de verificación de privilegios del administrador
  console.log(
    JSON.stringify({
      event: 'CREATE_STAFF_AUTH_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
    })
  );

  const { data: { user }, error: authError } = await authAdmin.getUser(token);
  if (authError || !user) {
    console.error(`[Create Staff Error] [traceId: ${context.traceId}] Sesión inválida o expirada en autenticación.`);
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }

  // 2. CONTROL DE ACCESO (RBAC): Consultar si el solicitante es Administrador o Desarrollador
  const { data: callerProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !callerProfile || !['admin', 'developer'].includes(callerProfile.role)) {
    console.error(`[Create Staff Error] [traceId: ${context.traceId}] Intento de creación de personal por usuario no autorizado (id: ${user.id}).`);
    return res.status(403).json({ message: 'Privilegios insuficientes para crear personal.' });
  }

  const { username, fullName, role } = req.body;

  if (!username || !fullName || !role) {
    return res.status(400).json({ message: 'Datos incompletos.' });
  }

  // 3. NORMALIZACIÓN DE CREDENCIALES (Email Corporativo SSoT)
  let email = username.trim().toLowerCase();
  if (!email.includes('@')) {
    email = `${email}@beachcanasvieiras.com`;
  }

  // Generar contraseña temporal segura de forma algorítmica
  const tempPassword = `Bch_${Math.random().toString(36).substring(2, 10)}!`;

  // 📊 Traza de Observabilidad: Creación de cuenta en Supabase Auth
  console.log(
    JSON.stringify({
      event: 'CREATE_STAFF_DB_INSERT_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      email,
      role,
    })
  );

  // 4. CREACIÓN EN SUPABASE AUTH (Bypasseando confirmación SMTP)
  const { data: newUser, error: createError } = await authAdmin.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Evita que el empleado tenga que confirmar por correo
    user_metadata: {
      full_name: fullName.trim(),
      role: role,
      temp_password_active: true // Forzará el cambio en el primer inicio de sesión
    }
  });

  if (createError) {
    return res.status(400).json({ message: createError.message });
  }

  // 📊 Traza de Observabilidad: Finalización del proceso de creación
  console.log(
    JSON.stringify({
      event: 'CREATE_STAFF_SUCCESS',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      email,
      role,
      uid: newUser.user?.id,
    })
  );

  return res.status(201).json({
    success: true,
    email,
    tempPassword,
    uid: newUser.user?.id
  });
}

// 🚀 Exportamos el endpoint envuelto de forma asíncrona con el decorador de telemetría y seguridad
export default withObservability(createStaffHandler);