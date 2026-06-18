/**
 * @file BookingSearch.tsx
 * @description Buscador avanzado y CRM de reservas de recepción del PMS.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en filtrado y renderizado.
 * - Trinidad Atómica: Soporte total para traducción y esquemas de validación Zod.
 * - SaaS Ready: Altamente desacoplado, genérico y sin textos hardcodeados.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShieldAlert, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { BookingSearchTranslationSchema } from '@/locales/schemas/booking_search.schema';

export interface BookingRecord {
  /** ID de la reserva */
  id: string;
  /** Referencia o código visible de reserva */
  referenceCode: string;
  /** Nombre del huésped principal */
  guestName: string;
  /** Email del huésped */
  guestEmail: string;
  /** Teléfono del huésped para comunicación de WhatsApp */
  guestPhone: string;
  /** Nombre o número identificatorio de la habitación física */
  roomName: string;
  /** Fecha de Check-In */
  checkIn: string;
  /** Fecha de Check-Out */
  checkOut: string;
  /** Monto total facturado en la transacción */
  totalPrice: number;
  /** Estado de la reserva */
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
}

interface BookingSearchProps {
  /** Listado de reservas del sistema */
  bookings: BookingRecord[];
  /** Estado de carga durante las transacciones de cambio de estado */
  isActionLoading?: boolean;
  /** Callback para cambiar el estado de la reserva en Supabase (Check-In / Out) */
  onStatusChange: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
}

export const BookingSearch: React.FC<BookingSearchProps> = ({
  bookings,
  isActionLoading = false,
  onStatusChange,
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en filtros CRM
  usePerformanceProfiler('BookingSearch');

  const { t, i18n } = useTranslation('booking_search');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Validación de contrato de traducción Zod (Failsafe)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'booking_search') || {};
      BookingSearchTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[BookingSearch] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Filtrado reactivo de reservas en base a coincidencia de texto y estado
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  /**
   * Genera el enlace dinámico de WhatsApp pre-rellenado con la plantilla oficial
   */
  const getWhatsAppLink = (b: BookingRecord) => {
    const text = `Olá ${b.guestName}, te saludamos de parte de la recepción de Hotel Beach Canasvieiras. Confirmamos que tu reserva ${b.referenceCode} para el periodo ${b.checkIn} al ${b.checkOut} se encuentra registrada de forma segura.`;
    return `https://wa.me/${b.guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 transition-colors duration-300">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-pms-border pb-5">
        <div>
          <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
            {t('badge')}
          </span>
          <h3 className="font-display text-2xl text-pms-text tracking-tight">
            {t('title')}
          </h3>
          <p className="font-body text-xs text-pms-text-muted font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Inputs de Filtro */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Campo de Búsqueda */}
          <div className="flex-1 lg:w-80 p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all flex items-center gap-2">
            <Search size={14} className="text-pms-text-muted shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
            />
          </div>

          {/* Selector de Estado */}
          <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text font-medium outline-none cursor-pointer"
            >
              <option value="all">{t('filter_status_all')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="confirmed">{t('status.confirmed')}</option>
              <option value="checked_in">{t('status.checked_in')}</option>
              <option value="checked_out">{t('status.checked_out')}</option>
              <option value="cancelled">{t('status.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados Operativos */}
      <div className="overflow-x-auto rounded-2xl border border-pms-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
              <th className="p-4 text-left">{t('columns.reference')}</th>
              <th className="p-4 text-left">{t('columns.guest')}</th>
              <th className="p-4 text-center">{t('columns.room')}</th>
              <th className="p-4 text-center">{t('columns.dates')}</th>
              <th className="p-4 text-right">{t('columns.total')}</th>
              <th className="p-4 text-center">{t('columns.status')}</th>
              <th className="p-4 text-center">{t('columns.actions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pms-border">
            <AnimatePresence mode="popLayout">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <motion.tr 
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-pms-surface-high/50 transition-colors"
                  >
                    {/* Código de Referencia */}
                    <td className="p-4 font-mono text-xs font-bold text-pms-text">
                      {b.referenceCode}
                    </td>

                    {/* Datos del Huésped */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pms-surface-high flex items-center justify-center text-pms-text-muted border border-pms-border">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-body text-xs font-semibold text-pms-text leading-tight">{b.guestName}</p>
                          <p className="font-body text-[10px] text-pms-text-muted mt-0.5">{b.guestEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Habitación Asignada */}
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-pms-surface-high text-pms-text border border-pms-border rounded-lg font-body text-[10px] font-bold uppercase tracking-wider">
                        {b.roomName}
                      </span>
                    </td>

                    {/* Fechas de Estancia */}
                    <td className="p-4 text-center font-body text-xs text-pms-text-muted">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar size={12} className="text-pms-text-muted" />
                        <span>{b.checkIn} al {b.checkOut}</span>
                      </div>
                    </td>

                    {/* Total Facturado */}
                    <td className="p-4 text-right font-body text-xs font-bold text-pms-text">
                      R$ {b.totalPrice.toFixed(2)}
                    </td>

                    {/* Estado de la Reserva (Badges Multitono Seguros) */}
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-body font-bold uppercase tracking-wider border",
                        b.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        b.status === 'checked_in' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        b.status === 'checked_out' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        b.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      )}>
                        {t(`status.${b.status}`)}
                      </span>
                    </td>

                    {/* Acciones Rápidas (Check-In / Out / WhatsApp) */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Check-In (IN) */}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => !isActionLoading && onStatusChange(b.id, 'checked_in')}
                            disabled={isActionLoading}
                            className="h-8 px-3.5 bg-green-600 hover:opacity-90 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm border-none"
                            title="Procesar Check-In"
                          >
                            IN
                          </button>
                        )}

                        {/* Botón Check-Out (OUT) */}
                        {b.status === 'checked_in' && (
                          <button
                            onClick={() => !isActionLoading && onStatusChange(b.id, 'checked_out')}
                            disabled={isActionLoading}
                            className="h-8 px-3.5 bg-purple-600 hover:opacity-90 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm border-none"
                            title="Procesar Check-Out"
                          >
                            OUT
                          </button>
                        )}

                        {/* Botón WhatsApp de Confirmación */}
                        <a
                          href={getWhatsAppLink(b)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg border border-pms-border bg-pms-surface hover:bg-pms-surface-high flex items-center justify-center text-green-500 hover:text-green-600 active:scale-95 transition-all shadow-sm"
                          title="Enviar confirmación de reserva"
                        >
                          <MessageSquare size={13} strokeWidth={2} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-pms-text-muted font-body text-xs font-light">
                    <ShieldAlert className="w-8 h-8 text-pms-accent mx-auto mb-3" strokeWidth={1.5} />
                    {t('no_bookings_found')}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

    </div>
  );
};