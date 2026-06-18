/**
 * @file sync.ts
 * @description Sincronizador e importador universal de canales OTA (Booking, Decolar, Expedia, Airbnb).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado de forma asíncrona con el middleware withObservability.
 * - Sincronización por Categorías: Extrae e inyecta room_type (rooms.type) en las reservas importadas para evitar sobre-reservas.
 * - Resiliencia: Sincroniza secuencialmente todas las conexiones registradas.
 * - Idempotencia Total: Generación de UUID determinístico (SHA-256) a partir del UID de la OTA para evitar duplicados en base de datos.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import ICAL from 'ical.js';
import crypto from 'crypto'; // 🚀 Inyección del módulo criptográfico nativo de Node.js
import { withObservability } from '../utils/observability'; // 🚀 Inyección del decorador de telemetría

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OtaConnectionRow {
  id: string;
  room_id: number;
  channel_name: string;
  ical_import_url: string;
  rooms?: { type: string } | null; // 🚀 Extraído mediante join PostgREST para sincronización de categorías
}

/**
 * Genera un UUID determinístico v5-like a partir de cualquier string (UID).
 * Si el input ya es un UUID válido, lo retorna intacto.
 */
function getDeterministicUUID(input: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(input)) {
    return input;
  }
  // Generar hash SHA-256 de dispersión estable
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  // Estructurar bloques según el estándar RFC 4122
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

/**
 * @function otaSyncHandler
 * @description Handler interno que gestiona la sincronización e importación de calendarios OTA entrantes
 */
async function otaSyncHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
  if (!isCron) {
    console.error(`[OTA Sync] [traceId: ${context.traceId}] Intento de ejecución de cron no autorizado.`);
    return res.status(401).json({ message: 'No autorizado.' });
  }

  // 📊 Traza de Observabilidad: Inicio del proceso de sincronización
  console.log(
    JSON.stringify({
      event: 'OTA_SYNC_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
    })
  );

  // 1. Obtener todas las conexiones multicanal de base de datos incluyendo el tipo de habitación relacional
  const { data: connectionsRaw, error: connError } = await supabase
    .from('room_ota_connections')
    .select('id, room_id, channel_name, ical_import_url, rooms(type)'); // 🚀 Sincronización por categorías: rooms(type) agregado

  if (connError) throw connError;
  const connections = (connectionsRaw || []) as unknown as OtaConnectionRow[];

  if (connections.length === 0) {
    return res.status(200).json({ message: 'Sin conexiones de canales activas.' });
  }

  console.log(`[OTA Sync] [traceId: ${context.traceId}] Sincronizando ${connections.length} canales activos...`);

  for (const conn of connections) {
    try {
      // 📊 Traza de Observabilidad: Descarga de archivo .ics de OTA externa
      console.log(
        JSON.stringify({
          event: 'OTA_SYNC_FETCH_START',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          channel: conn.channel_name,
          roomId: conn.room_id,
          url: conn.ical_import_url,
        })
      );

      // 2. Descargar el calendario desde Decolar, Booking o Airbnb
      const response = await fetch(conn.ical_import_url);
      if (!response.ok) {
        console.error(`[OTA Sync] [traceId: ${context.traceId}] Fallo al conectar con canal ${conn.channel_name} para habitación ${conn.room_id}`);
        continue;
      }

      const icsData = await response.text();

      // 3. Decodificar iCal síncronamente con 'ical.js'
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const events = comp.getAllSubcomponents('vevent');

      console.log(
        JSON.stringify({
          event: 'OTA_SYNC_PARSING_START',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          channel: conn.channel_name,
          roomId: conn.room_id,
          eventsCount: events.length,
        })
      );

      for (const event of events) {
        const vevent = new ICAL.Event(event);
        const uid = vevent.uid;

        // Conversión segura a Date nativo para evitar el error TS2339 de Time
        const startJS = vevent.startDate.toJSDate();
        const endJS = vevent.endDate.toJSDate();

        const startStr = startJS.toISOString().split('T')[0];
        const endStr = endJS.toISOString().split('T')[0];

        // 🚀 RESOLUCIÓN DE IDEMPOTENCIA: Generar un UUID inmutable y determinístico a partir del UID de la OTA
        const deterministicId = getDeterministicUUID(uid);

        // 4. Upsert idempotente en Supabase (Previene duplicaciones de reservas del mismo canal)
        // Se integra de forma proactiva 'room_type' para dar soporte al motor de reservas por categorías
        await supabase.from('bookings').upsert([
          {
            id: deterministicId, // UUID determinístico compatible y único
            room_id: conn.room_id,
            room_type: conn.rooms?.type || 'double', // 🚀 Sincronización inmaculada de categoría (Previene sobre-reservas)
            check_in: startStr,
            check_out: endStr,
            total_price: 0, // Las tarifas se cobran directamente en la OTA
            status: 'confirmed',
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
      }

      // Registrar fecha de sincronización
      await supabase
        .from('room_ota_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', conn.id);

      console.log(`[OTA Sync] [traceId: ${context.traceId}] Canal ${conn.channel_name} para Habitación ${conn.room_id} al día.`);

    } catch (channelErr: unknown) {
      const msg = channelErr instanceof Error ? channelErr.message : 'Error de canal';
      console.error(`[OTA Sync Error] [traceId: ${context.traceId}] Error en canal ${conn.channel_name}:`, msg);
    }
  }

  // 📊 Traza de Observabilidad: Finalización del cron job
  console.log(
    JSON.stringify({
      event: 'OTA_SYNC_SUCCESS',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      channelsSyncedCount: connections.length,
    })
  );

  return res.status(200).json({ success: true, synced_connections: connections.length });
}

// 🚀 Exportamos el cron job de sincronización envuelto de forma asíncrona con el decorador de telemetría y seguridad
export default withObservability(otaSyncHandler);