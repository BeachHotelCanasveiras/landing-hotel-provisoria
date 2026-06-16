/**
 * @file BookingSearchTable.tsx
 * @description Aparato responsable del renderizado de la cuadrícula de datos y el estado vacío (Empty State).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { BookingSearchRow } from './BookingSearchRow';
import { type BookingRecord } from './types';

interface BookingSearchTableProps {
  bookings: BookingRecord[];
  isActionLoading: boolean;
  onStatusChange: (id: string, status: BookingRecord['status']) => void;
}

export const BookingSearchTable: React.FC<BookingSearchTableProps> = ({
  bookings,
  isActionLoading,
  onStatusChange,
}) => {
  const { t } = useTranslation('booking_search');

  return (
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
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <BookingSearchRow 
                  key={b.id} 
                  booking={b} 
                  isActionLoading={isActionLoading} 
                  onStatusChange={onStatusChange} 
                />
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
  );
};