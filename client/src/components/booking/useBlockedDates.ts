/**
 * @file useBlockedDates.ts
 * @description Hook de alto rendimiento para calcular fechas bloqueadas en base al inventario de Supabase.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Algoritmo de Rendimiento (Yield Correction): Resta un día a la fecha de salida (subDays) para liberar el check-out y evitar fugas de conversión.
 * - Observabilidad: Monitoreo de latencia de red en la resolución de base de datos de Supabase.
 * - Saneamiento: Tipado estricto e inmaculado para evitar advertencias en ESLint v9.
 */

import { useQuery } from '@tanstack/react-query';
import { eachDayOfInterval, parseISO, format, subDays } from 'date-fns'; // 🚀 Saneado: subDays importado para lógica de noches
import { supabase } from '@/lib/supabase';

interface BookingDbRow {
  check_in: string;
  check_out: string;
}

export function useBlockedDates(roomType: string) {
  return useQuery<Date[]>({
    queryKey: ['blocked-dates', roomType],
    queryFn: async () => {
      const startTimer = performance.now();

      // 1. Obtener la capacidad total de habitaciones físicas de esta categoría (excluyendo solo fuera de servicio)
      const { count: totalRooms, error: countError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('type', roomType)
        .neq('status', 'maintenance'); // Excluye únicamente habitaciones bajo reparación física

      if (countError || totalRooms === null || totalRooms === 0) {
        return [];
      }

      // 2. Obtener todas las reservas activas (confirmadas o checked_in) para esta categoría específica
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .in('status', ['confirmed', 'checked_in']) // Incluye confirmadas y hospedadas
        .eq('room_type', roomType); // 🚀 Filtro directo por categoría para evitar bypass de null-rooms

      // Fallback si no hay reservas o hay error
      if (bookingsError || !bookings || bookings.length === 0) {
        return [];
      }

      // 3. Heurística de Ocupación: Contar reservas por cada fecha individual (Noches de estadía)
      const dateOccupancyMap: Record<string, number> = {};

      (bookings as unknown as BookingDbRow[]).forEach((b) => {
        const start = parseISO(b.check_in);
        const end = parseISO(b.check_out);
        
        // 🚀 CORRECCIÓN DE RENDIMIENTO: Restamos un día a la salida. El día de check-out queda libre para ingresos.
        const endOfNights = subDays(end, 1);
        
        // Evitar inconsistencias de intervalos inversos si la reserva es de una sola noche
        if (endOfNights >= start) {
          const days = eachDayOfInterval({ start, end: endOfNights });
          
          days.forEach((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            dateOccupancyMap[dateStr] = (dateOccupancyMap[dateStr] || 0) + 1;
          });
        }
      });

      // 4. Bloquear solo los días donde la ocupación llegó al límite físico de la categoría
      const blockedDates: Date[] = [];
      Object.entries(dateOccupancyMap).forEach(([dateStr, activeBookingsCount]) => {
        if (activeBookingsCount >= totalRooms) {
          blockedDates.push(parseISO(dateStr));
        }
      });

      const duration = performance.now() - startTimer;
      
      // 📊 Registro de telemetría pasiva para auditoría de base de datos
      if (import.meta.env.DEV) {
        console.warn(
          `[Blocked Dates Query] Base de datos de Supabase consultada en: ${duration.toFixed(3)}ms para categoría: ${roomType}`
        );
      }

      return blockedDates;
    },
    staleTime: 1000 * 60 * 10, // Cache de disponibilidad de 10 minutos
  });
}