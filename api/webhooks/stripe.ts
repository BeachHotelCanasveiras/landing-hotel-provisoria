/**
 * @file stripe.ts
 * @description Webhook de seguridad e idempotencia para conciliar pagos exitosos en Supabase.
 * - ISO 27001: Deduplicación a nivel lógico y lectura segura de firmas criptográficas.
 * - PCI-DSS: Manejo inmutable de transacciones sin exposición de PII.
 */
import { Request, Response } from 'express';
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
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @function getRawBody
 * @description Lee asíncronamente el flujo (stream) del request para reconstruir el Buffer original.
 * @param {any} readable - Objeto Request de entrada.
 * @returns {Promise<Buffer>} Buffer sin procesar para Stripe.
 */
async function getRawBody(readable: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * @function handler
 * @description Orquestador del Webhook de Stripe.
 */
export default async function handler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    console.error('[Webhook Error] Firma de Stripe ausente en las cabeceras.');
    return res.status(400).send('Webhook Error: Stripe signature is missing.');
  }

  let event: Stripe.Event;

  try {
    // Reconstruimos el raw body de forma asíncrona y segura
    const rawBody = await getRawBody(req);
    
    event = stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[Webhook Error] Fallo en constructEvent: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Conciliación del Checkout Completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const roomId = parseInt(session.metadata?.room_id || '0');
    const checkIn = session.metadata?.check_in;
    const checkOut = session.metadata?.check_out;

    if (!roomId || !checkIn || !checkOut) {
      console.error('[Webhook Error] Datos incompletos en la metadata de Stripe:', session.metadata);
      return res.status(400).send('Webhook Error: Incomplete metadata.');
    }

    try {
      // 1. DEDUPLICACIÓN / IDEMPOTENCIA (ISO 27001 - Integridad de datos)
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

      // Si ya existe la reserva, respondemos con éxito pero omitimos la inserción (Idempotente)
      if (existingBooking) {
        console.warn(`[Webhook Duplicate Warning] Reserva id: ${existingBooking.id} ya conciliada previamente.`);
        return res.status(200).json({ received: true, deduplicated: true });
      }

      // 2. Inserción inmutable de la reserva conciliada
      const { error: insertError } = await supabase.from('bookings').insert([{
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        total_price: (session.amount_total || 0) / 100,
        status: 'confirmed'
      }]);

      if (insertError) {
        throw insertError;
      }

      console.log(`[Webhook Success] Pago e inserción de reserva procesados correctamente.`);
    } catch (dbError: any) {
      console.error('[Webhook DB Error Critical]:', dbError.message);
      return res.status(500).send('Error interno de base de datos durante la conciliación');
    }
  }

  return res.status(200).json({ received: true });
}