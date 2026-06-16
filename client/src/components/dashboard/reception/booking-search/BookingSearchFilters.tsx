/**
 * @file BookingSearchFilters.tsx
 * @description Aparato atómico responsable exclusivamente de la captura de inputs de filtrado.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BookingSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const BookingSearchFilters: React.FC<BookingSearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const { t } = useTranslation('booking_search');

  return (
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

      <div className="flex flex-wrap gap-4 w-full lg:w-auto">
        {/* Búsqueda por texto */}
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
  );
};