/**
 * @file RatesAvailability.tsx
 * @description Gestor interactivo bidimensional de tarifas, disponibilidad y restricciones del hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en la cuadrícula densa.
 * - Trinidad Atómica: Localización total del texto de la grilla (incluyendo cabeceras).
 * - React 19: Lógica de actualización de grilla limpia de renderizados redundantes.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfDay } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { Save, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { RatesAvailabilityTranslationSchema } from '@/locales/schemas/rates_availability.schema';

interface RoomCategory {
  id: string;
  name: string;
  total_inventory: number;
  base_price_brl: number;
}

interface RatesAvailabilityProps {
  /** Categorías de habitaciones registradas en el PMS */
  categories: RoomCategory[];
  /** Callback para guardar la matriz modificada en la base de datos */
  onSave: (gridData: Record<string, Record<string, boolean | number | string>>) => Promise<void>;
}

export const RatesAvailability: React.FC<RatesAvailabilityProps> = ({
  categories,
  onSave,
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en matriz bidimensional densa
  usePerformanceProfiler('RatesAvailability');

  const { t, i18n } = useTranslation('rates_availability');
  const [isSaving, setIsSaving] = useState(false);
  const [baseDate, setBaseDate] = useState<Date>(startOfDay(new Date()));

  // Generar dinámicamente el rango de 10 días para el eje X
  const timelineDates = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => addDays(baseDate, i));
  }, [baseDate]);

  // Validación de contrato de traducción Zod (Failsafe)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'rates_availability') || {};
      RatesAvailabilityTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[RatesAvailability] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const getDateLocale = () => {
    if (i18n.language === 'en-US') return enUS;
    if (i18n.language === 'pt-BR') return ptBR;
    return es;
  };

  const currentLocale = getDateLocale();

  /**
   * Estado de rejilla bidimensional:
   * Record<"${categoryId}_${rowType}", Record<"yyyy-MM-dd", value>>
   */
  const [gridState, setGridState] = useState<Record<string, Record<string, boolean | number | string>>>(() => {
    const initialState: Record<string, Record<string, boolean | number | string>> = {};
    
    categories.forEach(cat => {
      // Filas operativas por categoría
      const rowTypes = ['availability', 'min_stay', 'min_nights_arrival', 'closed', 'no_check_in', 'no_check_out', 'rates_brl', 'rates_usd'];
      
      rowTypes.forEach(rowType => {
        const rowKey = `${cat.id}_${rowType}`;
        initialState[rowKey] = {};
        
        // Inicializar los 10 días con valores de prueba consistentes
        timelineDates.forEach(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          if (rowType === 'availability') initialState[rowKey][dateStr] = cat.total_inventory;
          else if (rowType === 'min_stay') initialState[rowKey][dateStr] = 3; // Estándar hotelero
          else if (rowType === 'min_nights_arrival') initialState[rowKey][dateStr] = 0;
          else if (rowType === 'closed') initialState[rowKey][dateStr] = false;
          else if (rowType === 'no_check_in') initialState[rowKey][dateStr] = false;
          else if (rowType === 'no_check_out') initialState[rowKey][dateStr] = false;
          else if (rowType === 'rates_brl') initialState[rowKey][dateStr] = cat.base_price_brl;
          else if (rowType === 'rates_usd') initialState[rowKey][dateStr] = Math.round(cat.base_price_brl / 5); // Conversión base
        });
      });
    });

    return initialState;
  });

  const handleCellChange = (rowKey: string, dateStr: string, value: boolean | number | string) => {
    setGridState(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [dateStr]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.info(t('saving'));
    try {
      await onSave(gridState);
      toast.success(t('save_success'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[RatesAvailability Submit Error]:', errorMessage);
      toast.error('Error al actualizar las tarifas en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 transition-colors duration-300">
      
      {/* Cabecera y Toolbar de Navegación de Fechas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-pms-border pb-5">
        <div>
          <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
            {t('badge')}
          </span>
          <h3 className="font-display text-2xl text-pms-text tracking-tight flex items-center gap-2">
            {t('title')}
            <Tag size={20} className="text-pms-accent" strokeWidth={1.5} />
          </h3>
          <p className="font-body text-xs text-pms-text-muted font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Barra de Navegación Temporal */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setBaseDate(prev => addDays(prev, -7))}
            className="w-10 h-10 rounded-xl bg-pms-surface border border-pms-border hover:bg-pms-surface-high text-pms-text-muted hover:text-pms-text"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBaseDate(startOfDay(new Date()))}
            className="h-10 px-4 rounded-xl font-body text-xs font-semibold uppercase tracking-wider bg-pms-surface border border-pms-border hover:bg-pms-surface-high text-pms-text-muted hover:text-pms-text"
          >
            {t('today_button', { defaultValue: 'Hoy / Hoje' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setBaseDate(prev => addDays(prev, 7))}
            className="w-10 h-10 rounded-xl bg-pms-surface border border-pms-border hover:bg-pms-surface-high text-pms-text-muted hover:text-pms-text"
          >
            <ChevronRight size={16} />
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 bg-pms-accent hover:opacity-90 text-pms-accent-foreground px-5 rounded-xl font-body text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md border-none cursor-pointer"
          >
            {isSaving ? <Spinner className="w-4 h-4 text-pms-accent-foreground" /> : <Save size={14} strokeWidth={1.8} />}
            {t('save_btn')}
          </Button>
        </div>
      </div>

      {/* Grid Matricial de Tarifas y Parámetros */}
      <div className="overflow-x-auto rounded-2xl border border-pms-border scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
              <th className="p-4 text-left min-w-[200px]">{t('parameter_column_header', { defaultValue: 'Parámetro por Categoría' })}</th>
              {timelineDates.map(date => (
                <th key={date.toISOString()} className="p-3 text-center min-w-[70px] border-l border-pms-border">
                  <span className="block text-pms-text font-medium">{format(date, 'd')}</span>
                  <span className="text-[8px] text-pms-text-muted font-light">{format(date, 'EEE', { locale: currentLocale })}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {categories.map(cat => {
              const rowTypes = [
                { key: 'availability', label: t('row_labels.availability'), type: 'number', disabled: true },
                { key: 'min_stay', label: t('row_labels.min_stay'), type: 'number', disabled: false },
                { key: 'min_nights_arrival', label: t('row_labels.min_nights_arrival'), type: 'number', disabled: false },
                { key: 'closed', label: t('row_labels.closed'), type: 'boolean', disabled: false },
                { key: 'no_check_in', label: t('row_labels.no_check_in'), type: 'boolean', disabled: false },
                { key: 'no_check_out', label: t('row_labels.no_check_out'), type: 'boolean', disabled: false },
                { key: 'rates_brl', label: t('row_labels.rates_brl'), type: 'rate', disabled: false },
                { key: 'rates_usd', label: t('row_labels.rates_usd'), type: 'rate', disabled: false },
              ];

              return (
                <React.Fragment key={cat.id}>
                  {/* Fila separadora con el nombre de la habitación */}
                  <tr className="bg-pms-accent/10 border-y border-pms-border select-none">
                    <td colSpan={11} className="p-3 pl-4">
                      <span className="font-display text-sm font-bold text-pms-accent uppercase tracking-wide">
                        {cat.name} (ID: {cat.id})
                      </span>
                    </td>
                  </tr>

                  {/* Renderizado de las filas operativas de la habitación */}
                  {rowTypes.map(row => {
                    const rowKey = `${cat.id}_${row.key}`;
                    const cells = gridState[rowKey] || {};

                    return (
                      <tr key={row.key} className="border-b border-pms-border last:border-0 hover:bg-pms-surface-high/50 transition-colors">
                        {/* Etiqueta del parámetro */}
                        <td className="p-3 pl-6 font-body text-xs text-pms-text-muted font-medium">
                          {row.label}
                        </td>

                        {/* Celdas del Calendario */}
                        {timelineDates.map(date => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const cellValue = cells[dateStr];

                          return (
                            <td key={dateStr} className="p-2 border-l border-pms-border text-center">
                              {row.type === 'boolean' ? (
                                /* Checkbox de Restricción */
                                <input
                                  type="checkbox"
                                  checked={!!cellValue}
                                  disabled={isSaving || row.disabled}
                                  onChange={(e) => handleCellChange(rowKey, dateStr, e.target.checked)}
                                  className="w-4.5 h-4.5 text-pms-accent rounded-sm border-pms-border focus:ring-pms-accent focus:ring-2 cursor-pointer disabled:opacity-30"
                                />
                              ) : row.type === 'rate' ? (
                                /* Input Numérico para Precios */
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-[10px] text-pms-text-muted font-bold uppercase">
                                    {row.key === 'rates_brl' ? 'R$' : '$'}
                                  </span>
                                  <input
                                    type="number"
                                    value={cellValue as number || ''}
                                    disabled={isSaving || row.disabled}
                                    onChange={(e) => handleCellChange(rowKey, dateStr, parseFloat(e.target.value) || 0)}
                                    className="w-16 h-8 text-center bg-pms-surface-high border border-pms-border rounded-lg font-body text-xs font-semibold text-pms-text focus:border-pms-accent focus:ring-1 focus:ring-pms-accent outline-none disabled:opacity-50"
                                  />
                                </div>
                              ) : (
                                /* Input Numérico Simple (Inventario/Estadías) */
                                <input
                                  type="number"
                                  value={cellValue as number || 0}
                                  disabled={isSaving || row.disabled}
                                  onChange={(e) => handleCellChange(rowKey, dateStr, parseInt(e.target.value) || 0)}
                                  className="w-12 h-8 text-center bg-pms-surface-high border border-pms-border rounded-lg font-body text-xs font-semibold text-pms-text focus:border-pms-accent focus:ring-1 focus:ring-pms-accent outline-none disabled:opacity-50"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </form>
  );
};