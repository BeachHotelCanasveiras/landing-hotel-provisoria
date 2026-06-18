/**
 * @file export.ts
 * @description Exportador universal e independiente de disponibilidad en formato iCal (RFC 5545).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Seguridad (ISO 27001): Validación mediante tokens independientes por canal.
 * - Tipo Saneado: Saneado el error TS7006 inyectando la interfaz BookingRow de forma estricta.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { withObservability } from '../utils/observability'; // 🚀 Inyección del decorador de telemetría

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Contrato de datos estricto para cada registro de reserva en la exportación
interface BookingRow {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
}

/**
 * @function otaExportHandler
 * @description Handler interno que gestiona la exportación multicanal iCal con tracing
 */
async function otaExportHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const { connectionId, token } = req.query;

  if (!connectionId || !token) {
    return res.status(400).json({ message: 'Parámetros inválidos.' });
  }

  // 📊 Traza de Observabilidad: Inicio de verificación de canal
  console.log(
    JSON.stringify({
      event: 'OTA_EXPORT_CONNECTION_VALIDATION_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      connectionId,
    })
  );

  // 1. Validar la conexión multicanal activa
  const { data: connection, error: connError } = await supabase
    .from('room_ota_connections')
    .select('room_id, channel_name')
    .eq('id', connectionId as string)
    .eq('ical_export_token', token as string)
    .single();

  if (connError || !connection) {
    console.error(`[OTA Export Error] [traceId: ${context.traceId}] Intento de consulta de iCal con firma inválida para connectionId: ${connectionId}`);
    return res.status(403).json({ message: 'Acceso denegado al calendario.' });
  }

  // 📊 Traza de Observabilidad: Consulta de disponibilidad en Supabase
  console.log(
    JSON.stringify({
      event: 'OTA_EXPORT_DB_QUERY_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      channel: connection.channel_name,
      roomId: connection.room_id,
    })
  );

  // 2. Obtener las reservas que bloquean este cuarto
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, created_at')
    .eq('room_id', connection.room_id)
    .in('status', ['confirmed', 'checked_in']);

  if (bookingsError) throw bookingsError;

  // 3. Generar RFC 5545 Payload
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Beach Hotel Canasvieiras//${connection.channel_name.toUpperCase()} Sync//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  const bookingsData = (bookings || []) as unknown as BookingRow[];

  if (bookingsData.length > 0) {
    bookingsData.forEach((b) => {
      const checkInFormatted = b.check_in.replace(/-/g, '');
      const checkOutFormatted = b.check_out.replace(/-/g, '');
      const creationFormatted = new Date(b.created_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${b.id}@beachcanasvieiras.com`,
        `DTSTAMP:${creationFormatted}`,
        `DTSTART;VALUE=DATE:${checkInFormatted}`,
        `DTEND;VALUE=DATE:${checkOutFormatted}`,
        `SUMMARY:Ocupado - Canal ${connection.channel_name.toUpperCase()}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });
  }

  icsContent += 'END:VCALENDAR';

  // 📊 Traza de Observabilidad: Despacho de trama exitosa
  console.log(
    JSON.stringify({
      event: 'OTA_EXPORT_SUCCESS',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      channel: connection.channel_name,
      recordsCount: bookingsData.length,
    })
  );

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sync-${connection.channel_name}.ics"`);
  return res.status(200).send(icsContent);
}

// 🚀 Exportamos el exportador multicanal envuelto asíncronamente con el decorador de telemetría y seguridad
export default withObservability(otaExportHandler);