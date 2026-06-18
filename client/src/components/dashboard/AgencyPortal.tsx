/**
 * @file AgencyPortal.tsx
 * @description Panel atómico de Agencias Aliadas (Wholesale Portal).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del portal B2B.
 * - UX/UI: Diseño de lujo corporativo, orientado a la claridad de tarifas netas y beneficios B2B.
 * - Saneamiento: Se remueve la importación huérfana de "cn" resolviendo el aviso de ESLint.
 */

import React from 'react';
import { Tag, Briefcase, Percent, PhoneCall } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';

interface AgencyPortalProps {
  /** Email del agente de viajes autenticado */
  userEmail: string;
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const AgencyPortal: React.FC<AgencyPortalProps> = ({ t }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del portal de agencias
  usePerformanceProfiler('AgencyPortal');

  // Mock de tarifas netas para agencias (En futuras iteraciones, vendrán de TanStack Query/Supabase)
  const mockRates = [
    { type: 'Habitación Single', rate: 'R$ 180', margin: '10%' },
    { type: 'Habitación Doble', rate: 'R$ 252', margin: '10%' },
    { type: 'Habitación Triple', rate: 'R$ 306', margin: '15%' },
    { type: 'Plan Familiar & Grupos', rate: 'Consultar', margin: '20%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-colors duration-300">
      
      {/* Columna Principal: Tabla de Tarifas Mayoristas */}
      <div className="md:col-span-2 bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-pms-border pb-4">
          <h3 className="font-display text-2xl text-pms-text tracking-tight">
            {t('views.agency.wholesale_rates')}
          </h3>
          <span className="inline-flex items-center gap-1.5 bg-pms-accent/10 text-pms-accent px-3 py-1 rounded-full text-[10px] font-body font-bold uppercase tracking-wider border border-pms-accent/20">
            <Briefcase size={12} strokeWidth={2} />
            Operador Activo
          </span>
        </div>

        {/* Tabla Soft-UI de Tarifas */}
        <div className="border border-pms-border rounded-2xl overflow-hidden bg-pms-surface-high/30">
          <div className="grid grid-cols-3 p-4 bg-pms-surface-high/50 border-b border-pms-border text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
            <span>Categoría</span>
            <span className="text-right">Tarifa Neta</span>
            <span className="text-right">Margen (Markup)</span>
          </div>
          {mockRates.map((rate, i) => (
            <div key={i} className="grid grid-cols-3 items-center p-4 border-b border-pms-border last:border-b-0 hover:bg-pms-surface-high/50 transition-colors cursor-default">
              <span className="font-body text-sm font-semibold text-pms-text">{rate.type}</span>
              <span className="font-body text-sm text-pms-text font-bold text-right">{rate.rate}</span>
              <span className="font-body text-xs text-green-500 font-bold flex justify-end">
                <span className="bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                  {rate.margin}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Secundaria: Beneficios y Contacto VIP */}
      <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-pms-accent/10 flex items-center justify-center text-pms-accent">
            <Percent className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-display text-xl text-pms-text tracking-tight">
              {t('views.agency.discount_label')}
            </h4>
            <p className="font-body text-xs text-pms-accent uppercase tracking-widest font-semibold mt-1">
              Código de Operador
            </p>
          </div>
          <p className="font-body text-xs text-pms-text-muted leading-relaxed font-light">
            Utiliza tu código preferencial para aplicar descuentos de manera automática en cotizaciones y reservas grupales desde la web.
          </p>
          
          {/* Caja de Código Promocional */}
          <div className="mt-4 p-3 bg-pms-surface-high border border-pms-border border-dashed rounded-xl flex justify-between items-center cursor-copy hover:border-pms-accent transition-colors group">
            <span className="font-mono text-sm font-bold text-pms-text tracking-widest group-hover:text-pms-accent transition-colors">
              BHC-AGENCY-2026
            </span>
            <Tag className="w-4 h-4 text-pms-text-muted group-hover:text-pms-accent transition-colors" />
          </div>
        </div>

        {/* Action Button: Contacto Prioritario */}
        <div className="border-t border-pms-border pt-6 mt-6">
          <p className="text-[10px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-3">
            {t('views.agency.priority_contact')}
          </p>
          <button className="w-full flex items-center justify-center gap-2 bg-pms-accent hover:opacity-90 text-pms-accent-foreground py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md border-none">
            <PhoneCall size={16} strokeWidth={1.5} />
            <span className="font-body text-xs font-semibold uppercase tracking-wider">Línea Directa (Concierge)</span>
          </button>
        </div>
      </div>

    </div>
  );
};