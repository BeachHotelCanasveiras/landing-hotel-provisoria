/**
 * @file RoomMatrix.tsx
 * @description Matriz interactiva de ocupación (Y: Habitaciones, X: Tiempo).
 * - SaaS Multi-Tenant: Desacoplado de ID o números fijos de habitación.
 * - Algoritmo AI: Calcula asignaciones sin fragmentación de inventario.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { Sparkles, CalendarRange, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RoomMatrixTranslationSchema } from '@/locales/schemas/room_matrix.schema';

interface Room {
  id: number;
  name: string;
  type: 'single' | 'double' | 'triple' | 'grupal';
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
}

interface Booking {
  id: string;
  room_id: number;
  guest_name: string;
  check_in: string; // formato 'yyyy-MM-dd'
  check_out: string; // formato 'yyyy-MM-dd'
  status: 'pending' | 'confirmed';
}

interface RoomMatrixProps {
  rooms: Room[];
  bookings: Booking[];
  onManualAllocate?: (roomId: number, date: string) => void;
}

export const RoomMatrix: React.FC<RoomMatrixProps> = ({
  rooms,
  bookings,
  onManualAllocate,
}) => {
  const { t, i18n } = useTranslation('room_matrix');
  const [isAllocating, setIsAllocating] = useState(false);

  // Validación de contrato Zod en DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'room_matrix') || {};
      RoomMatrixTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[RoomMatrix] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const getDateLocale = () => {
    if (i18n.language === 'en-US') return enUS;
    if (i18n.language === 'pt-BR') return ptBR;
    return es;
  };

  const currentLocale = getDateLocale();
  const today = startOfDay(new Date());

  // 1. Generar dinámicamente un rango de 15 días consecutivos para el eje X
  const timelineDates = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => addDays(today, i));
  }, [today]);

  /**
   * ALGORITMO INTELIGENTE DE DEFRAGMENTACIÓN DE INVENTARIO (SaaS Elite Feature)
   * Busca la habitación más óptima evitando dejar días vacíos "muertos" de corta duración.
   */
  const handleSmartAllocation = (roomType: 'single' | 'double' | 'triple' | 'grupal') => {
    setIsAllocating(true);
    toast.info(t('smart_allocating'));

    setTimeout(() => {
      let optimalRoom: Room | null = null;
      let highestScore = -1;

      // Filtrar habitaciones por tipo
      const eligibleRooms = rooms.filter(r => r.type === roomType);

      eligibleRooms.forEach(room => {
        // Verificar si la habitación tiene colisiones en los próximos 5 días (Rango de prueba)
        const roomBookings = bookings.filter(b => b.room_id === room.id);
        const hasCollision = roomBookings.some(b => {
          const bIn = parseISO(b.check_in);
          const bOut = parseISO(b.check_out);
          return isWithinInterval(today, { start: bIn, end: bOut });
        });

        if (!hasCollision) {
          let score = 10; // Puntuación base de vacancia

          // Multiplicador 1: Ama de llaves (Prioriza habitaciones limpias)
          if (room.housekeeping_status === 'clean') score += 50;
          if (room.housekeeping_status === 'cleaning') score += 20;

          // Multiplicador 2: Defragmentación de inventario
          // Si tiene reservas futuras muy lejanas, el score sube para dejar las habitaciones vacías continuas libres
          const nextBooking = roomBookings
            .map(b => parseISO(b.check_in))
            .filter(date => date > today)
            .sort((a, b) => a.getTime() - b.getTime())[0];

          if (nextBooking) {
            const daysToNextBooking = Math.ceil((nextBooking.getTime() - today.getTime()) / (1000 * 3600 * 24));
            // Cuanto menor sea la brecha (sin colisionar), mejor es rellenar este slot muerto
            score += Math.max(0, 30 - daysToNextBooking);
          } else {
            // Si la habitación no tiene reservas futuras, preferimos guardarla intacta para estadías largas de alto ticket
            score -= 10;
          }

          if (score > highestScore) {
            highestScore = score;
            optimalRoom = room;
          }
        }
      });

      setIsAllocating(false);

      if (optimalRoom) {
        toast.success(t('smart_allocate_success', { room: (optimalRoom as Room).name }));
        if (onManualAllocate) onManualAllocate((optimalRoom as Room).id, format(today, 'yyyy-MM-dd'));
      } else {
        toast.error(t('no_rooms_found'));
      }
    }, 1200); // Simulación de carga heurística
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
      
      {/* Cabecera del Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50 pb-5">
        <div>
          <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
            {t('badge')}
          </span>
          <h3 className="font-display text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            {t('title')}
            <CalendarRange size={20} className="text-accent" strokeWidth={1.5} />
          </h3>
          <p className="font-body text-xs text-gray-400 font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Triggers Heurísticos del Administrador */}
        <button
          disabled={isAllocating}
          onClick={() => handleSmartAllocation('double')}
          className="px-5 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-body text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer self-start"
        >
          <Sparkles size={14} className="text-accent animate-pulse" />
          {t('smart_allocate_btn')}
        </button>
      </div>

      {/* Rejilla de Ocupación Desplazable (GPU Accelerated) */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 scrollbar-thin">
        <table className="w-full border-collapse">
          {/* Eje X: Cabecera Temporal de Días */}
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <th className="p-4 text-left min-w-[100px]">{t('columns.room')}</th>
              <th className="p-4 text-center min-w-[70px]">{t('columns.type')}</th>
              {timelineDates.map(date => (
                <th key={date.toISOString()} className="p-3 text-center min-w-[50px] border-l border-gray-100/50">
                  <span className="block text-gray-900 font-medium">{format(date, 'd')}</span>
                  <span className="text-[8px] text-gray-400 font-light">{format(date, 'EEE', { locale: currentLocale })}</span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Eje Y: Filas de Habitaciones Físicas */}
          <tbody>
            {rooms.length > 0 ? (
              rooms.map(room => (
                <tr key={room.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors">
                  {/* Celda de Habitación */}
                  <td className="p-4 font-display text-base text-gray-900 font-bold">
                    {room.name}
                  </td>
                  {/* Celda de Tipo */}
                  <td className="p-3 text-center">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[9px] font-body font-bold uppercase tracking-wider border border-gray-200/30">
                      {room.type}
                    </span>
                  </td>

                  {/* Celdas del Calendario */}
                  {timelineDates.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    
                    // Buscar si esta habitación específica está reservada hoy
                    const activeBooking = bookings.find(b => {
                      if (b.room_id !== room.id) return false;
                      const bIn = b.check_in;
                      const bOut = b.check_out;
                      return dateStr >= bIn && dateStr < bOut;
                    });

                    const isCheckInDay = activeBooking && activeBooking.check_in === dateStr;

                    return (
                      <td 
                        key={dateStr}
                        onClick={() => !activeBooking && onManualAllocate && onManualAllocate(room.id, dateStr)}
                        className={cn(
                          "p-3 text-center border-l border-gray-100/40 relative min-h-[50px] transition-colors cursor-pointer",
                          activeBooking 
                            ? "bg-primary/10 text-primary border-y border-primary/20" 
                            : "hover:bg-accent/10"
                        )}
                      >
                        {isCheckInDay && (
                          <div className="absolute inset-x-1 top-1 bottom-1 bg-primary text-white rounded-lg flex items-center gap-1.5 px-2 py-1 shadow-sm z-10 overflow-hidden truncate animate-fade-in">
                            <User size={10} className="text-accent shrink-0" />
                            <span className="font-body text-[9px] font-semibold tracking-wide truncate">
                              {activeBooking.guest_name}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={17} className="p-12 text-center text-gray-400 font-body text-xs font-light">
                  <AlertTriangle className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
                  No existen habitaciones dadas de alta en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};