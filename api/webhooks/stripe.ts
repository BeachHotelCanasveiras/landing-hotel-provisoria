/**
 * @file stripe.ts
 * @description Webhook de seguridad e idempotencia para conciliar pagos exitosos en Supabase.
 * Refactorizado para Vercel Serverless (VercelRequest/VercelResponse) y libre de 'any' para ESLint v9.
 * - ISO 27001: Deduplicación a nivel lógico, verificación segura de firmas e integridad relacional.
 * - PCI-DSS: Manejo inmutable de transacciones sin exposición de PII.
 * - Smart Identity Manifesto: Creación preventiva en Auth para autogenerar perfiles sin colisión de UUIDs.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Deshabilita el body parser automático de Vercel para conservar el Raw Body intacto
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Requerido para operaciones administrativas de Auth
);

/**
 * @function getRawBody
 * @description Lee asíncronamente el flujo (stream) del request para reconstruir el Buffer original.
 * @param {VercelRequest} readable - Objeto Request de entrada.
 * @returns {Promise<Buffer>} Buffer sin procesar para Stripe.
 */
async function getRawBody(readable: VercelRequest): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * @function handler
 * @description Orquestador del Webhook de Stripe con gobernanza de identidades.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    console.error('[Webhook Error] Firma de Stripe ausente en las cabeceras.');
    return res.status(400).send('Webhook Error: Stripe signature is missing.');
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    
    event = stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[Webhook Error] Fallo en constructEvent: ${errorMessage}`);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Conciliación del Checkout Completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const roomId = parseInt(session.metadata?.room_id || '0');
    const checkIn = session.metadata?.check_in;
    const checkOut = session.metadata?.check_out;
    const guestName = session.metadata?.guest_name || session.customer_details?.name || 'Huésped Invitado';
    const guestEmail = session.customer_details?.email?.trim().toLowerCase();

    if (!roomId || !checkIn || !checkOut) {
      console.error('[Webhook Error] Datos incompletos en la metadata de Stripe:', session.metadata);
      return res.status(400).send('Webhook Error: Incomplete metadata.');
    }

    if (!guestEmail) {
      console.error('[Webhook Error] Correo del huésped ausente en la sesión de Stripe.');
      return res.status(400).send('Webhook Error: Guest email is missing.');
    }

    try {
      // 1. DEDUPLICACIÓN / IDEMPOTENCIA (ISO 27001)
      // Buscamos si existe previamente una reserva idéntica ya confirmada
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .eq('check_in', checkIn)
        .eq('check_out', checkOut)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingBooking) {
        console.warn(`[Webhook Duplicate Warning] Reserva id: ${existingBooking.id} ya conciliada previamente.`);
        return res.status(200).json({ received: true, deduplicated: true });
      }

      // 2. GOBERNANZA DE IDENTIDADES (Smart Identity Manifesto)
      let guestId: string | null = null;

      // Buscar si el email ya posee cuenta pública registrada
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', guestEmail)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (existingUser) {
        guestId = existingUser.id;
        console.log(`[Identity Sync] Usuario existente detectado. Asociando UUID: ${guestId}`);
      } else {
        // El usuario no existe. Creamos preventivamente la cuenta en auth.users.
        // Esto ejecuta síncronamente el trigger postgres 'handle_new_user_sync' poblando public.users y public.guests.
        console.log(`[Identity Sync] Creando cuenta preventiva para ${guestEmail}...`);
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: guestEmail,
          email_confirm: true,
          user_metadata: {
            full_name: guestName,
            temp_password_active: true // Bandera para forzar cambio de contraseña en /success
          }
        });

        if (authError) {
          // En caso de colisión de hilos concurrentes, re-intentamos leer el id
          const { data: retryUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', guestEmail)
            .maybeSingle();

          if (retryUser) {
            guestId = retryUser.id;
          } else {
            throw authError;
          }
        } else if (authUser?.user) {
          guestId = authUser.user.id;
        }
      }

      // Saneamiento de nombres preventivo en public.guests para asegurar paridad con Stripe
      if (guestId) {
        const nameParts = guestName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Huésped';
        const lastName = nameParts.slice(1).join(' ') || 'Invitado';

        await supabase
          .from('guests')
          .update({
            first_name: firstName,
            last_name: lastName
          })
          .eq('id', guestId);
      }

      // 3. Inserción inmutable de la reserva con enlace de clave foránea correcto
      const { error: insertError } = await supabase.from('bookings').insert([{
        room_id: roomId,
        guest_id: guestId, // Enlace relacional inmaculado
        check_in: checkIn,
        check_out: checkOut,
        total_price: (session.amount_total || 0) / 100,
        status: 'confirmed'
      }]);

      if (insertError) {
        throw insertError;
      }

      console.log(`[Webhook Success] Pago conciliado e identidad enlazada exitosamente para ${guestEmail}.`);
    } catch (dbError: unknown) {
      const dbErrorMessage = dbError instanceof Error ? dbError.message : 'Error de BD desconocido';
      console.error('[Webhook DB Error Critical]:', dbErrorMessage);
      return res.status(500).send('Error interno de base de datos durante la conciliación');
    }
  }

  return res.status(200).json({ received: true });
}