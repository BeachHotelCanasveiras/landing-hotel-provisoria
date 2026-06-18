/**
 * @file useBookingNotifications.ts
 * @description Hook de tiempo real que escucha inserciones en la tabla 'bookings'
 * de Supabase para disparar alertas auditivas y visuales inmediatas en el Dashboard.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad: Trazabilidad del ciclo de vida del canal WebSocket mediante logs estructurados JSON.
 * - Trinidad Atómica: Traducción localizada de notificaciones flotantes (Sonner) mediante i18next.
 * - Saneamiento de ESLint: Uso de Optional Catch Binding para eliminar la variable 'e' huérfana.
 * - Limpieza inmaculada de suscripciones de canal para evitar fugas de memoria (ISO 27001).
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('booking_search');

  useEffect(() => {
    // 📊 Trazabilidad de Canal: Registro estructurado de inicio de canal
    console.log(
      JSON.stringify({
        event: 'REALTIME_CHANNEL_SUBSCRIBED',
        timestamp: new Date().toISOString(),
        channel: 'pms_booking_alerts',
      })
    );

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
          const reference = newBooking.id.split('-')[0].toUpperCase();

          // 📊 Trazabilidad de Canal: Evento recibido en caliente
          console.log(
            JSON.stringify({
              event: 'REALTIME_EVENT_RECEIVED',
              timestamp: new Date().toISOString(),
              bookingId: newBooking.id,
              reference,
            })
          );
          
          // 2. Feedback auditivo de alerta de conversión
          try {
            const audio = new Audio('/sounds/booking-alert.mp3');
            audio.volume = 0.5;
            audio.play();
          } catch {
            console.log(
              '[Realtime Notification] Reproducción de sonido omitida por políticas de interacción del navegador.'
            );
          }

          // 3. Notificación flotante localizada vía Sonner (Trinidad Atómica)
          const toastTitle = t('realtime.new_booking_title', { 
            defaultValue: 'Nueva Solicitud de Reserva' 
          });
          const toastDesc = t('realtime.new_booking_desc', {
            checkIn: newBooking.check_in,
            totalPrice: newBooking.total_price.toFixed(2),
            defaultValue: `Check-in: ${newBooking.check_in} | Total: R$ ${newBooking.total_price.toFixed(2)}`
          });
          const actionLabel = t('realtime_action_label', { defaultValue: 'Ver en PMS' });

          toast.success(toastTitle, {
            description: toastDesc,
            duration: 8000,
            action: {
              label: actionLabel,
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

    // 5. Limpieza de canal al desmontar para prevenir fugas de memoria (ISO 27001)
    return () => {
      console.log(
        JSON.stringify({
          event: 'REALTIME_CHANNEL_DISCONNECTED',
          timestamp: new Date().toISOString(),
          channel: 'pms_booking_alerts',
        })
      );
      supabase.removeChannel(channel);
    };
  }, [onNewBooking, t]);
}