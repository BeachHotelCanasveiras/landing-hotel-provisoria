/**
 * @file retrieve.ts
 * @description Recupera de forma enriquecida y segura los datos de una sesión de Stripe para pre-llenar y mostrar el resumen de compra.
 * Refactorizado para Vercel Serverless (VercelRequest/VercelResponse) y libre de 'any' para ESLint v9.
 * - Smart Identity Manifesto: Expande line_items de Stripe para entregar el desglose financiero al cliente de forma síncrona.
 * - Lazy Initialization: Evita colapsos de importación ante variables no configuradas en producción.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Inicialización defensiva y perezosa de Stripe
 */
function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY no configurada en las variables de entorno de producción.');
    }
    stripeInstance = new Stripe(key, { 
      apiVersion: '2026-05-27.dahlia' 
    });
  }
  return stripeInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionId = req.query.session_id as string;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing session_id' });
    }

    const stripe = getStripe();

    // Recuperamos la sesión expandiendo de forma nativa los detalles financieros de line_items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    
    const lineItem = session.line_items?.data[0];
    const amountTotal = (session.amount_total || 0) / 100;
    const currency = session.currency?.toUpperCase() || 'BRL';

    return res.status(200).json({
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name || session.metadata?.guest_name || 'Huésped',
      room_id: session.metadata?.room_id,
      room_name: lineItem?.description || 'Habitación Reservada',
      check_in: session.metadata?.check_in,
      check_out: session.metadata?.check_out,
      total_price: amountTotal,
      currency: currency,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Retrieve Session Error]:', errorMessage);
    
    return res.status(500).json({ 
      message: errorMessage.includes('no configurada')
        ? 'Error administrativo de entorno en el servidor.'
        : errorMessage 
    });
  }
}