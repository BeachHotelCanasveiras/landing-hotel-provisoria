/**
 * @file ical-import.ts
 * @description Sincronizador en segundo plano que importa agendas de Booking.com y OTAs.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad Serverless: Encapsulado asincrónicamente con el middleware withObservability.
 * - Sincronización por Categorías: Extrae e inyecta room_type (type) en las reservas importadas para evitar sobre-reservas.
 * - Saneamiento: Resuelve error de compilación TS2339 convirtiendo a tipos nativos JS Date.
 * - Resiliencia: Aislamiento de fallos individuales mediante try-catch interno por habitación (Garantía de Disponibilidad ISO 27001).
 * - Idempotencia Total: Generación de UUID determinístico (SHA-256) a partir del UID de la OTA para evitar duplicados en base de datos.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import ICAL from 'ical.js';
import crypto from 'crypto'; // 🚀 Inyección del módulo criptográfico nativo de Node.js
import { withObservability } from '../_utils/observability'; // 🚀 Inyección del decorador de telemetría

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface IcalRoomRow {
  id: number;
  type: string; // 🚀 Extraído para sincronización por categorías
  ical_import_url: string;
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
 * @function icalImportHandler
 * @description Handler interno que gestiona la descarga y sincronización de calendarios externos
 */
async function icalImportHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  // Asegurar autorización del Vercel Cron
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
  if (!isCron) {
    console.error(`[iCal Import] [traceId: ${context.traceId}] Intento de ejecución de cron no autorizado.`);
    return res.status(401).json({ message: 'No autorizado.' });
  }

  // 📊 Traza de Observabilidad: Obtener habitaciones configuradas
  console.log(
    JSON.stringify({
      event: 'ICAL_IMPORT_START',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
    })
  );

  // 1. Obtener todas las habitaciones que tienen una URL de importación configurada
  const { data: rawRooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id, type, ical_import_url') // 🚀 Sincronización por categorías: type agregado
    .not('ical_import_url', 'is', null);

  if (roomsError) throw roomsError;
  const roomsToSync = (rawRooms || []) as IcalRoomRow[];

  if (roomsToSync.length === 0) {
    return res.status(200).json({ message: 'No hay canales de importación configurados.' });
  }

  console.log(`[iCal Import] [traceId: ${context.traceId}] Iniciando sincronización de ${roomsToSync.length} habitaciones...`);

  let successfullySynced = 0;

  for (const room of roomsToSync) {
    try {
      // 📊 Traza de Observabilidad: Descarga de archivo .ics de OTA externa
      console.log(
        JSON.stringify({
          event: 'ICAL_FETCH_START',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          roomId: room.id,
          url: room.ical_import_url,
        })
      );

      // 2. Descargar el archivo .ics desde el canal (Booking.com Extranet URL)
      const response = await fetch(room.ical_import_url);
      if (!response.ok) {
        console.error(`[iCal Import] [traceId: ${context.traceId}] Error al descargar de: ${room.ical_import_url}`);
        continue;
      }

      const icsData = await response.text();

      // 3. Parsear el archivo utilizando 'ical.js'
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const events = comp.getAllSubcomponents('vevent');

      console.log(
        JSON.stringify({
          event: 'ICAL_PARSING_START',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          roomId: room.id,
          eventsCount: events.length,
        })
      );

      for (const event of events) {
        const vevent = new ICAL.Event(event);
        const uid = vevent.uid;

        // CORRECCIÓN (TS2339): Convertimos a Date nativo de JS para evitar inconsistencias de tipado en 'Time'
        const startJS = vevent.startDate.toJSDate();
        const endJS = vevent.endDate.toJSDate();

        // Formateo de alta fidelidad YYYY-MM-DD
        const startStr = startJS.toISOString().split('T')[0];
        const endStr = endJS.toISOString().split('T')[0];

        // 🚀 RESOLUCIÓN DE IDEMPOTENCIA: Generar un UUID inmutable y determinístico a partir del UID de la OTA
        const deterministicId = getDeterministicUUID(uid);

        // 4. Inserción idempotente (Evita duplicados usando el UUID único del evento de Booking)
        // Se integra de forma proactiva 'room_type' para dar soporte al motor de reservas por categorías
        await supabase.from('bookings').upsert([
          {
            id: deterministicId, // UUID determinístico compatible y único
            room_id: room.id,
            room_type: room.type, // 🚀 Sincronización inmaculada de categoría (Previene sobre-reservas)
            check_in: startStr,
            check_out: endStr,
            total_price: 0, // Reservas externas se facturan en la OTA
            status: 'confirmed',
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
      }

      console.log(`[iCal Import] [traceId: ${context.traceId}] Habitación ${room.id} sincronizada con éxito.`);
      successfullySynced++;

    } catch (roomError: unknown) {
      const errorMsg = roomError instanceof Error ? roomError.message : 'Error de sincronización desconocido';
      
      // 🚨 AISLAMIENTO DE ERRORES: Registramos el error de esta habitación pero permitimos que el bucle continúe
      console.error(
        JSON.stringify({
          event: 'ICAL_ROOM_SYNC_FAILURE',
          traceId: context.traceId,
          timestamp: new Date().toISOString(),
          roomId: room.id,
          error: errorMsg,
        })
      );
    }
  }

  // 📊 Traza de Observabilidad: Finalización del cron job
  console.log(
    JSON.stringify({
      event: 'ICAL_IMPORT_SUCCESS',
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
      roomsSyncedCount: successfullySynced,
      totalRoomsCount: roomsToSync.length,
    })
  );

  return res.status(200).json({ 
    success: true, 
    synced_rooms: successfullySynced, 
    total_rooms: roomsToSync.length 
  });
}

// 🚀 Exportamos el cron job envuelto con nuestro decorador de telemetría y contención unificado
export default withObservability(icalImportHandler);