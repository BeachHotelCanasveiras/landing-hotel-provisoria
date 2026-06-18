/**
 * @file rates.ts
 * @description Transmisor síncrono de tarifas, inventario y restricciones hacia el Middleware del Channel Manager.
 * Implementado bajo estándares de ingeniería de élite:
 * - Paridad Transaccional: Conexión segura HTTPS y encolamiento de logs de auditoría (ISO 27001).
 * - Desacoplado: Recupera especificaciones dinámicamente desde 'booking-config.ts'.
 * - Zero 'any': Tipado estricto e inmune a advertencias de linter.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { withObservability } from '../../_utils/observability';
import { getBookingConfig } from '../../_utils/booking-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateRatePayload {
  roomTypeId: string;
  dateFrom: string;
  dateTo: string;
  priceBrl: number;
  minimumStay: number;
  isClosed: boolean;
}

/**
 * @function syncRatesHandler
 * @description Empuja en caliente las tarifas y restricciones actualizadas del PMS hacia el integrador
 */
async function syncRatesHandler(
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) {
  const { roomTypeId, dateFrom, dateTo, priceBrl, minimumStay, isClosed } = req.body as UpdateRatePayload;

  if (!roomTypeId || !dateFrom || !dateTo || priceBrl === undefined) {
    return res.status(400).json({ message: 'Payload incompleto para sincronización de tarifas.' });
  }

  const startTimer = performance.now();
  const config = getBookingConfig(); // Recupera variables de entorno validadas

  // 1. Obtener conexión activa de la base de datos para recuperar el ID del Channel Manager
  const { data: connection, error: connError } = await supabase
    .from('room_ota_connections')
    .select('id, channel_manager_room_id')
    .eq('channel_name', 'booking')
    .eq('sync_status', 'active')
    .limit(1)
    .maybeSingle();

  if (connError || !connection || !connection.channel_manager_room_id) {
    console.warn(`[Sync Rates Warning] [traceId: ${context.traceId}] Sincronización omitida: No hay mapeo activo de Channel Manager.`);
    return res.status(200).json({ success: false, message: 'Canal de conectividad inactivo o sin mapear.' });
  }

  try {
    // 2. Construir payload de transmisión estándar de conectividad (Channex REST API Structure)
    const transmissionPayload = {
      property_id: config.hotelId,
      room_type_id: connection.channel_manager_room_id,
      start_date: dateFrom,
      end_date: dateTo,
      rates: {
        amount: Math.round(priceBrl * 100), // Enviar en centavos para evitar discrepancias de punto flotante
      },
      restrictions: {
        min_stay_arrival: minimumStay || 1,
        closed: isClosed ? 1 : 0
      }
    };

    // 3. Realizar POST HTTPS síncrono al integrador del Channel Manager
    // En el Sandbox utilizamos la URL de simulación definida de forma segura
    const apiResponse = await fetch(`${config.apiUrl}restrictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_BOOKING_SANDBOX_TOKEN}`, // Credenciales de máquina
        'X-Affiliate-Id': process.env.VITE_BOOKING_SANDBOX_AFFILIATE_ID || ''
      },
      body: JSON.stringify(transmissionPayload)
    });

    const duration = performance.now() - startTimer;

    // 4. Registrar logs de auditoría transaccional para cumplimiento de normativas ISO 27001
    await supabase.from('ota_sync_logs').insert([{
      connection_id: connection.id,
      event_type: 'rate_push',
      payload: transmissionPayload,
      latency_ms: parseFloat(duration.toFixed(3)),
      status: apiResponse.ok ? 'success' : 'failed'
    }]);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Error de comunicación con el integrador: ${apiResponse.status} - ${errorText}`);
    }

    console.log(`[Sync Rates Success] [traceId: ${context.traceId}] Tarifas empujadas con éxito a Booking.com en ${duration.toFixed(2)}ms`);
    return res.status(200).json({ success: true, latency_ms: parseFloat(duration.toFixed(3)) });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error inesperado de red';
    console.error(`[Sync Rates Error] [traceId: ${context.traceId}] Fallo al empujar tarifas:`, errorMsg);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Fallo síncrono al transmitir las tarifas al canal externo.',
      error: errorMsg 
    });
  }
}

const observedSyncRatesHandler = withObservability(syncRatesHandler);

export default observedSyncRatesHandler;