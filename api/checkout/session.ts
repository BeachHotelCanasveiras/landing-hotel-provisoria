/**
 * @file session.ts
 * @description Endpoint para inicializar sesiones de pago en Stripe.
 * Refactorizado para Vercel Serverless (VercelRequest/VercelResponse), libre de 'any' para ESLint v9 y protección inmutable.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Stripe sincronizada con la API exacta de tu stack
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

  try {
    const { roomType, roomName, checkIn, checkOut, guestName, email } = req.body;

    // 1. Validación de campos obligatorios
    if (!roomType || !checkIn || !checkOut || !email) {
      return res.status(400).json({ message: 'Datos de reserva o correo electrónico incompletos.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Dirección de correo electrónico con formato inválido.' });
    }

    // 2. Normalización de fechas y validación de fronteras (Previene Date-Tampering)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer a medianoche de hoy local

    // Forzar lectura en huso horario local para evitar desfases de día por desfase UTC
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Formato de fecha inválido en el servidor.' });
    }

    if (start < today) {
      return res.status(400).json({ message: 'La fecha de entrada no puede ser en el pasado.' });
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ message: 'La fecha de salida debe ser estrictamente posterior a la entrada.' });
    }

    // 3. Autoridad del Servidor: Recuperar tarifa real desde la base de datos
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, price_per_night')
      .eq('type', roomType)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ message: 'La habitación seleccionada no se encuentra disponible en nuestro catálogo.' });
    }

    const totalPrice = Number(room.price_per_night) * nights;

    // 4. Inicialización segura de Checkout con Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: email.trim(), // Pre-llenado de pasarela para fricción cero (CRO)
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
      success_url: `${req.headers.origin || 'https://beachcanasvieiras.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://beachcanasvieiras.com'}/`,
      metadata: { 
        room_id: room.id.toString(), 
        check_in: checkIn, 
        check_out: checkOut, 
        guest_name: guestName ? guestName.trim() : 'Invitado'
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: unknown) {
    // Auditamos el error internamente con toda la traza de sistema sin usar explicit 'any'
    console.error('[Checkout Session Error Critical]:', error);
    
    // Respondemos con un mensaje sanitizado para el cliente final (ISO 27001 Compliance)
    return res.status(500).json({ message: 'No se pudo procesar la solicitud de reserva debido a una inconsistencia del sistema.' });
  }
}