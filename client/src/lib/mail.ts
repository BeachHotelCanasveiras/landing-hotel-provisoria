/**
 * @file mail.ts
 * @description Servicio de encolamiento de correos transaccionales para el ecosistema Beach Hotel.
 * - Desacoplamiento total: Inserta en `email_queue` para procesamiento asíncrono.
 * - Resiliencia: La transacción de reserva nunca se bloquea por fallos en el servicio de correo.
 * - ESLint Compliant: Uso de prefijo '_' para variables intencionalmente no usadas.
 */

import { supabase } from '@/lib/supabase';

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
  // El parámetro 'fromName' se reserva para futuras iteraciones del Worker de correo
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sender = fromName;

  try {
    // 1. Inserción inmutable en la cola de mensajes de Supabase
    // Garantiza disponibilidad (ISO 27001) al no depender de la API de Resend en el cliente.
    const { data, error } = await supabase
      .from('email_queue')
      .insert([{
        recipient_email: to,
        subject: subject,
        html_content: html,
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

    console.log(`[Mail Service] Correo encolado exitosamente con ID: ${data.id}`);
    return { success: true, id: data.id };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al encolar correo';
    console.error('[Mail Service] Error crítico al encolar:', errorMessage);
    return { success: false, error: errorMessage };
  }
}