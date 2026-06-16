/**
 * @file process-mails.ts
 * @description Worker de backend asíncrono que procesa secuencialmente la cola de correos.
 * - Desacoplado: Consume los registros de la tabla 'email_queue' en Supabase.
 * - Anti-Spam: Aplica Staggering síncrono de 2 segundos para proteger el dominio.
 * - Idempotente: Marca el estado de envío antes de llamar a la API para evitar duplicidades.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Inicialización segura del cliente de base de datos con rol de servicio (Bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inicialización de la API de Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Contrato de interfaz estricto para evitar 'any' en el procesamiento de colas
interface EmailQueueRow {
  id: string;
  recipient_email: string;
  subject: string;
  html_content: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  attempts: number;
  max_attempts: number;
}

/**
 * Helper asíncrono para generar pausas controladas (Staggering)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Asegurar que la invocación sea segura (Vercel Cron autoriza con esta cabecera por defecto)
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
  if (!isCron) {
    return res.status(401).json({ message: 'No autorizado para ejecutar esta tarea.' });
  }

  if (!resend) {
    console.error('[Mail Worker] Error: RESEND_API_KEY no configurada en las variables de entorno de Vercel.');
    return res.status(500).json({ error: 'Configuración de correos incompleta en el servidor.' });
  }

  try {
    // 1. Obtener un lote pequeño (Batch de 5 correos) para no saturar las cuotas del plan gratuito
    const { data: rawBatch, error: fetchError } = await supabase
      .from('email_queue')
      .select('id, recipient_email, subject, html_content, status, attempts, max_attempts')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    if (fetchError) {
      throw fetchError;
    }

    const batch = (rawBatch || []) as EmailQueueRow[];

    if (batch.length === 0) {
      return res.status(200).json({ message: 'Cola de correos vacía. Sin pendientes.' });
    }

    console.log(`[Mail Worker] Iniciando procesamiento de lote de ${batch.length} correos...`);

    for (const email of batch) {
      // 2. BLOQUEO DE IDEMPOTENCIA: Marcar como enviado/enviando para evitar que otro Worker concurrente lo tome
      const { error: lockError } = await supabase
        .from('email_queue')
        .update({ status: 'sending', updated_at: new Date().toISOString() })
        .eq('id', email.id);

      if (lockError) {
        console.error(`[Mail Worker] No se pudo bloquear el correo ${email.id}:`, lockError.message);
        continue;
      }

      try {
        // 3. Envío físico a través de Resend
        const { error: sendError } = await resend.emails.send({
          from: 'Hotel Beach Canasvieiras <reservas@beachcanasvieiras.com>',
          to: [email.recipient_email],
          subject: email.subject,
          html: email.html_content,
          headers: {
            'X-Entity-Ref-ID': crypto.randomUUID() // Previene duplicidad de hilos de correo
          }
        });

        if (sendError) {
          throw sendError;
        }

        // 4. ÉXITO: Actualizar registro como enviado
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('id', email.id);

        console.log(`[Mail Worker] Correo enviado exitosamente a ${email.recipient_email}`);

        // 5. STAGGERING: Pausa síncrona de 2 segundos para cuidar la reputación de la IP y evitar filtros SPAM
        await delay(2000);

      } catch (sendErr: unknown) {
        const sendErrorMessage = sendErr instanceof Error ? sendErr.message : 'Error en API Resend';
        const nextAttempts = email.attempts + 1;
        const isFailedDefinitively = nextAttempts >= email.max_attempts;

        console.error(`[Mail Worker] Fallo en envío a ${email.recipient_email}:`, sendErrorMessage);

        // 5. REINTENTOS O FALLO DEFINITIVO: Volver a poner en pending o marcar como failed
        await supabase
          .from('email_queue')
          .update({
            status: isFailedDefinitively ? 'failed' : 'pending',
            attempts: nextAttempts,
            error_log: sendErrorMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);
      }
    }

    return res.status(200).json({ success: true, processed: batch.length });

  } catch (error: unknown) {
    const mainErrorMessage = error instanceof Error ? error.message : 'Error interno de red en el worker';
    console.error('[Mail Worker Critical]:', mainErrorMessage);
    return res.status(500).json({ error: mainErrorMessage });
  }
}