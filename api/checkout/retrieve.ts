/**
 * @file retrieve.ts
 * @description Recupera de forma enriquecida y segura los datos de una sesión de Stripe para pre-llenar y mostrar el resumen de compra.
 * Refactorizado para Vercel Serverless (VercelRequest/VercelResponse) y libre de 'any' para ESLint v9.
 * Lógica de RESERVA POR CATEGORÍA:
 * - Desacoplamiento de ID físico: Extrae la categoría de habitación (`room_type`) en lugar del identificador físico.
 * - Smart Identity Manifesto: Expande line_items de Stripe para entregar el desglose financiero al cliente.
 * - Criptografía Estricta (ISO 27001): Implementa fallback con descifrado AES-256-GCM sobre la cookie de sesión ante caídas de la API de Stripe.
 * - Lazy Initialization: Evita colapsos de importación ante variables no configuradas en producción.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import crypto from 'crypto';

// Configuración criptográfica de grado bancario (Sincrónica con session.ts)
const ALGORITHM = 'aes-256-gcm';
const SECRET_SEED = process.env.JWT_SECRET || 'fallback-secret-seed-32bytes-long-required-for-dev';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

let stripeInstance: Stripe | null = null;

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
    stripeInstance = new Stripe(key, { 
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sessionId = req.query.session_id as string;
  
  if (!sessionId) {
    return res.status(400).json({ message: 'Missing session_id' });
  }

  try {
    let sessionDetails;

    try {
      // 🚀 RUTA A: Intento de consulta en caliente de la API de Stripe
      const stripe = getStripe();
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
    } catch (stripeError: unknown) {
      // 🚀 RUTA B (FALLBACK): Caída de Stripe. Desciframos la Cookie de Intención
      console.warn('[Retrieve Session] Stripe API inaccesible. Activando redundancia de cookie segura:', stripeError);

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
      } catch (decryptError) {
        console.error('[Retrieve Session Error] Fallo al descifrar cookie de intención:', decryptError);
        throw stripeError; // En caso de corrupción, reportamos el error original
      }
    }

    return res.status(200).json(sessionDetails);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Retrieve Session Error Critical]:', errorMessage);
    
    return res.status(500).json({ 
      message: errorMessage.includes('no configurada')
        ? 'Error administrativo de entorno en el servidor.'
        : errorMessage 
    });
  }
}