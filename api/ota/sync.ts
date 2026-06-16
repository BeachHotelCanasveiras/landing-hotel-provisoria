/**
 * @file sync.ts
 * @description Sincronizador e importador universal de canales OTA (Booking, Decolar, Expedia).
 * - Resiliencia: Sincroniza secuencialmente todas las conexiones registradas.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import ICAL from 'ical.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OtaConnectionRow {
  id: string;
  room_id: number;
  channel_name: string;
  ical_import_url: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
  if (!isCron) {
    return res.status(401).json({ message: 'No autorizado.' });
  }

  try {
    // 1. Obtener todas las conexiones multicanal de base de datos
    const { data: connectionsRaw, error: connError } = await supabase
      .from('room_ota_connections')
      .select('id, room_id, channel_name, ical_import_url');

    if (connError) throw connError;
    const connections = (connectionsRaw || []) as OtaConnectionRow[];

    if (connections.length === 0) {
      return res.status(200).json({ message: 'Sin conexiones de canales activas.' });
    }

    console.log(`[OTA Sync] Sincronizando ${connections.length} canales activos...`);

    for (const conn of connections) {
      try {
        // 2. Descargar el calendario desde Decolar, Booking o Airbnb
        const response = await fetch(conn.ical_import_url);
        if (!response.ok) {
          console.error(`[OTA Sync] Fallo al conectar con canal ${conn.channel_name} para habitación ${conn.room_id}`);
          continue;
        }

        const icsData = await response.text();

        // 3. Decodificar iCal síncronamente con 'ical.js'
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents('vevent');

        for (const event of events) {
          const vevent = new ICAL.Event(event);
          const uid = vevent.uid;

          // Conversión segura a Date nativo para evitar el error TS2339 de Time
          const startJS = vevent.startDate.toJSDate();
          const endJS = vevent.endDate.toJSDate();

          const startStr = startJS.toISOString().split('T')[0];
          const endStr = endJS.toISOString().split('T')[0];

          // 4. Upsert idempotente en Supabase (Previene duplicaciones de reservas del mismo canal)
          await supabase.from('bookings').upsert([
            {
              id: uid.includes('@') ? undefined : uid, // Preservar UIDs puros de la OTA
              room_id: conn.room_id,
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

        console.log(`[OTA Sync] Canal ${conn.channel_name} para Habitación ${conn.room_id} al día.`);

      } catch (channelErr: unknown) {
        const msg = channelErr instanceof Error ? channelErr.message : 'Error de canal';
        console.error(`[OTA Sync Error] Error en canal ${conn.channel_name}:`, msg);
      }
    }

    return res.status(200).json({ success: true, synced_connections: connections.length });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error de red general';
    console.error('[OTA Sync Critical Error]:', msg);
    return res.status(500).json({ error: msg });
  }
}