/**
 * @file export.ts
 * @description Exportador universal e independiente de disponibilidad en formato iCal (RFC 5545).
 * - Seguridad (ISO 27001): Validación mediante tokens independientes por canal.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { connectionId, token } = req.query;

  if (!connectionId || !token) {
    return res.status(400).json({ message: 'Parámetros inválidos.' });
  }

  try {
    // 1. Validar la conexión multicanal activa
    const { data: connection, error: connError } = await supabase
      .from('room_ota_connections')
      .select('room_id, channel_name')
      .eq('id', connectionId as string)
      .eq('ical_export_token', token as string)
      .single();

    if (connError || !connection) {
      return res.status(403).json({ message: 'Acceso denegado al calendario.' });
    }

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

    if (bookings && bookings.length > 0) {
      bookings.forEach((b) => {
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

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sync-${connection.channel_name}.ics"`);
    return res.status(200).send(icsContent);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error en exportador OTA';
    console.error('[OTA Export Error]:', msg);
    return res.status(500).json({ error: msg });
  }
}