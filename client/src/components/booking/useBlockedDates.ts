/**
 * @file useBlockedDates.ts
 * @description Hook de alto rendimiento para calcular fechas bloqueadas en base al inventario de Supabase.
 * Lógica Heurística: Bloquea un día si y solo si:
 *   Nº de Reservas Activas (día D) >= Total de Habitaciones Físicas de esa categoría (N).
 */

import { useQuery } from '@tanstack/react-query';
import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface BookingDbRow {
  check_in: string;
  check_out: string;
}

export function useBlockedDates(roomType: string) {
  return useQuery<Date[]>({
    queryKey: ['blocked-dates', roomType],
    queryFn: async () => {
      // 1. Obtener el inventario total de habitaciones físicas de esta categoría
      const { count: totalRooms, error: countError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('type', roomType)
        .eq('status', 'available');

      if (countError || totalRooms === null || totalRooms === 0) {
        return [];
      }

      // 2. Obtener todas las reservas confirmadas o checked_in activas para este tipo de cuarto
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('status', 'confirmed') // Ignoramos canceladas o pendientes de pago
        .eq('rooms.type', roomType); // Filtro relacional implicito de Supabase

      // Fallback si no hay reservas o hay error
      if (bookingsError || !bookings || bookings.length === 0) {
        return [];
      }

      // 3. Heurística de Defragmentación: Contar reservas por cada fecha individual
      const dateOccupancyMap: Record<string, number> = {};

      (bookings as unknown as BookingDbRow[]).forEach((b) => {
        const start = parseISO(b.check_in);
        const end = parseISO(b.check_out);
        
        // Obtenemos todos los días intermedios de la estancia
        const days = eachDayOfInterval({ start, end });
        
        days.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          dateOccupancyMap[dateStr] = (dateOccupancyMap[dateStr] || 0) + 1;
        });
      });

      // 4. Bloquear solo los días donde la ocupación llegó al límite físico del inventario
      const blockedDates: Date[] = [];
      Object.entries(dateOccupancyMap).forEach(([dateStr, activeBookingsCount]) => {
        if (activeBookingsCount >= totalRooms) {
          blockedDates.push(parseISO(dateStr));
        }
      });

      return blockedDates;
    },
    staleTime: 1000 * 60 * 10, // Cache de disponibilidad de 10 minutos
  });
}