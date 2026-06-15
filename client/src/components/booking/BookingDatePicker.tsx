/**
 * @file BookingDatePicker.tsx
 * @description Sub-componente atómico para la selección y resumen del rango de fechas de reserva.
 * Cumple con el Manifiesto de Ingeniería: Responsabilidad única y cero lógica de negocio acoplada.
 */

import React from 'react';
import { format, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface BookingDatePickerProps {
  /** Rango de fechas seleccionado actualmente */
  range: DateRange | undefined;
  /** Callback para actualizar el rango de fechas */
  setRange: (range: DateRange | undefined) => void;
  /** Configuración regional de fecha (date-fns locale) */
  currentLocale: any;
  /** Fechas bloqueadas o no disponibles en el calendario */
  blockedDates?: Date[];
  /** Callback activado al hacer clic en continuar */
  onContinue: () => void;
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
  range,
  setRange,
  currentLocale,
  blockedDates = [],
  onContinue,
  t,
}) => {
  const today = startOfDay(new Date());

  return (
    <div className="flex flex-col">
      {/* Contenedor del Calendario con escala optimizada para móviles */}
      <div className="mb-6 flex justify-center scale-95 sm:scale-100 origin-top">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={currentLocale}
          disabled={[{ before: today }, ...blockedDates]}
          className="rounded-3xl"
        />
      </div>

      {/* Grid de Resumen de Check-In / Check-Out */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
        <div className="bg-white p-4">
          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-wider mb-1">
            {t('check_in_label')}
          </p>
          <p className="text-sm font-body font-medium text-gray-900">
            {range?.from 
              ? format(range.from, 'EEE, d MMM', { locale: currentLocale }) 
              : t('select_placeholder')}
          </p>
        </div>
        <div className="bg-white p-4 border-l border-gray-200">
          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-wider mb-1">
            {t('check_out_label')}
          </p>
          <p className="text-sm font-body font-medium text-gray-900">
            {range?.to 
              ? format(range.to, 'EEE, d MMM', { locale: currentLocale }) 
              : t('select_placeholder')}
          </p>
        </div>
      </div>

      {/* Botón de Continuar Paso */}
      <Button 
        disabled={!range?.from || !range?.to}
        onClick={onContinue}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base font-body font-semibold shadow-md transition-all active:scale-[0.98]"
      >
        {t('continue_button')}
      </Button>
    </div>
  );
};