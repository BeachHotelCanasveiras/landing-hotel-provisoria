/**
 * @file DeveloperConsole.tsx
 * @description Panel atómico del Desarrollador (DevOps & Health Metrics).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje de la consola.
 * - React 19: Cumple con react-hooks/purity al 100% al extraer datos estáticos fuera de la fase de render.
 * - Saneamiento: Libre de tipos 'any' y totalmente compliant con ESLint v9 Flat Config.
 */

import React from 'react';
import { Database, Layers, Wifi, ShieldCheck, Terminal, Activity } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';

interface DeveloperConsoleProps {
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

// Declaración estática fuera de la función del componente para garantizar pureza absoluta
const SYSTEM_LOGS = [
  {
    time: '2026-06-15 02:04:12',
    text: 'INFO: Supabase Auth SDK initialized successfully.',
  },
  {
    time: '2026-06-15 02:04:18',
    text: "INFO: Connection to 'public.users' established via RLS.",
  },
  {
    time: '2026-06-15 02:04:22',
    text: 'INFO: Cloudinary asset lookup OK (total 15 assets cached).',
  },
  {
    time: '2026-06-15 03:04:00',
    text: 'INFO: Webhook listener mounted on /api/webhooks/stripe',
  },
];

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ t }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del panel de desarrollo
  usePerformanceProfiler('DeveloperConsole');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-colors duration-300">
      
      {/* Columna Principal: Consola de Sistema (Logs) */}
      <div className="md:col-span-2 bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col">
        <div className="flex items-center justify-between border-b border-pms-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pms-surface-high border border-pms-border flex items-center justify-center text-pms-text-muted">
              <Terminal size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-2xl text-pms-text tracking-tight">
              {t('views.developer.system_logs')}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-pms-text text-pms-surface px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Live
          </span>
        </div>
        
        {/* Terminal DevOps Simulada con Logs Puros */}
        <div className="flex-1 bg-[#0d0e10] border border-pms-border rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-inner relative flex flex-col justify-end min-h-[240px]">
          <div className="space-y-3">
            {SYSTEM_LOGS.map((log, index) => (
              <p key={index} className="text-gray-500">
                <span className="text-gray-600">[{log.time}]</span> {log.text}
              </p>
            ))}
            <div className="flex items-center gap-2 mt-4 text-green-400 font-bold border-t border-pms-border/40 pt-4">
              <span className="animate-pulse">❯</span>
              <span>{t('views.developer.status_healthy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Secundaria: Métricas de Salud de Infraestructura */}
      <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20 shadow-sm">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          
          <div>
            <h4 className="font-display text-xl text-pms-text tracking-tight flex items-center gap-2">
              System Health
              <Activity size={18} className="text-green-500" strokeWidth={2} />
            </h4>
            <p className="font-body text-xs text-pms-text-muted leading-relaxed font-light mt-2">
              Estado en tiempo real de los servicios y conexiones de terceros del ecosistema Beach Core.
            </p>
          </div>

          {/* Lista de Servicios */}
          <div className="space-y-4 pt-4 border-t border-pms-border">
            {/* Supabase */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pms-surface-high border border-pms-border flex items-center justify-center text-pms-text-muted group-hover:border-green-300 transition-colors">
                  <Database size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-pms-text">Database (Supabase)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                Connected
              </span>
            </div>

            {/* Cloudinary */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pms-surface-high border border-pms-border flex items-center justify-center text-pms-text-muted group-hover:border-blue-300 transition-colors">
                  <Layers size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-pms-text">Storage (Cloudinary)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-pms-accent bg-pms-accent/10 px-2.5 py-1 rounded-md border border-pms-accent/20">
                Connected
              </span>
            </div>

            {/* Vercel Edge */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pms-surface-high border border-pms-border flex items-center justify-center text-pms-text-muted group-hover:border-purple-300 transition-colors">
                  <Wifi size={14} strokeWidth={1.5} />
                </div>
                <span className="font-body text-xs font-semibold text-pms-text">Network (Vercel)</span>
              </div>
              <span className="text-[10px] font-body font-bold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                Edge 99.9%
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};