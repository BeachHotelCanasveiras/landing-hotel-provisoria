/**
 * @file AmenitiesConfig.tsx
 * @description Componente atómico para la configuración de Amenities de habitaciones.
 * Satisface la Trinidad Atómica (Zod, i18n JSON) y es 100% reutilizable en cualquier hotel (SaaS Ready).
 * - React 19: Sincronización pura de estado durante el render, libre de renderizados en cascada (set-state-in-effect resuelto).
 */

import React, { useState } from 'react';
import { 
  Tv, AirVent, Compass, GlassWater, BedDouble, Bed, 
  Bath, HelpCircle, Save, Wifi, Waves, KeyRound, Wind, Coffee 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AmenitiesTranslationSchema } from '@/locales/schemas/amenities.schema';

export interface AmenityDefinition {
  /** Clave de la columna en la base de datos */
  key: string;
  /** Icono de Lucide React para renderizado de alta definición */
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Entrada booleana (switch) o numérica (contador) */
  type: 'boolean' | 'number';
  /** Límite inferior para contadores */
  min?: number;
  /** Límite superior para contadores */
  max?: number;
}

interface AmenitiesConfigProps {
  /** ID de la habitación */
  roomId: number;
  /** Nombre o número identificatorio (ej: "101") */
  roomName: string;
  /** Estado de carga durante la transacción de red */
  isSaving?: boolean;
  /** Valores actuales recuperados desde Supabase */
  initialValues?: Record<string, boolean | number>;
  /** Callback para guardar los cambios */
  onSave: (values: Record<string, boolean | number>) => Promise<void>;
}

// Catálogo de Amenities alineado con Booking.com, Airbnb y Decolar
const COMPREHENSIVE_AMENITIES: AmenityDefinition[] = [
  { key: 'has_ac', icon: AirVent, type: 'boolean' },
  { key: 'has_wifi', icon: Wifi, type: 'boolean' },
  { key: 'has_minibar', icon: GlassWater, type: 'boolean' },
  { key: 'has_tv', icon: Tv, type: 'boolean' },
  { key: 'has_bathtub', icon: Bath, type: 'boolean' },
  { key: 'has_balcony', icon: Compass, type: 'boolean' },
  { key: 'has_ocean_view', icon: Waves, type: 'boolean' },
  { key: 'has_safe', icon: KeyRound, type: 'boolean' },
  { key: 'has_hairdryer', icon: Wind, type: 'boolean' },
  { key: 'has_coffee', icon: Coffee, type: 'boolean' },
  { key: 'double_beds', icon: BedDouble, type: 'number', min: 0, max: 4 },
  { key: 'single_beds', icon: Bed, type: 'number', min: 0, max: 6 },
];

export const AmenitiesConfig: React.FC<AmenitiesConfigProps> = ({
  roomId,
  roomName,
  isSaving = false,
  initialValues = {},
  onSave,
}) => {
  const { t, i18n } = useTranslation('amenities');

  // 1. Inicialización Perezosa del Estado (Lazy State Initialization)
  const [values, setValues] = useState<Record<string, boolean | number>>(() => {
    const defaultState: Record<string, boolean | number> = {};
    COMPREHENSIVE_AMENITIES.forEach(def => {
      defaultState[def.key] = initialValues[def.key] ?? (def.type === 'boolean' ? false : 0);
    });
    return defaultState;
  });

  // 2. Sincronización en fase de render (React 19 Pattern) - Evita react-hooks/set-state-in-effect
  const [prevInitialValues, setPrevInitialValues] = useState<Record<string, boolean | number> | undefined>(initialValues);
  if (initialValues !== prevInitialValues) {
    setPrevInitialValues(initialValues);
    const defaultState: Record<string, boolean | number> = {};
    COMPREHENSIVE_AMENITIES.forEach(def => {
      defaultState[def.key] = initialValues[def.key] ?? (def.type === 'boolean' ? false : 0);
    });
    setValues(defaultState);
  }

  // Validación de contrato Zod en DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'amenities') || {};
      AmenitiesTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[AmenitiesConfig] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const handleToggle = (key: string) => {
    setValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCounter = (key: string, type: 'increment' | 'decrement', min = 0, max = 10) => {
    setValues(prev => {
      const current = Number(prev[key] || 0);
      const nextValue = type === 'increment' ? current + 1 : current - 1;
      if (nextValue < min || nextValue > max) return prev;
      return { ...prev, [key]: nextValue };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(values);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6"
    >
      {/* Cabecera Desacoplada de i18n */}
      <div className="border-b border-gray-50 pb-4">
        <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
          {t('badge')}
        </span>
        <h3 className="font-display text-2xl text-gray-900 tracking-tight">
          {t('title')}
        </h3>
        <p className="font-body text-xs text-gray-400 font-light mt-1">
          {t('subtitle', { roomName, roomId })}
        </p>
      </div>

      {/* Grid de Comodidades Seleccionables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMPREHENSIVE_AMENITIES.map((def) => {
          const Icon = def.icon || HelpCircle;
          const value = values[def.key];

          return (
            <div 
              key={def.key}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-accent/40 transition-all duration-300"
            >
              {/* Icono y Etiqueta traducida */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-gray-700">
                  {t(`labels.${def.key}`)}
                </span>
              </div>

              {/* Controles de Entrada */}
              {def.type === 'boolean' ? (
                <button
                  type="button"
                  onClick={() => handleToggle(def.key)}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? 'bg-accent' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCounter(def.key, 'decrement', def.min, def.max)}
                    disabled={isSaving || Number(value || 0) <= (def.min ?? 0)}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-body text-xs font-bold text-gray-800 w-4 text-center">
                    {value ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounter(def.key, 'increment', def.min, def.max)}
                    disabled={isSaving || Number(value || 0) >= (def.max ?? 10)}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón de Guardado */}
      <div className="pt-4 border-t border-gray-50 flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
        >
          {isSaving ? (
            <Spinner className="w-4 h-4 text-white" />
          ) : (
            <Save className="w-4 h-4" strokeWidth={1.5} />
          )}
          {t('save_button')}
        </Button>
      </div>
    </form>
  );
};