/**
 * @file AdminPMS.tsx
 * @description Panel atómico del Administrador (Property Management System).
 * - UX/UI: Diseño analítico tipo Vercel, tarjetas de métricas (KPIs) y listado de control.
 * - Satisface el principio de responsabilidad única del Manifiesto de Ingeniería.
 */

import React from 'react';
import { TrendingUp, DollarSign, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

interface AdminPMSProps {
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const AdminPMS: React.FC<AdminPMSProps> = ({ t }) => {
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
    <div className="space-y-8">
      
      {/* 1. Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-accent/50 transition-colors"
            >
              <div>
                <p className="font-body text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {stat.label}
                </p>
                <p className="font-display text-4xl font-semibold text-gray-900 tracking-tight">
                  {stat.value}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md mt-3 border ${
                  stat.positive 
                    ? 'bg-green-50 text-green-700 border-green-100/50' 
                    : 'bg-gray-50 text-gray-600 border-gray-100'
                }`}>
                  {stat.positive && <TrendingUp size={10} strokeWidth={2.5} />}
                  {stat.change}
                </span>
              </div>
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                <Icon size={24} strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Listado de Reservas Activas (Data Grid) */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h3 className="font-display text-2xl text-gray-900 tracking-tight">
            {t('views.admin.bookings_list')}
          </h3>
          <span className="font-body text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            Últimos 7 días
          </span>
        </div>

        {/* Estado Vacío Elegante (Empty State) */}
        {/* Nota: En el futuro, aquí se mapearán los datos reales de Supabase 'bookings' */}
        <div className="h-56 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 mb-4 shadow-sm">
            <FileText className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h4 className="font-display text-lg text-gray-900 mb-1">Sin nuevas solicitudes</h4>
          <p className="font-body text-sm text-gray-500 font-light max-w-sm leading-relaxed">
            Las reservas conciliadas exitosamente a través del Webhook de Stripe aparecerán aquí de forma automática.
          </p>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <CheckCircle size={12} className="text-green-500" /> Webhook Activo
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1.5 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <Clock size={12} className="text-blue-500" /> Sincronización Realtime
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};