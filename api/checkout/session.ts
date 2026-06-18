/**
 * @file session.ts
 * @description Endpoint seguro para inicializar sesiones de pago en Stripe.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN y el paradigma de RESERVA POR CATEGORÍA:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Desacoplamiento de ID físico: No se pre-asigna una habitación física en la reserva.
 * - Validación por Tipo: Se obtiene el precio base del tipo de habitación seleccionado.
 * - Lazy Initialization: Evita colapsos de cold start ante variables de entorno no configuradas.
 * - Timezone-Aware Validation: Permite reservas del mismo día (Walk-ins) en GMT-3 sin conflicto de servidor UTC.
 * - Smart Identity Manifesto: Almacena el 'locale' de i18n del huésped en la metadata de Stripe.
 * - Criptografía Estricta (ISO 27001): Compila, encripta (AES-256-GCM) y setea el estado del carrito en una cookie HttpOnly segura.
 * - Vercel Serverless (VercelRequest/VercelResponse) + ESLint v9 Compliant.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto'; 
import { withObservability } from '../utils/observability'; // 🚀 Inyección del decorador de telemetría

// Configuración criptográfica de grado bancario
const ALGORITHM = 'aes-256-gcm';
const SECRET_SEED = process.env.JWT_SECRET || 'fallback-secret-seed-32bytes-long-required-for-dev';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

let stripeInstance: Stripe | null = null;
let supabaseInstance: SupabaseClient | null = null;

/**
 * Encripta un texto utilizando AES-256-GCM
 */
function encryptData(text: string): string {
  const iv = crypto.randomBytes(12); // Vector de inicialización estándar de 12 bytes para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Retorna el payload formateado de forma segura: iv:authTag:contenidoEncriptado
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Inicialización defensiva de Stripe
 */
function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY no configurada en las variables de entorno de producción.');
    }
    // 🚀 Saneamiento: Se remueve la versión de API futura que provocaba colapsos de inicio.
    // El SDK usará automáticamente su versión por defecto interna y segura compatible con el tipado compilado.
    stripeInstance = new Stripe(key);
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

/**
 * @function sessionHandler
 * @description Handler interno de creación de sesiones con rastreo de traceId
 */
async function sessionHandler(
  req: VercelRequest, 
  res: VercelResponse, 
  context: { traceId: string }
) {
  const { roomType, roomName, checkIn, checkOut, guestName, email, locale } = req.body;

  if (!roomType || !checkIn || !checkOut || !email) {
    return res.status(400).json({ message: 'Datos de reserva o correo electrónico incompletos.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Dirección de correo electrónico con formato inválido.' });
  }

  // Obtener la fecha actual exacta en el huso horario oficial del hotel (America/Sao_Paulo) en formato YYYY-MM-DD
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

  // Saneamiento de idioma preferido (locale SSoT)
  const targetLocale = ['es-ES', 'en-US', 'pt-BR'].includes(locale) ? locale : 'es-ES';

  // Carga de instancias de red seguras en caliente
  const stripe = getStripe();
  const supabase = getSupabase();

  // 📊 Traza de Observabilidad: Registro asíncrono del cálculo de tarifas
  console.log(
    JSON.stringify({
      event: 'CHECKOUT_TARIFF_CALCULATION',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      roomType,
      nights,
    })
  );

  // 🚀 LÓGICA POR CATEGORÍA: Obtener la tarifa base de este TIPO de cuarto sin pre-asignar ID físico
  const { data: roomRate, error: rateError } = await supabase
    .from('rooms')
    .select('price_per_night')
    .eq('type', roomType)
    .limit(1)
    .maybeSingle();

  if (rateError || !roomRate) {
    return res.status(404).json({ 
      message: `No se encontró configuración de tarifas para la categoría: ${roomType}` 
    });
  }

  const totalPrice = Number(roomRate.price_per_night) * nights;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_creation: 'always',
    customer_email: email.trim(),
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: { 
          name: `Reserva: ${roomName}`, 
          description: `${nights} noches (${roomType.toUpperCase()})` 
        },
        unit_amount: Math.round(totalPrice * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${req.headers.origin || 'https://beachcanasvieiras.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin || 'https://beachcanasvieiras.com'}/`,
    // 🔒 METADATOS DESACOPLADOS: Guardamos room_type en lugar del room_id físico
    metadata: { 
      room_type: roomType, 
      check_in: checkIn, 
      check_out: checkOut, 
      guest_name: guestName ? guestName.trim() : 'Invitado',
      locale: targetLocale 
    },
  });

  // 🔒 SERIALIZACIÓN Y ENCRIPTADO DEL CARRITO DE COMPRA (Smart Identity Manifesto)
  const cartData = JSON.stringify({
    roomType,
    roomName,
    checkIn,
    checkOut,
    totalPrice,
    currency: 'BRL',
    email: email.trim(),
    guestName: guestName ? guestName.trim() : 'Invitado',
    locale: targetLocale
  });

  const encryptedCart = encryptData(cartData);
  const cookieMaxAge = 60 * 30; // 30 minutos de vida útil (Perfecto para transacciones)

  // Setear cabecera HttpOnly, Secure y SameSite=Lax para retorno de Stripe
  res.setHeader('Set-Cookie', `beach_checkout_intent=${encryptedCart}; Path=/; Max-Age=${cookieMaxAge}; HttpOnly; Secure; SameSite=Lax`);

  return res.status(200).json({ url: session.url });
}

// 🚀 Exportamos el endpoint envuelto de forma asíncrona con el decorador de telemetría y seguridad
export default withObservability(sessionHandler);