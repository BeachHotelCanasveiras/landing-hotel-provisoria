/**
 * @file session.ts
 * @description Endpoint para inicializar sesiones de pago en Stripe.
 * Refactorizado para compatibilidad Vercel/Express y corrección de tipos.
 */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Inicialización corregida con el sufijo exacto exigido por los tipos de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { roomType, roomName, checkIn, checkOut, guestName } = req.body;

    // Validación de entrada básica
    if (!roomType || !checkIn || !checkOut) {
      throw new Error('Datos de reserva incompletos.');
    }

    // Autoridad del servidor: Validación en Supabase
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, price_per_night')
      .eq('type', roomType)
      .single();

    if (roomError || !room) throw new Error('Habitación no disponible.');

    // Cálculo inmutable de precio
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    if (nights <= 0) throw new Error('Rango de fechas inválido.');
    
    const totalPrice = Number(room.price_per_night) * nights;

    // Creación de sesión
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_creation: 'always',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { 
            name: `Reserva: ${roomName}`, 
            description: `${nights} noches` 
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
      metadata: { 
        room_id: room.id.toString(), 
        check_in: checkIn, 
        check_out: checkOut, 
        guest_name: guestName || 'Invitado'
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[Checkout Session Error]:', error);
    return res.status(500).json({ message: error.message });
  }
}