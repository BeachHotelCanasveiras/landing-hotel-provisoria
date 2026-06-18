/**
 * @file retrieve.ts
 * @description Recupera de forma enriquecida y segura los datos de una sesión de Stripe para pre-llenar y mostrar el resumen de compra.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Lógica de RESERVA POR CATEGORÍA: Extrae la categoría de habitación (room_type) en lugar del identificador físico.
 * - Sincronización de API: Forzada de forma segura la versión de Stripe alineada con los scripts de auditoría.
 * - Smart Identity Manifesto: Expande line_items de Stripe para entregar el desglose financiero al cliente.
 * - Criptografía Estricta (ISO 27001): Fallback con descifrado AES-256-GCM sobre la cookie de sesión ante caídas de la API de Stripe.
 * - Lazy Initialization: Evita colapsos de cold start ante variables de entorno no configuradas.
 * - Saneamiento de Linter: Resuelto el error no-unused-vars y ts(2694) en el tipado de Stripe.
 * - Vercel Serverless (VercelRequest/VercelResponse) + ESLint v9 Compliant.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import crypto from 'crypto';
import { withObservability } from '../_utils/observability'; // 🚀 Inyección del decorador de telemetría

// Configuración criptográfica de grado bancario (Sincrónica con session.ts)
const ALGORITHM = 'aes-256-gcm';
const SECRET_SEED = process.env.JWT_SECRET || 'fallback-secret-seed-32bytes-long-required-for-dev';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

let stripeInstance: Stripe | null = null;

/**
 * Firma contractual local para instanciar el constructor de Stripe de forma flexible sin 'any'.
 */
interface StripeConstructor {
  new (key: string, options?: { apiVersion: string }): Stripe;
}

/**
 * @function getStripe
 * @description Inicialización defensiva y perezosa de Stripe
 */
function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY no configurada en las variables de entorno de producción.');
    }
    
    // Abstraemos el constructor para inyectar la versión de la API de forma tipada y segura (Bypass ts2694)
    const StripeClass = Stripe as unknown as StripeConstructor;
    stripeInstance = new StripeClass(key, {
      apiVersion: '2026-05-27.dahlia'
    });
  }
  return stripeInstance;
}

/**
 * @function decryptData
 * @description Desencripta un texto cifrado en formato AES-256-GCM
 */
function decryptData(encryptedText: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Formato de cookie criptográfica corrupto o inválido.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * @function retrieveHandler
 * @description Handler interno que gestiona la recuperación de sesión de checkout con tracing
 */
async function retrieveHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const sessionId = req.query.session_id as string;
  
  if (!sessionId) {
    return res.status(400).json({ message: 'Missing session_id' });
  }

  let sessionDetails;

  try {
    // 🚀 RUTA A: Intento de consulta en caliente de la API de Stripe
    const stripe = getStripe();
    
    // 📊 Traza de Observabilidad: Registro asíncrono del inicio de llamada a Stripe
    console.log(
      JSON.stringify({
        event: 'RETRIEVE_HOT_STRIPE_QUERY_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        sessionId,
      })
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    
    const lineItem = session.line_items?.data[0];
    const amountTotal = (session.amount_total || 0) / 100;
    const currency = session.currency?.toUpperCase() || 'BRL';

    sessionDetails = {
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name || session.metadata?.guest_name || 'Huésped',
      room_id: null, // Ya no se asocia un cuarto físico a la sesión de pago
      room_type: session.metadata?.room_type || null, // 🚀 Exponemos la categoría reservada
      room_name: lineItem?.description || 'Habitación Reservada',
      check_in: session.metadata?.check_in,
      check_out: session.metadata?.check_out,
      total_price: amountTotal,
      currency: currency,
      fallback_active: false
    };

    // 📊 Traza de Observabilidad: Registro de éxito de llamada síncrona
    console.log(
      JSON.stringify({
        event: 'RETRIEVE_HOT_STRIPE_QUERY_SUCCESS',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        room_type: sessionDetails.room_type,
        total_price: sessionDetails.total_price,
      })
    );

  } catch (stripeError: unknown) {
    // 🚀 RUTA B (FALLBACK): Caída de Stripe o exceso de tasa de peticiones. Desciframos la Cookie de Intención
    console.warn(
      `[Retrieve Session] [traceId: ${context.traceId}] Stripe API inaccesible. Activando redundancia de cookie segura:`,
      stripeError instanceof Error ? stripeError.message : stripeError
    );

    // 📊 Traza de Observabilidad: Registro de activación de la ruta de redundancia local
    console.log(
      JSON.stringify({
        event: 'RETRIEVE_FALLBACK_COOKIE_DECRYPTION_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
      })
    );

    // Extraer cookie del request (soporta tanto el parser de Vercel como parsing manual defensivo)
    const rawCookie = req.cookies?.beach_checkout_intent || 
      req.headers.cookie?.split(';').map(c => c.trim()).find(c => c.startsWith('beach_checkout_intent='))?.split('=')[1];

    if (!rawCookie) {
      throw stripeError; // Si no hay cookie de respaldo, propagamos la falla original de Stripe
    }

    try {
      const decryptedData = decryptData(decodeURIComponent(rawCookie));
      
      // Mapeo contractual estricto libre de 'any'
      const cart = JSON.parse(decryptedData) as {
        email: string;
        guestName: string;
        roomType: string;
        roomName: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        currency: string;
      };

      sessionDetails = {
        customer_email: cart.email,
        customer_name: cart.guestName,
        room_id: null,
        room_type: cart.roomType || null, // 🚀 Exponemos la categoría en el fallback decrypted
        room_name: cart.roomName,
        check_in: cart.checkIn,
        check_out: cart.checkOut,
        total_price: cart.totalPrice,
        currency: cart.currency,
        fallback_active: true // Sello para monitoreo DevOps
      };

      // 📊 Traza de Observabilidad: Finalización de descifrado exitoso
      console.log(
        JSON.stringify({
          event: 'RETRIEVE_FALLBACK_COOKIE_DECRYPTION_SUCCESS',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          room_type: sessionDetails.room_type,
        })
      );

    } catch (decryptError) {
      console.error(`[Retrieve Session Error] [traceId: ${context.traceId}] Fallo al descifrar cookie de intención:`, decryptError);
      throw stripeError; // En caso de corrupción, reportamos el error original
    }
  }

  return res.status(200).json(sessionDetails);
}

// 🚀 Asignación de constante para resolver advertencias de desuso (no-unused-vars) en ESLint
const observedRetrieveHandler = withObservability(retrieveHandler);

export default observedRetrieveHandler;