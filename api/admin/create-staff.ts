/**
 * @file create-staff.ts
 * @description Endpoint administrativo para la creación automatizada de personal del hotel.
 * - ISO 27001: Verificación estricta de JWT de administrador para prevenir escalada de privilegios.
 * - SaaS Ready: Normalización automática de correos corporativos y contraseñas temporales.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase con privilegios de súper usuario (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. CONTROL DE ACCESO (ISO 27001): Verificar JWT del solicitante
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Falta token de autorización' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' });
    }

    // 2. CONTROL DE ACCESO (RBAC): Consultar si el solicitante es Administrador o Desarrollador
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile || !['admin', 'developer'].includes(callerProfile.role)) {
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

    // 4. CREACIÓN EN SUPABASE AUTH (Bypasseando confirmación SMTP)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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

    return res.status(201).json({
      success: true,
      email,
      tempPassword,
      uid: newUser.user?.id
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno de red';
    console.error('[Create Staff Endpoint Error]:', errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
}