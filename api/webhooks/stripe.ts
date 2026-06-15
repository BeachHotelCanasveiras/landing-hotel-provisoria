/**
 * @file stripe.ts
 * @description Webhook de seguridad para conciliar pagos exitosos en Supabase.
 * Refactorizado para Express y compatibilidad de tipos Stripe.
 */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  
  // En Express, el body suele ser consumido por middlewares. 
  // Debemos asegurarnos de obtener el buffer raw. 
  // Esta implementación asume que el body se recibe como buffer en el handler.
  const rawBody = req.body; 
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[Webhook Error] Firma inválida: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Inserción inmutable en base de datos
    const { error } = await supabase.from('bookings').insert([{
      room_id: parseInt(session.metadata?.room_id || '0'),
      check_in: session.metadata?.check_in,
      check_out: session.metadata?.check_out,
      total_price: (session.amount_total || 0) / 100,
      status: 'confirmed'
    }]);

    if (error) {
      console.error('[Webhook DB Error]:', error);
      return res.status(500).send('Error al registrar reserva');
    }
  }

  return res.status(200).json({ received: true });
}