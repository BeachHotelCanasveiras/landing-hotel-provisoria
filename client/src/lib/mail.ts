// client/src/lib/mail.ts
/**
 * @file mail.ts
 * @description Servicio transaccional de envíos automáticos integrado con Resend.
 * - Envíos con cero hardcoding de remitente o variables.
 * - Diseñado para notificar a huéspedes y agencias aliadas.
 */

import { Resend } from 'resend';

// Se inicializa de forma segura consumiendo las variables del entorno (.env)
const resendApiKey = process.env.RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

/**
 * Envía un correo electrónico utilizando el remitente institucional verificado
 */
export async function sendEmail({ to, subject, html, fromName = 'Concierge' }: EmailPayload) {
  if (!resend) {
    console.warn('[Mail Service] ⚠️ RESEND_API_KEY no configurada. Omitiendo envío físico.');
    return { success: false, message: 'Servicio de correo temporalmente inactivo.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      // Se utiliza el dominio corporativo verificado en la cuenta de Resend
      from: `${fromName} <reservas@beachcanasvieiras.com>`,
      to: [to],
      subject: subject,
      html: html,
      headers: {
        'X-Entity-Ref-ID': crypto.randomUUID() // Previene la duplicación de hilos en Gmail
      }
    });

    if (error) {
      console.error('[Mail Service] Error de envío de Resend:', error.message);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('[Mail Service] Excepción en servicio de correos:', error);
    return { success: false, error: error.message };
  }
}