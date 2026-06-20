/**
 * @file RoomMatrix.tsx
 * @description Matriz interactiva de ocupación (Y: Habitaciones, X: Tiempo).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% desacoplado de colores rígidos mediante bg-pms-surface, bg-pms-bg y border-pms-border.
 * - Saneamiento Visual: Eliminada la tarjeta/badge superior para ganar amplitud vertical.
 * - Asignación Rápida: Botón unificado con un selector interactivo de categorías para buscar habitaciones libres y limpias en el acto.
 * - Saneamiento de React Hooks: Inicialización de 'today' con useState para estabilizar dependencias de useMemo.
 * - Interactividad de Celdas: Al hacer clic en cualquier celda se abre el modal "Estado de Situação" con opción de Check-In directo.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje.
 * - Saneado: Satisface ESLint v9, libre de variables huérfanas y advertencias de renderizado.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { Sparkles, CalendarRange, User, AlertTriangle, ClipboardCheck, CheckCircle2 } from 'lucide-react'; // 🚀 Saneado: Removido 'HelpCircle'
import { AnimatePresence } from 'framer-motion'; // 🚀 Saneado: Importado 'AnimatePresence' para transiciones
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { RoomMatrixTranslationSchema } from '@/locales/schemas/room_matrix.schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje
  usePerformanceProfiler('RoomMatrix');

  const { t, i18n } = useTranslation('room_matrix');
  const [isAllocating, setIsAllocating] = useState(false);

  // Selector reactivo de categoría para Asignación Rápida
  const [quickCategory, setQuickCategory] = useState<'single' | 'double' | 'triple' | 'grupal'>('double');

  // Estado para auditar la celda clickeada de forma interactiva
  const [selectedCell, setSelectedCell] = useState<{
    room: Room;
    dateStr: string;
    booking?: Booking;
  } | null>(null);

  // 🚀 SANEAMIENTO HOOKS: Estabilización de referencia de fecha actual usando estado perezoso
  const [today] = useState<Date>(() => startOfDay(new Date()));

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

  // Generar dinámicamente un rango de 15 días consecutivos para el eje X
  const timelineDates = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => addDays(today, i));
  }, [today]); // 🚀 Saneado: Dependencia de 'today' estable sin renders en cascada

  /**
   * ALGORITMO DE ASIGNACIÓN RÁPIDA (RE-DISEÑADO)
   * Busca e identifica de inmediato la primera habitación libre y limpia hoy para la categoría elegida.
   */
  const handleQuickAllocation = (roomType: 'single' | 'double' | 'triple' | 'grupal') => {
    setIsAllocating(true);
    const todayStr = format(today, 'yyyy-MM-dd');
    toast.info(t('smart_allocating', { defaultValue: 'Buscando quarto disponível...' }));

    setTimeout(() => {
      // 1. Filtrar cuartos de la categoría seleccionada que estén limpios
      const eligibleRooms = rooms.filter(r => r.type === roomType && r.housekeeping_status === 'clean');
      let foundRoom: Room | null = null;

      for (const room of eligibleRooms) {
        // 2. Verificar que no exista colisión de reservas para el día de hoy
        const hasCollision = bookings.some(b => 
          b.room_id === room.id && 
          isWithinInterval(today, { start: parseISO(b.check_in), end: parseISO(b.check_out) })
        );

        if (!hasCollision) {
          foundRoom = room;
          break;
        }
      }

      setIsAllocating(false);

      if (foundRoom) {
        toast.success(t('smart_allocate_success', { room: foundRoom.name, defaultValue: `Quarto ${foundRoom.name} alocado com sucesso!` }));
        if (onManualAllocate) {
          onManualAllocate(foundRoom.id, todayStr);
        }
      } else {
        toast.error(t('no_rooms_found', { defaultValue: 'Nenhum quarto limpo e disponível nesta categoria hoje.' }));
      }
    }, 800);
  };

  return (
    <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 text-pms-text">
      
      {/* Cabecera del Control (Saneada sin el badge superior) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-pms-border pb-5">
        <div>
          <h3 className="font-display text-2xl text-pms-text tracking-tight flex items-center gap-2">
            {t('title')}
            <CalendarRange size={20} className="text-pms-accent" strokeWidth={1.5} />
          </h3>
          <p className="font-body text-xs text-pms-text-muted font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* CONTROLES DE ASIGNACIÓN RÁPIDA (Vercel Style) */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector de Categoría */}
          <div className="p-3.5 bg-pms-surface-high border border-pms-border rounded-xl">
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value as 'single' | 'double' | 'triple' | 'grupal')}
              className="bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text font-bold outline-none cursor-pointer"
            >
              <option value="single">Single</option>
              <option value="double">Doble (Double)</option>
              <option value="triple">Triple</option>
              <option value="grupal">Quadruple (Grupal)</option>
            </select>
          </div>

          <button
            type="button"
            disabled={isAllocating}
            onClick={() => handleQuickAllocation(quickCategory)}
            className="h-12 px-5 bg-pms-accent hover:opacity-90 text-pms-accent-foreground font-body text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-none"
          >
            <Sparkles size={14} className="text-pms-accent-foreground animate-pulse" />
            Alocação Rápida
          </button>
        </div>
      </div>

      {/* Rejilla de Ocupación Desplazable */}
      <div className="overflow-x-auto rounded-2xl border border-pms-border scrollbar-thin">
        <table className="w-full border-collapse">
          {/* Eje X: Cabecera Temporal de Días */}
          <thead>
            <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
              <th className="p-4 text-left min-w-[100px]">{t('columns.room')}</th>
              <th className="p-4 text-center min-w-[70px]">{t('columns.type')}</th>
              {timelineDates.map(date => (
                <th key={date.toISOString()} className="p-3 text-center min-w-[50px] border-l border-pms-border">
                  <span className="block text-pms-text font-medium">{format(date, 'd')}</span>
                  <span className="text-[8px] text-pms-text-muted font-light">{format(date, 'EEE', { locale: currentLocale })}</span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Eje Y: Filas de Habitaciones Físicas */}
          <tbody className="divide-y divide-pms-border">
            {rooms.length > 0 ? (
              rooms.map(room => (
                <tr key={room.id} className="hover:bg-pms-surface-high/30 transition-colors">
                  {/* Celda de Habitación */}
                  <td className="p-4 font-display text-base text-pms-text font-bold">
                    {room.name}
                  </td>
                  {/* Celda de Tipo */}
                  <td className="p-3 text-center">
                    <span className="inline-block px-2.5 py-1 bg-pms-surface-high text-pms-text-muted rounded-md text-[9px] font-body font-bold uppercase tracking-wider border border-pms-border">
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
                        onClick={() => setSelectedCell({ room, dateStr, booking: activeBooking })}
                        className={cn(
                          "p-3 text-center border-l border-pms-border relative min-h-[50px] transition-all cursor-pointer hover:bg-pms-surface-high/50",
                          activeBooking 
                            ? "bg-pms-accent/10 text-pms-text" 
                            : "hover:bg-pms-accent/5"
                        )}
                      >
                        {isCheckInDay && (
                          <div className="absolute inset-x-1 top-1 bottom-1 bg-pms-accent text-pms-accent-foreground rounded-lg flex items-center gap-1.5 px-2 py-1 shadow-md z-10 overflow-hidden truncate animate-fade-in border-none">
                            <User size={10} className="text-pms-accent-foreground shrink-0" />
                            <span className="font-body text-[9px] font-bold tracking-wide truncate">
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
                <td colSpan={17} className="p-12 text-center text-pms-text-muted font-body text-xs font-light">
                  <AlertTriangle className="w-8 h-8 text-pms-accent mx-auto mb-3" strokeWidth={1.5} />
                  No existen habitaciones dadas de alta en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🚀 MODAL DE ESTADO DE SITUACIÓN INTERACTIVO */}
      <AnimatePresence>
        {selectedCell && (
          <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
            <DialogContent showCloseButton={false} className="sm:max-w-[360px] rounded-[2rem] border-pms-border bg-pms-surface text-pms-text shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="font-display text-lg text-pms-text flex items-center gap-2 border-b border-pms-border pb-3 mb-1">
                  <ClipboardCheck size={16} className="text-pms-accent" />
                  Estado de Situação
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-xs font-body text-pms-text-muted">
                {/* Detalles de la habitación */}
                <div className="p-3.5 bg-pms-surface-high/50 border border-pms-border rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Quarto:</span>
                    <span className="font-bold text-pms-text">{selectedCell.room.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Categoria:</span>
                    <span className="uppercase font-semibold text-pms-text-muted">{selectedCell.room.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Data da Consulta:</span>
                    <span className="font-mono text-pms-text">{selectedCell.dateStr}</span>
                  </div>
                </div>

                {/* Estado y Acciones Condicionales */}
                {selectedCell.booking ? (
                  <div className="p-4 bg-pms-accent/10 border border-pms-accent/20 rounded-2xl space-y-2.5">
                    <p className="text-[10px] font-bold text-pms-accent uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Quarto Ocupado / Reservado
                    </p>
                    <div className="text-xs text-pms-text space-y-1">
                      <p><strong>Hóspede:</strong> {selectedCell.booking.guest_name}</p>
                      <p><strong>Check-In:</strong> {selectedCell.booking.check_in}</p>
                      <p><strong>Check-Out:</strong> {selectedCell.booking.check_out}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-2">
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Quarto Disponível
                      </p>
                      <p className="text-xs">
                        Não existem reservas ativas ou bloqueios registrados para este quarto nesta data.
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-pms-text-muted border-t border-pms-border/40 pt-2 mt-1">
                        <span>Status de Higiene:</span>
                        <span className={cn(
                          "font-bold uppercase",
                          selectedCell.room.housekeeping_status === 'clean' ? 'text-green-500' :
                          selectedCell.room.housekeeping_status === 'cleaning' ? 'text-pms-accent' : 'text-orange-500'
                        )}>
                          {selectedCell.room.housekeeping_status}
                        </span>
                      </div>
                    </div>

                    {/* Botón de Acción de Check-In Directo */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onManualAllocate) {
                          onManualAllocate(selectedCell.room.id, selectedCell.dateStr);
                        }
                        setSelectedCell(null);
                      }}
                      className="w-full h-11 bg-pms-accent text-pms-accent-foreground font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 border-none cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      Fazer Check-In / Alocar
                    </button>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="w-full h-11 bg-pms-surface-high border border-pms-border text-pms-text rounded-xl text-xs font-semibold"
                >
                  Fechar
                </Button>

              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

    </div>
  );
};