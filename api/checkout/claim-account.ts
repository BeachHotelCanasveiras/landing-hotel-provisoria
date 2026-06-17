/**
 * @file claim-account.ts
 * @description Endpoint administrativo seguro para reclamar perfiles de huéspedes pre-creados tras un pago exitoso.
 * - ISO 27001: Verificación de autenticidad de sesión de Stripe para evitar secuestro o spoofing de cuentas.
 * - PCI-DSS: Recuperación e integridad del email directamente desde la pasarela de pagos.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { sessionId, password } = req.body;

  if (!sessionId || !password) {
    return res.status(400).json({ message: 'Datos incompletos para activar la cuenta.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // 1. Recuperar sesión de Stripe para obtener el email verificado de la transacción
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'No se pudo verificar el correo electrónico de la transacción.' });
    }

    // 2. Obtener el UUID del usuario asociado en public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ message: 'No se encontró un perfil pre-creado para esta transacción.' });
    }

    // 3. Actualizar la contraseña e inhabilitar el estado temporal en auth.users
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: password,
        user_metadata: {
          temp_password_active: false // Desactiva la restricción de primer inicio
        }
      }
    );

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ success: true, message: 'Cuenta activada correctamente.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno de red';
    console.error('[Claim Account Error Critical]:', msg);
    return res.status(500).json({ message: msg });
  }
}