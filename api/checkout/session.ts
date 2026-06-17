/**
 * @file session.ts
 * @description Endpoint seguro para inicializar sesiones de pago en Stripe.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Lazy Initialization: Evita colapsos de cold start ante variables de entorno no configuradas.
 * - Timezone-Aware Validation: Permite reservas del mismo día (Walk-ins) en GMT-3 sin conflicto de servidor UTC.
 * - Algoritmo de asignación preventiva: Soporta múltiples habitaciones físicas del mismo tipo (limit 1).
 * - Vercel Serverless (VercelRequest/VercelResponse) + ESLint v9 Compliant.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Contrato de interfaz estricto para inicialización perezosa de Stripe
let stripeInstance: Stripe | null = null;
let supabaseInstance: SupabaseClient | null = null;

/**
 * Inicialización defensiva de Stripe
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

/**
 * Inicialización defensiva de Supabase
 */
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Credenciales de base de datos Supabase ausentes o incompletas en producción.');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { roomType, roomName, checkIn, checkOut, guestName, email } = req.body;

    if (!roomType || !checkIn || !checkOut || !email) {
      return res.status(400).json({ message: 'Datos de reserva o correo electrónico incompletos.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Dirección de correo electrónico con formato inválido.' });
    }

    // 🚀 RESOLUCIÓN DE BUG DE ZONA HORARIA (Walk-in Bookings)
    // Obtenemos la fecha actual exacta en el huso horario oficial del hotel (America/Sao_Paulo) en formato YYYY-MM-DD
    const hotelTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    if (checkIn < hotelTodayStr) {
      return res.status(400).json({ message: 'La fecha de entrada no puede ser en el pasado.' });
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Formato de fecha inválido en el servidor.' });
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ message: 'La fecha de salida debe ser estrictamente posterior a la entrada.' });
    }

    // Carga de instancias de red seguras en caliente
    const stripe = getStripe();
    const supabase = getSupabase();

    // 🚀 ASIGNACIÓN FÍSICA PREVENTIVA: Buscar el primer cuarto disponible para congelar tarifa
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, price_per_night')
      .eq('type', roomType)
      .eq('status', 'available')
      .limit(1)
      .maybeSingle();

    if (roomError || !room) {
      return res.status(404).json({ 
        message: 'No hay habitaciones físicas disponibles para esta categoría en las fechas seleccionadas.' 
      });
    }

    const totalPrice = Number(room.price_per_night) * nights;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: email.trim(),
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
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado al inicializar pasarela';
    console.error('[Checkout Session Error Critical]:', errorMessage);
    
    // Siempre responde en formato JSON (Garantiza lectura en BookingDialog)
    return res.status(500).json({ 
      message: errorMessage.includes('no configurada') || errorMessage.includes('Supabase')
        ? 'Error administrativo de entorno en el servidor.'
        : 'Inconsistencia de red al procesar la solicitud de reserva.' 
    });
  }
}