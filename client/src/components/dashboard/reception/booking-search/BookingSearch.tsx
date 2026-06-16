/**
 * @file BookingSearch.tsx
 * @description Orquestador del CRM de Reservas. Responsabilidad Única: Manejo de estado y filtrado.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookingSearchTranslationSchema } from '@/locales/schemas/booking_search.schema';
import { type BookingRecord } from './types';
import { BookingSearchFilters } from './BookingSearchFilters';
import { BookingSearchTable } from './BookingSearchTable';

interface BookingSearchProps {
  bookings: BookingRecord[];
  isActionLoading?: boolean;
  onStatusChange: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
}

export const BookingSearch: React.FC<BookingSearchProps> = ({
  bookings,
  isActionLoading = false,
  onStatusChange,
}) => {
  const { i18n } = useTranslation('booking_search');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Failsafe ISO 27001 - Validación en modo DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'booking_search') || {};
      BookingSearchTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[BookingSearch] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Lógica de Negocio (Core)
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
      <BookingSearchFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <BookingSearchTable 
        bookings={filteredBookings}
        isActionLoading={isActionLoading}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};