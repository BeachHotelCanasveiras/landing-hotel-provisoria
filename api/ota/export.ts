/**
 * @file export.ts
 * @description Exportador unificado e inteligente de disponibilidad en formato iCal (RFC 5545).
 * - SaaS-Ready (Fase de Consolidación): Resuelve el límite de Vercel unificando exportadores individuales y multicanal.
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Seguridad (ISO 27001): Validación síncrona mediante tokens e IDs relacionales.
 * - Tipo Saneado: Saneado el error TS7006 inyectando la interfaz BookingRow de forma estricta.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { withObservability } from '../_utils/observability'; // 🚀 Inyección del decorador de telemetría

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
 * @description Handler unificado de exportación de calendarios iCal
 */
async function otaExportHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const { roomId, connectionId, token } = req.query;

  // Validación estructural defensiva
  if (!token || (!roomId && !connectionId)) {
    return res.status(400).json({ message: 'Parámetros incompletos de exportación.' });
  }

  let resolvedRoomId: number | null = null;
  let prodId = '-//MetaShark Tech//Beach Hotel PMS v1.0//ES';
  let summary = 'Ocupado - PMS Booking';
  let filename = 'availability.ics';

  // 1. RESOLUCIÓN DE RUTA DE SEGURIDAD (ISO 27001)
  if (roomId) {
    // --- RUTA A: Consulta de habitación directa del hotel ---
    console.log(
      JSON.stringify({
        event: 'ICAL_EXPORT_ROOM_VALIDATION_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        roomId,
      })
    );

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('id', parseInt(roomId as string))
      .eq('ical_export_token', token as string)
      .single();

    if (roomError || !room) {
      console.error(`[iCal Export Error] [traceId: ${context.traceId}] Token inválido para roomId: ${roomId}`);
      return res.status(403).json({ message: 'Token de acceso de calendario de habitación inválido.' });
    }

    resolvedRoomId = room.id;
    filename = `room-${room.id}-availability.ics`;
  } else if (connectionId) {
    // --- RUTA B: Consulta de canal OTA externo (Booking, Airbnb, Decolar) ---
    console.log(
      JSON.stringify({
        event: 'ICAL_EXPORT_CONNECTION_VALIDATION_START',
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
        connectionId,
      })
    );

    const { data: connection, error: connError } = await supabase
      .from('room_ota_connections')
      .select('room_id, channel_name')
      .eq('id', connectionId as string)
      .eq('ical_export_token', token as string)
      .single();

    if (connError || !connection) {
      console.error(`[OTA Export Error] [traceId: ${context.traceId}] Firma inválida para connectionId: ${connectionId}`);
      return res.status(403).json({ message: 'Acceso denegado al calendario del canal.' });
    }

    resolvedRoomId = connection.room_id;
    prodId = `-//Beach Hotel Canasvieiras//${connection.channel_name.toUpperCase()} Sync//ES`;
    summary = `Ocupado - Canal ${connection.channel_name.toUpperCase()}`;
    filename = `sync-${connection.channel_name}.ics`;
  }

  if (!resolvedRoomId) {
    return res.status(400).json({ message: 'No se pudo resolver el identificador de habitación.' });
  }

  // 2. CONSULTA DE DISPONIBILIDAD EN SUPABASE
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, created_at')
    .eq('room_id', resolvedRoomId)
    .in('status', ['confirmed', 'checked_in']);

  if (bookingsError) {
    throw bookingsError;
  }

  // 3. CONSTRUCCIÓN DE TRAMA DE TEXTO iCAL (RFC 5545)
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
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
        `SUMMARY:${summary}`,
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
      resolvedRoomId,
      recordsCount: bookingsData.length,
    })
  );

  // 4. SERVIR EL ARCHIVO CON CABECERA MIME DE CALENDARIO
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(icsContent);
}

// 🚀 Exportamos el exportador multicanal unificado de forma asíncrona con el decorador de telemetría y seguridad
const observedOtaExportHandler = withObservability(otaExportHandler);

export default observedOtaExportHandler;