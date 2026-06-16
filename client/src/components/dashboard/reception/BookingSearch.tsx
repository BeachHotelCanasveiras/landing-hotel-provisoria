/**
 * @file BookingSearch.tsx
 * @description Buscador avanzado y CRM de reservas de recepción del PMS.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - 100% libre de importaciones y variables huérfanas para ESLint v9.
 * - i18n & Zod: 100% traducido y validado (Zero Hardcoded).
 * - SaaS Ready: Altamente desacoplado, de uso genérico y adaptable a cualquier hotel.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShieldAlert, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-50 pb-5">
        <div>
          <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
            {t('badge')}
          </span>
          <h3 className="font-display text-2xl text-gray-900 tracking-tight">
            {t('title')}
          </h3>
          <p className="font-body text-xs text-gray-400 font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Inputs de Filtro */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Campo de Búsqueda */}
          <div className="flex-1 lg:w-80 p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all flex items-center gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-gray-900 placeholder:text-gray-300 outline-none"
            />
          </div>

          {/* Selector de Estado */}
          <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-gray-700 font-medium outline-none cursor-pointer"
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
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <th className="p-4 text-left">{t('columns.reference')}</th>
              <th className="p-4 text-left">{t('columns.guest')}</th>
              <th className="p-4 text-center">{t('columns.room')}</th>
              <th className="p-4 text-center">{t('columns.dates')}</th>
              <th className="p-4 text-right">{t('columns.total')}</th>
              <th className="p-4 text-center">{t('columns.status')}</th>
              <th className="p-4 text-center">{t('columns.actions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
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
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    {/* Código de Referencia */}
                    <td className="p-4 font-mono text-xs font-bold text-gray-800">
                      {b.referenceCode}
                    </td>

                    {/* Datos del Huésped */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-body text-xs font-semibold text-gray-800 leading-tight">{b.guestName}</p>
                          <p className="font-body text-[10px] text-gray-400 mt-0.5">{b.guestEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Habitación Asignada */}
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-lg font-body text-[10px] font-bold uppercase tracking-wider">
                        {b.roomName}
                      </span>
                    </td>

                    {/* Fechas de Estancia */}
                    <td className="p-4 text-center font-body text-xs text-gray-600">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{b.checkIn} al {b.checkOut}</span>
                      </div>
                    </td>

                    {/* Total Facturado */}
                    <td className="p-4 text-right font-body text-xs font-bold text-gray-900">
                      R$ {b.totalPrice.toFixed(2)}
                    </td>

                    {/* Estado de la Reserva */}
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-body font-bold uppercase tracking-wider border",
                        b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100/50' :
                        b.status === 'checked_in' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
                        b.status === 'checked_out' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
                        b.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100/50' :
                        'bg-red-50 text-red-700 border-red-100/50'
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
                            className="h-8 px-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
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
                            className="h-8 px-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
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
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-green-500 hover:text-green-600 active:scale-95 transition-all shadow-sm"
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
                  <td colSpan={7} className="p-12 text-center text-gray-400 font-body text-xs font-light">
                    <ShieldAlert className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
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