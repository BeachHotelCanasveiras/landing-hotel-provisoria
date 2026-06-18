/**
 * @file AdminPMS.tsx
 * @description Panel atómico del Administrador (Property Management System).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje de widgets analíticos.
 * - Trinidad Atómica: Localización total de métricas del administrador.
 * - Saneamiento: Se resuelven los errores TS2554 y no-unused-vars corrigiendo la firma de tipos de 't'.
 */

import React from 'react';
import { TrendingUp, DollarSign, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';

interface AdminPMSProps {
  /** Función de traducción del componente padre con soporte para opciones de resiliencia */
  t: (key: string, options?: { defaultValue?: string } | Record<string, unknown>) => string;
}

export const AdminPMS: React.FC<AdminPMSProps> = ({ t }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del panel administrativo
  usePerformanceProfiler('AdminPMS');

  // Mock de métricas del hotel (KPIs)
  const stats = [
    { 
      label: t('views.admin.occupancy'), 
      value: '84%', 
      change: '+2.4%', 
      positive: true,
      icon: TrendingUp 
    },
    { 
      label: t('views.admin.monthly_revenue'), 
      value: 'R$ 48,200', 
      change: '+12%', 
      positive: true,
      icon: DollarSign 
    },
    { 
      label: t('views.admin.active_bookings'), 
      value: '18', 
      change: 'Estable', 
      positive: true,
      icon: Calendar 
    },
  ];

  return (
    <div className="space-y-8 transition-colors duration-300">
      
      {/* 1. Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-pms-accent/50 transition-all duration-300"
            >
              <div>
                <p className="font-body text-[10px] font-bold text-pms-text-muted uppercase tracking-widest mb-3">
                  {stat.label}
                </p>
                <p className="font-display text-4xl font-semibold text-pms-text tracking-tight">
                  {stat.value}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md mt-3 border ${
                  stat.positive 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-pms-surface-high text-pms-text-muted border-pms-border'
                }`}>
                  {stat.positive && <TrendingUp size={10} strokeWidth={2.5} />}
                  {stat.change}
                </span>
              </div>
              <div className="w-14 h-14 bg-pms-surface-high rounded-2xl flex items-center justify-center text-pms-text-muted group-hover:text-pms-accent group-hover:bg-pms-accent/10 transition-all">
                <Icon size={24} strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Listado de Reservas Activas (Data Grid) */}
      <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-pms-border pb-4">
          <h3 className="font-display text-2xl text-pms-text tracking-tight">
            {t('views.admin.bookings_list')}
          </h3>
          <span className="font-body text-xs text-pms-text-muted font-medium bg-pms-surface-high px-3 py-1.5 rounded-full border border-pms-border">
            {t('views.admin.last_7_days', { defaultValue: 'Últimos 7 días' })}
          </span>
        </div>

        {/* Estado Vacío Elegante (Empty State) */}
        {/* Nota: En el futuro, aquí se mapearán los datos reales de Supabase 'bookings' */}
        <div className="h-56 border border-dashed border-pms-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-pms-surface-high/50">
          <div className="w-12 h-12 rounded-full bg-pms-surface border border-pms-border flex items-center justify-center text-pms-text-muted mb-4 shadow-sm">
            <FileText className="w-6 h-6 text-pms-text-muted" strokeWidth={1.5} />
          </div>
          <h4 className="font-display text-lg text-pms-text mb-1">
            {t('views.admin.no_new_requests', { defaultValue: 'Sin nuevas solicitudes' })}
          </h4>
          <p className="font-body text-sm text-pms-text-muted font-light max-w-sm leading-relaxed">
            {t('views.admin.stripe_success_msg', { defaultValue: 'Las reservas conciliadas exitosamente a través del Webhook de Stripe aparecerán aquí de forma automática.' })}
          </p>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
              <CheckCircle size={12} className="text-green-500" /> {t('views.admin.webhook_active', { defaultValue: 'Webhook Activo' })}
            </div>
            <div className="w-1 h-1 bg-pms-border rounded-full"></div>
            <div className="flex items-center gap-1.5 text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
              <Clock size={12} className="text-pms-accent" /> {t('views.admin.realtime_sync', { defaultValue: 'Sincronización Realtime' })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};