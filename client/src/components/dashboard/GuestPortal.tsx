/**
 * @file GuestPortal.tsx
 * @description Panel atómico del Huésped (Customer Portal).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del portal de clientes.
 * - ISO 27001: Visualización limitada a los datos del perfil activo (Principio de Privacidad).
 * - UX: Estética minimalista con guías útiles para check-in.
 */

import React from 'react';
import { Calendar, Compass, MapPin, Key, Clock } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';

interface GuestPortalProps {
  /** Email del usuario autenticado */
  userEmail: string;
  /** Función de traducción de i18n del componente padre */
  t: (key: string) => string;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({ t }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del portal de huésped
  usePerformanceProfiler('GuestPortal');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-colors duration-300">
      
      {/* Columna Principal: Reservas del Huésped */}
      <div className="md:col-span-2 bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-pms-border pb-4">
          <h3 className="font-display text-2xl text-pms-text tracking-tight">
            {t('views.guest.my_bookings')}
          </h3>
          <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-body font-bold uppercase tracking-wider border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Sin deudas
          </span>
        </div>

        {/* Fallback de Reservas Vacías */}
        <div className="h-48 border border-dashed border-pms-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-pms-surface-high/50">
          <div className="w-12 h-12 rounded-full bg-pms-surface-high flex items-center justify-center text-pms-text-muted mb-3 border border-pms-border">
            <Calendar className="w-6 h-6 text-pms-text-muted" strokeWidth={1.5} />
          </div>
          <p className="font-body text-sm text-pms-text font-medium">
            {t('views.guest.no_bookings')}
          </p>
          <p className="font-body text-xs text-pms-text-muted mt-1 max-w-xs leading-relaxed font-light">
            Tus reservas conciliadas con Stripe aparecerán aquí automáticamente de forma segura.
          </p>
        </div>
      </div>

      {/* Columna Secundaria: Guía de Check-In Digital */}
      <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-pms-accent/10 flex items-center justify-center text-pms-accent">
            <Compass className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-display text-xl text-pms-text tracking-tight">
              {t('views.guest.guide_title')}
            </h4>
            <p className="font-body text-xs text-pms-accent uppercase tracking-widest font-semibold mt-1">
              Check-In Digital
            </p>
          </div>
          <p className="font-body text-xs text-pms-text-muted leading-relaxed font-light">
            {t('views.guest.guide_desc')}
          </p>
        </div>

        {/* Lista de Detalles Logísticos */}
        <div className="space-y-3 border-t border-pms-border pt-4">
          <div className="flex items-center gap-3 text-pms-text-muted">
            <MapPin className="w-4 h-4 text-pms-accent shrink-0" strokeWidth={1.5} />
            <span className="font-body text-xs font-medium">Avenida das Nações, 375</span>
          </div>
          <div className="flex items-center gap-3 text-pms-text-muted">
            <Clock className="w-4 h-4 text-pms-accent shrink-0" strokeWidth={1.5} />
            <span className="font-body text-xs font-medium">Recepción 24/7 Abierta</span>
          </div>
          <div className="flex items-center gap-3 text-pms-text-muted">
            <Key className="w-4 h-4 text-pms-accent shrink-0" strokeWidth={1.5} />
            <span className="font-body text-xs font-medium">Llaves NFC en tu Smartphone</span>
          </div>
        </div>
      </div>

    </div>
  );
};