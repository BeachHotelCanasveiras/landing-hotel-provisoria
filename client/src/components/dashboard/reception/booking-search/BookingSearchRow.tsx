/**
 * @file BookingSearchRow.tsx
 * @description Renderiza una fila individual, resolviendo la lógica de formato de colores
 * y la construcción dinámica (cero hardcodeo) de la URL de WhatsApp.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Inyección del namespace centralizado 'whatsapp' para plantillas transaccionales.
 * - Accesibilidad (A11y) optimizada en botones y enlaces.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BookingRecord } from './types';

interface BookingSearchRowProps {
  booking: BookingRecord;
  isActionLoading: boolean;
  onStatusChange: (id: string, status: BookingRecord['status']) => void;
}

export const BookingSearchRow: React.FC<BookingSearchRowProps> = ({
  booking: b,
  isActionLoading,
  onStatusChange,
}) => {
  const { t: tUi } = useTranslation('booking_search');
  const { t: tWa } = useTranslation('whatsapp');

  // Construcción dinámica de enlace consumiendo el SSoT de comunicaciones
  const getWhatsAppLink = () => {
    const text = tWa('booking_confirmation', {
      guestName: b.guestName,
      reference: b.referenceCode,
      checkIn: b.checkIn,
      checkOut: b.checkOut
    });
    return `https://wa.me/${b.guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="hover:bg-gray-50/30 transition-colors"
    >
      <td className="p-4 font-mono text-xs font-bold text-gray-800">
        {b.referenceCode}
      </td>

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

      <td className="p-4 text-center">
        <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-lg font-body text-[10px] font-bold uppercase tracking-wider">
          {b.roomName}
        </span>
      </td>

      <td className="p-4 text-center font-body text-xs text-gray-600">
        <div className="flex items-center justify-center gap-1.5">
          <Calendar size={12} className="text-gray-400" />
          <span>{b.checkIn} al {b.checkOut}</span>
        </div>
      </td>

      <td className="p-4 text-right font-body text-xs font-bold text-gray-900">
        R$ {b.totalPrice.toFixed(2)}
      </td>

      <td className="p-4 text-center">
        <span className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-body font-bold uppercase tracking-wider border",
          b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100/50' :
          b.status === 'checked_in' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
          b.status === 'checked_out' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
          b.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100/50' :
          'bg-red-50 text-red-700 border-red-100/50'
        )}>
          {tUi(`status.${b.status}`)}
        </span>
      </td>

      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {b.status === 'confirmed' && (
            <button
              onClick={() => !isActionLoading && onStatusChange(b.id, 'checked_in')}
              disabled={isActionLoading}
              aria-label="Procesar Check-In"
              title="Procesar Check-In"
              className="h-8 px-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              IN
            </button>
          )}

          {b.status === 'checked_in' && (
            <button
              onClick={() => !isActionLoading && onStatusChange(b.id, 'checked_out')}
              disabled={isActionLoading}
              aria-label="Procesar Check-Out"
              title="Procesar Check-Out"
              className="h-8 px-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-body text-[9px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              OUT
            </button>
          )}

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enviar confirmación de reserva por WhatsApp"
            title="Enviar confirmación de reserva"
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-green-500 hover:text-green-600 active:scale-95 transition-all shadow-sm"
          >
            <MessageSquare size={13} strokeWidth={2} />
          </a>
        </div>
      </td>
    </motion.tr>
  );
};