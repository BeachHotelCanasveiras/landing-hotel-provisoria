/**
 * @file AgencyPortal.tsx
 * @description Panel atómico de Agencias Aliadas (Wholesale Portal).
 * - UX/UI: Diseño de lujo corporativo, orientado a la claridad de tarifas netas y beneficios B2B.
 * - Satisface las normas de cohesión del Manifiesto de Ingeniería.
 */

import React from 'react';
import { Tag, Briefcase, Percent, PhoneCall, ChevronRight } from 'lucide-react';

interface AgencyPortalProps {
  /** Email del agente de viajes autenticado */
  userEmail: string;
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const AgencyPortal: React.FC<AgencyPortalProps> = ({ userEmail, t }) => {
  // Mock de tarifas netas para agencias (En futuras iteraciones, vendrán de TanStack Query/Supabase)
  const mockRates = [
    { type: 'Habitación Single', rate: 'R$ 180', margin: '10%' },
    { type: 'Habitación Doble', rate: 'R$ 252', margin: '10%' },
    { type: 'Habitación Triple', rate: 'R$ 306', margin: '15%' },
    { type: 'Plan Familiar & Grupos', rate: 'Consultar', margin: '20%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Columna Principal: Tabla de Tarifas Mayoristas */}
      <div className="md:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h3 className="font-display text-2xl text-gray-900 tracking-tight">
            {t('views.agency.wholesale_rates')}
          </h3>
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-body font-bold uppercase tracking-wider border border-blue-100">
            <Briefcase size={12} strokeWidth={2} />
            Operador Activo
          </span>
        </div>

        {/* Tabla Soft-UI de Tarifas */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
          <div className="grid grid-cols-3 p-4 bg-gray-100/50 border-b border-gray-100 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
            <span>Categoría</span>
            <span className="text-right">Tarifa Neta</span>
            <span className="text-right">Margen (Markup)</span>
          </div>
          {mockRates.map((rate, i) => (
            <div key={i} className="grid grid-cols-3 items-center p-4 border-b border-gray-50 last:border-b-0 hover:bg-white transition-colors cursor-default">
              <span className="font-body text-sm font-semibold text-gray-800">{rate.type}</span>
              <span className="font-body text-sm text-gray-900 font-bold text-right">{rate.rate}</span>
              <span className="font-body text-xs text-green-600 font-bold flex justify-end">
                <span className="bg-green-50 px-2 py-1 rounded-md border border-green-100/50">
                  {rate.margin}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Secundaria: Beneficios y Contacto VIP */}
      <div className="bg-gray-50/70 rounded-[2rem] border border-gray-100 p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Percent className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-display text-xl text-gray-900 tracking-tight">
              {t('views.agency.discount_label')}
            </h4>
            <p className="font-body text-xs text-accent uppercase tracking-widest font-semibold mt-1">
              Código de Operador
            </p>
          </div>
          <p className="font-body text-xs text-gray-500 leading-relaxed font-light">
            Utiliza tu código preferencial para aplicar descuentos de manera automática en cotizaciones y reservas grupales desde la web.
          </p>
          
          {/* Caja de Código Promocional */}
          <div className="mt-4 p-3 bg-white border border-gray-200 border-dashed rounded-xl flex justify-between items-center cursor-copy hover:border-accent transition-colors group">
            <span className="font-mono text-sm font-bold text-gray-800 tracking-widest group-hover:text-accent transition-colors">
              BHC-AGENCY-2026
            </span>
            <Tag className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
          </div>
        </div>

        {/* Action Button: Contacto Prioritario */}
        <div className="border-t border-gray-200/60 pt-6 mt-6">
          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">
            {t('views.agency.priority_contact')}
          </p>
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md">
            <PhoneCall size={16} strokeWidth={1.5} />
            <span className="font-body text-xs font-semibold uppercase tracking-wider">Línea Directa (Concierge)</span>
          </button>
        </div>
      </div>

    </div>
  );
};