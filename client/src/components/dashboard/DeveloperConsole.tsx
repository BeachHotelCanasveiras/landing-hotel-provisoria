/**
 * @file DeveloperConsole.tsx
 * @description Panel atómico del Desarrollador (DevOps & Health Metrics).
 * - UX/UI: Consola emulada con fuente monoespaciada e indicadores de salud de infraestructura.
 * - Satisface el principio de responsabilidad única del Manifiesto de Ingeniería.
 */

import React from 'react';
import { Database, Layers, Wifi, ShieldCheck, Terminal, Activity } from 'lucide-react';

interface DeveloperConsoleProps {
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Columna Principal: Consola de Sistema (Logs) */}
      <div className="md:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
              <Terminal size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-2xl text-gray-900 tracking-tight">
              {t('views.developer.system_logs')}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Live
          </span>
        </div>
        
        {/* Terminal DevOps Simulada */}
        <div className="flex-1 bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto border border-gray-900 shadow-inner relative flex flex-col justify-end min-h-[240px]">
          <div className="space-y-3">
            <p className="text-gray-500">
              <span className="text-gray-600">[{new Date(Date.now() - 3600000).toISOString().replace('T', ' ').slice(0, 19)}]</span> INFO: Supabase Auth SDK initialized successfully.
            </p>
            <p className="text-gray-500">
              <span className="text-gray-600">[{new Date(Date.now() - 1800000).toISOString().replace('T', ' ').slice(0, 19)}]</span> INFO: Connection to 'public.users' established via RLS.
            </p>
            <p className="text-gray-500">
              <span className="text-gray-600">[{new Date(Date.now() - 60000).toISOString().replace('T', ' ').slice(0, 19)}]</span> INFO: Cloudinary asset lookup OK (total 15 assets cached).
            </p>
            <p className="text-gray-500">
              <span className="text-gray-600">[{new Date().toISOString().replace('T', ' ').slice(0, 19)}]</span> INFO: Webhook listener mounted on /api/webhooks/stripe
            </p>
            <div className="flex items-center gap-2 mt-4 text-green-400 font-bold border-t border-gray-800/50 pt-4">
              <span className="animate-pulse">❯</span>
              <span>{t('views.developer.status_healthy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Secundaria: Métricas de Salud de Infraestructura */}
      <div className="bg-gray-50/70 rounded-[2rem] border border-gray-100 p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20 shadow-sm">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          
          <div>
            <h4 className="font-display text-xl text-gray-900 tracking-tight flex items-center gap-2">
              System Health
              <Activity size={18} className="text-green-500" strokeWidth={2} />
            </h4>
            <p className="font-body text-xs text-gray-500 leading-relaxed font-light mt-2">
              Estado en tiempo real de los servicios y conexiones de terceros del ecosistema Beach Core.
            </p>
          </div>

          {/* Lista de Servicios */}
          <div className="space-y-4 pt-4 border-t border-gray-200/60">
            {/* Supabase */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-green-300 transition-colors">
                  <Database size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-gray-700">Database (Supabase)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100/50">
                Connected
              </span>
            </div>

            {/* Cloudinary */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-blue-300 transition-colors">
                  <Layers size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-gray-700">Storage (Cloudinary)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/50">
                CDN Active
              </span>
            </div>

            {/* Vercel Edge */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-purple-300 transition-colors">
                  <Wifi size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-gray-700">Network (Vercel)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100/50">
                Edge 99.9%
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};