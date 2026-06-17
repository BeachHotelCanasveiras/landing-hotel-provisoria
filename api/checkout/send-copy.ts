/**
 * @file send-copy.ts
 * @description Endpoint seguro para encolar de forma asíncrona un duplicado del comprobante de reserva a un email alternativo.
 * - ISO 27001: Verificación de sesión e inserción inmutable en la cola de salida para entrega diferida (Outbox Pattern).
 * - PCI-DSS: Recuperación de datos desde Stripe sin almacenamiento local de tarjetas.
 * - Saneado: Satisface ESLint v9 (cero 'any') y cuenta con lazy-initialization contra colapsos de importación.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let stripeInstance: Stripe | null = null;
let supabaseInstance: SupabaseClient | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada en las variables de entorno.');
    stripeInstance = new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
  }
  return stripeInstance;
}

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Credenciales de base de datos ausentes en el servidor.');
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { sessionId, alternativeEmail } = req.body;

  if (!sessionId || !alternativeEmail) {
    return res.status(400).json({ message: 'Datos incompletos.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(alternativeEmail)) {
    return res.status(400).json({ message: 'La dirección de correo electrónico provista es inválida.' });
  }

  try {
    const stripe = getStripe();
    const supabase = getSupabase();

    // 1. Recuperar datos desde Stripe de forma segura
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    const guestName = session.metadata?.guest_name || 'Huésped';
    const checkIn = session.metadata?.check_in || 'N/A';
    const checkOut = session.metadata?.check_out || 'N/A';
    const roomName = session.line_items?.data[0]?.description || 'Habitación Reservada';
    const amountTotal = (session.amount_total || 0) / 100;
    const currency = session.currency?.toUpperCase() || 'BRL';

    // Calcular noches
    let nights = 1;
    if (checkIn !== 'N/A' && checkOut !== 'N/A') {
      const start = new Date(`${checkIn}T00:00:00`);
      const end = new Date(`${checkOut}T00:00:00`);
      nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    }

    // 2. Compilar Plantilla de Correo de Alta Fidelidad (Bilingüe - Coastal Aesthetic)
    const emailSubject = `Comprobante de Reserva: ${roomName} - Hotel Beach`;
    const emailHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprobante de Reserva</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
          .header { background-color: #141517; padding: 40px; text-align: center; }
          .logo { height: 35px; width: auto; }
          .content { padding: 40px; }
          .greeting { font-size: 20px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 8px; }
          .subtitle { font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 30px; }
          .details-card { background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 24px; margin-bottom: 30px; }
          .details-title { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 12px; }
          .detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #F3F4F6; padding: 12px 0; font-size: 13px; }
          .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
          .detail-label { color: #4B5563; font-weight: 500; }
          .detail-value { color: #111827; font-weight: 600; }
          .total-value { color: #D4A574; font-size: 16px; font-weight: 700; }
          .footer { text-align: center; padding: 30px 40px; border-t: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF; line-height: 1.6; }
          .footer-logo-sub { font-weight: 600; color: #4B5563; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto,w_400/v1/beach-hotel/logo/logo-main-light" alt="Hotel Beach Canasvieiras" />
          </div>
          <div class="content">
            <p class="greeting">Olá, ${guestName}</p>
            <p class="subtitle">Te compartimos la copia del comprobante de reserva correspondiente a tu próxima estadía frente al mar en Florianópolis.</p>
            
            <div class="details-card">
              <p class="details-title">Detalles de la Reserva</p>
              
              <div class="detail-row">
                <span class="detail-label">Habitación</span>
                <span class="detail-value">${roomName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-In</span>
                <span class="detail-value">${checkIn} (14:00h)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-Out</span>
                <span class="detail-value">${checkOut} (11:00h)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Noches</span>
                <span class="detail-value">${nights} noches</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monto Total</span>
                <span class="detail-value total-value">${currency} ${amountTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p class="footer-logo-sub">Hotel Beach Canasvieiras</p>
            <p>Avenida das Nações, 375, Canasvieiras, Florianópolis, SC, Brasil</p>
            <p>© 2026 Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Encolar síncronamente en public.email_queue para envío asíncrono robusto
    const { error: queueError } = await supabase
      .from('email_queue')
      .insert([{
        recipient_email: alternativeEmail.trim(),
        subject: emailSubject,
        html_content: emailHtmlContent,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        scheduled_at: new Date().toISOString()
      }]);

    if (queueError) throw queueError;

    return res.status(200).json({ success: true, message: 'Copia del voucher encolada con éxito.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al procesar la solicitud.';
    console.error('[Send Copy Error Critical]:', msg);
    return res.status(500).json({ message: 'Error interno al procesar el envío de la copia.' });
  }
}