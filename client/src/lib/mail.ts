/**
 * @file mail.ts
 * @description Servicio de encolamiento de correos transaccionales para el ecosistema Beach Hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación SSoT: Inyección de sender_name (fromName) en la tabla email_queue, eliminando bypasses de linter.
 * - Observabilidad: Registra un log estructurado JSON de encolado (Database Insert Latency) con precisión de microsegundos.
 * - Desacoplamiento total: Inserta en `email_queue` para procesamiento asíncrono.
 * - Resiliencia: La transacción de reserva nunca se bloquea por fallos en el servicio de correo.
 */

import { supabase } from '@/lib/supabase';
import { performance } from 'perf_hooks'; // 🚀 Saneamiento: Importación nativa para evitar advertencias de tipado ambiental

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

/**
 * Encola un correo electrónico para su procesamiento asíncrono.
 * @param {EmailPayload} payload - Datos del correo a encolar.
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html, fromName = 'Concierge' }: EmailPayload) {
  const startTimer = performance.now();

  try {
    // 1. Inserción inmutable en la cola de mensajes de Supabase (Outbox Pattern)
    // Garantiza disponibilidad (ISO 27001) al no depender de la API de Resend en el cliente.
    const { data, error } = await supabase
      .from('email_queue')
      .insert([{
        recipient_email: to,
        subject: subject,
        html_content: html,
        sender_name: fromName, // 🚀 Sincronización inmaculada de columna:fromName inyectado
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

    const duration = performance.now() - startTimer;

    // 📊 Registro de telemetría pasiva para auditoría de base de datos
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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al encolar correo';
    console.error('[Mail Service] Error crítico al encolar:', errorMessage);
    return { success: false, error: errorMessage };
  }
}