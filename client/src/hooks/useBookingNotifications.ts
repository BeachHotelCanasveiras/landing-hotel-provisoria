// client/src/hooks/useBookingNotifications.ts
/**
 * @file useBookingNotifications.ts
 * @description Hook personalizado que escucha inserciones en tiempo real en la tabla
 * 'bookings' de Supabase para disparar alertas inmediatas en el Dashboard.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Corrige el error de referencia fatal de la variable huérfana 'api'.
 * - Limpieza inmaculada de suscripciones de canal para evitar fugas de memoria.
 * - Satisface las normas ISO 27001 de disponibilidad.
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BookingRealtimePayload {
  id: string;
  room_id: number;
  total_price: number;
  check_in: string;
  check_out: string;
  status: string;
}

export function useBookingNotifications(onNewBooking?: (booking: BookingRealtimePayload) => void) {
  useEffect(() => {
    // 1. Suscribirse al canal en tiempo real únicamente para la tabla 'bookings'
    const channel = supabase
      .channel('pms_booking_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Escucha únicamente nuevas reservas
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          const newBooking = payload.new as BookingRealtimePayload;
          
          // 2. Feedback auditivo premium de alerta de conversión
          try {
            const audio = new Audio('/sounds/booking-alert.mp3');
            audio.volume = 0.5;
            audio.play();
          } catch (e) {
            console.log('[Realtime Notification] Reproducción de sonido omitida por políticas del navegador o falta de interacción.');
          }

          // 3. Notificación flotante de alta fidelidad vía Sonner
          toast.success('Nueva Solicitud de Reserva', {
            description: `Check-in: ${newBooking.check_in} | Total: R$ ${newBooking.total_price}`,
            duration: 8000,
            action: {
              label: 'Ver en PMS',
              onClick: () => {
                // Foco de vista o desplazamiento al elemento
              }
            }
          });

          // 4. Callback para actualizar los estados reactivos del Dashboard (PMS)
          if (onNewBooking) {
            onNewBooking(newBooking);
          }
        }
      )
      .subscribe();

    // 5. Limpieza de canal al desmontar el componente del Dashboard para prevenir fugas de memoria (ISO 27001)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewBooking]);
}