/**
 * @file mail.ts
 * @description Servicio de encolamiento de correos transaccionales para el ecosistema Beach Hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación SToS (Single Source of Truth): Inyección de sender_name (fromName) en la tabla email_queue.
 * - Compatibilidad Universal: Ejecución de telemetría de rendimiento segura en navegador y SSR.
 * - Observabilidad: Registra un log estructurado JSON de encolado con medición de alta resolución.
 * - Resiliencia: Desacoplamiento total para evitar bloqueos transaccionales en el cliente.
 */

import { supabase } from '@/lib/supabase';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

interface EnqueueResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Encola un correo electrónico en la base de datos de Supabase para su procesamiento asíncrono.
 * @param {EmailPayload} payload - Datos del destinatario, asunto y contenido HTML del mensaje.
 * @returns {Promise<EnqueueResponse>} Estado de la operación e identificador de rastreo.
 */
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  fromName = 'Concierge' 
}: EmailPayload): Promise<EnqueueResponse> {
  // Captura de tiempo de alta resolución compatible con entornos Browser y SSR
  const startTimer = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    // 1. Inserción inmutable en la cola de salida (Outbox Pattern)
    // Protege la experiencia del usuario delegando el envío físico al Worker asíncrono
    const { data, error } = await supabase
      .from('email_queue')
      .insert([{
        recipient_email: to.trim().toLowerCase(),
        subject: subject.trim(),
        html_content: html,
        sender_name: fromName.trim(),
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        scheduled_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    const endTimer = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = endTimer - startTimer;

    // 📊 Telemetría asíncrona estructurada
    console.log(
      JSON.stringify({
        event: 'MAIL_ENQUEUED_SUCCESS',
        timestamp: new Date().toISOString(),
        emailId: data.id,
        recipient: to,
        senderName: fromName,
        insertLatencyMs: parseFloat(duration.toFixed(3)),
      })
    );

    return { success: true, id: data.id };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido de base de datos';
    
    console.error(
      JSON.stringify({
        event: 'MAIL_ENQUEUED_FAILURE',
        timestamp: new Date().toISOString(),
        recipient: to,
        error: errorMessage,
      })
    );

    return { success: false, error: errorMessage };
  }
}