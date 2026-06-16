/**
 * @file ical-import.ts
 * @description Sincronizador en segundo plano que importa agendas de Booking.com.
 * - Saneamiento: Resuelve error de compilación TS2339 convirtiendo a tipos nativos JS Date.
 * - Resiliencia: Sincronización de reservas externa e idempotente en Supabase.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import ICAL from 'ical.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface IcalRoomRow {
  id: number;
  ical_import_url: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Asegurar autorización del Vercel Cron
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
  if (!isCron) {
    return res.status(401).json({ message: 'No autorizado.' });
  }

  try {
    // 1. Obtener todas las habitaciones que tienen una URL de importación configurada
    const { data: rawRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, ical_import_url')
      .not('ical_import_url', 'is', null);

    if (roomsError) throw roomsError;
    const roomsToSync = (rawRooms || []) as IcalRoomRow[];

    if (roomsToSync.length === 0) {
      return res.status(200).json({ message: 'No hay canales de importación configurados.' });
    }

    console.log(`[iCal Import] Iniciando sincronización de ${roomsToSync.length} habitaciones...`);

    for (const room of roomsToSync) {
      // 2. Descargar el archivo .ics desde el canal (Booking.com Extranet URL)
      const response = await fetch(room.ical_import_url);
      if (!response.ok) {
        console.error(`[iCal Import] Error al descargar de: ${room.ical_import_url}`);
        continue;
      }

      const icsData = await response.text();

      // 3. Parsear el archivo utilizando 'ical.js'
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const events = comp.getAllSubcomponents('vevent');

      for (const event of events) {
        const vevent = new ICAL.Event(event);
        
        const uid = vevent.uid;

        // CORRECCIÓN (TS2339): Convertimos a Date nativo de JS para evitar inconsistencias de tipado en 'Time'
        const startJS = vevent.startDate.toJSDate();
        const endJS = vevent.endDate.toJSDate();

        // Formateo de alta fidelidad YYYY-MM-DD
        const startStr = startJS.toISOString().split('T')[0];
        const endStr = endJS.toISOString().split('T')[0];

        // 4. Inserción idempotente (Evita duplicados usando el UID único del evento de Booking)
        await supabase.from('bookings').upsert([
          {
            id: uid.includes('@') ? undefined : uid, // Si es un UUID puro de booking, lo preservamos
            room_id: room.id,
            check_in: startStr,
            check_out: endStr,
            total_price: 0, // Reservas externas se facturan en la OTA
            status: 'confirmed',
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
      }

      console.log(`[iCal Import] Habitación ${room.id} sincronizada con éxito.`);
    }

    return res.status(200).json({ success: true });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error en sincronización iCal';
    console.error('[iCal Import Critical Error]:', msg);
    return res.status(500).json({ error: msg });
  }
}