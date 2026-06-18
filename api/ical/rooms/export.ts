/**
 * @file export.ts
 * @description Generador dinámico de archivos iCal (.ics) para exportación de disponibilidad.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Seguridad (ISO 27001): Exige un token de acceso criptográfico UUID único por habitación.
 * - Cumplimiento: Estructura estándar RFC 5545 compatible con Booking.com y Airbnb.
 * - Tipo Saneado: Saneado el error TS7006 inyectando la interfaz BookingRow de forma estricta.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { withObservability } from '../../utils/observability'; // 🚀 Inyección del decorador de telemetría

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Contrato estricto para cada registro de reserva en la exportación
interface BookingRow {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
}

/**
 * @function exportHandler
 * @description Handler interno que gestiona la generación y exportación del archivo iCal con tracing
 */
async function exportHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const { roomId, token } = req.query;

  if (!roomId || !token) {
    return res.status(400).json({ message: 'Parámetros incompletos.' });
  }

  // 📊 Traza de Observabilidad: Inicio de verificación criptográfica
  console.log(
    JSON.stringify({
      event: 'ICAL_EXPORT_TOKEN_VALIDATION_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      roomId,
    })
  );

  // 1. Validar el token de exportación de la habitación (Seguridad perimetral)
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, name')
    .eq('id', parseInt(roomId as string))
    .eq('ical_export_token', token as string)
    .single();

  if (roomError || !room) {
    console.error(`[iCal Export Error] [traceId: ${context.traceId}] Intento de consulta de iCal con token inválido para roomId: ${roomId}`);
    return res.status(403).json({ message: 'Token de acceso de calendario inválido.' });
  }

  // 📊 Traza de Observabilidad: Consulta de disponibilidad en Supabase
  console.log(
    JSON.stringify({
      event: 'ICAL_EXPORT_DB_QUERY_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      roomId: room.id,
    })
  );

  // 2. Obtener todas las reservas activas (confirmadas y hospedadas)
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, created_at')
    .eq('room_id', room.id)
    .in('status', ['confirmed', 'checked_in']);

  if (bookingsError) {
    throw bookingsError;
  }

  // 3. Construir el archivo de texto en formato estándar iCal (RFC 5545)
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MetaShark Tech//Beach Hotel PMS v1.0//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  const bookingsData = (bookings || []) as unknown as BookingRow[];

  if (bookingsData.length > 0) {
    bookingsData.forEach((b) => {
      // Formatear fechas de entrada/salida (YYYYMMDD) sin horas para bloquear días enteros
      const checkInFormatted = b.check_in.replace(/-/g, '');
      const checkOutFormatted = b.check_out.replace(/-/g, '');
      const creationFormatted = new Date(b.created_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${b.id}@beachcanasvieiras.com`,
        `DTSTAMP:${creationFormatted}`,
        `DTSTART;VALUE=DATE:${checkInFormatted}`,
        `DTEND;VALUE=DATE:${checkOutFormatted}`,
        `SUMMARY:Ocupado - PMS Booking`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });
  }

  icsContent += 'END:VCALENDAR';

  // 📊 Traza de Observabilidad: Despacho de trama exitosa
  console.log(
    JSON.stringify({
      event: 'ICAL_EXPORT_SUCCESS',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      roomId: room.id,
      recordsCount: bookingsData.length,
    })
  );

  // 4. Servir el archivo con la cabecera MIME correcta para calendarios
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="room-${room.id}-availability.ics"`);
  
  return res.status(200).send(icsContent);
}

// 🚀 Exportamos el exportador de calendarios envuelto asíncronamente con el decorador de telemetría y seguridad
export default withObservability(exportHandler);