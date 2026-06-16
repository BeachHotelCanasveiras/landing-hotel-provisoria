/**
 * @file PMSSidebar.tsx
 * @description Panel colapsable de navegación principal del PMS.
 * - i18n & Zod: 100% traducido y validado (Zero Hardcoded).
 * - SaaS Ready: Soporte para múltiples módulos operacionales con estados de colapso.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Calendar, BarChart3, Briefcase, Tag, 
  Sparkles, ExternalLink, Settings, LogOut, ChevronDown, ChevronUp, Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PMSSidebarTranslationSchema } from '@/locales/schemas/pms_sidebar.schema';

interface PMSSidebarProps {
  /** Vista activa actual en el orquestador principal */
  currentView: string;
  /** Callback para notificar el cambio de vista */
  onNavigate: (view: string) => void;
  /** Callback para ejecutar el cierre seguro de sesión */
  onSignOut: () => Promise<void>;
}

export const PMSSidebar: React.FC<PMSSidebarProps> = ({
  currentView,
  onNavigate,
  onSignOut,
}) => {
  const { t, i18n } = useTranslation('pms_sidebar');
  
  // Estados para controlar carpetas colapsables individuales (Mini Hotel Style)
  const [openMenus, setOpenOpenMenus] = useState<Record<string, boolean>>({
    bookings: false,
    reports: false,
    accounting: false,
    settings: false,
  });

  // Estado para colapsar toda la barra lateral en móviles
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Validación de esquema Zod en DEV (ISO 27001)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'pms_sidebar') || {};
      PMSSidebarTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[PMSSidebar] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const toggleSubMenu = (menuKey: string) => {
    setOpenOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  return (
    <div 
      className={cn(
        "h-screen bg-[#1F2226] text-gray-300 font-body flex flex-col justify-between transition-all duration-300 border-r border-gray-800 shadow-2xl shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Cabecera y Botón de Alternar Menú */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-brand text-base font-bold shadow-md">
                M
              </div>
              <span className="font-display text-lg font-bold text-white tracking-wide">
                Mini Hotel
              </span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Sección: Menú Principal */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
          {!isCollapsed && (
            <p className="text-[10px] font-body font-bold text-gray-500 uppercase tracking-widest pl-3 mb-2">
              {t('menu_principal')}
            </p>
          )}

          <div className="space-y-1">
            {/* Opción 1: Panorámica (Dashboard) */}
            <button
              onClick={() => onNavigate('overview')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                currentView === 'overview' 
                  ? "bg-accent text-accent-foreground shadow-lg" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <LayoutDashboard size={16} strokeWidth={1.8} className={currentView === 'overview' ? '' : 'text-gray-500'} />
              {!isCollapsed && <span>{t('overview')}</span>}
            </button>

            {/* Opción 2: Reservas (Colapsable) */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSubMenu('bookings')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={16} strokeWidth={1.8} className="text-gray-500" />
                  {!isCollapsed && <span>{t('bookings.title')}</span>}
                </div>
                {!isCollapsed && (openMenus.bookings ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {/* Sub-enlaces de Reservas */}
              {openMenus.bookings && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <button
                    onClick={() => onNavigate('room_map')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer",
                      currentView === 'room_map' && "text-accent font-bold"
                    )}
                  >
                    {t('bookings.room_map')}
                  </button>
                  <button
                    onClick={() => onNavigate('booking_search')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer",
                      currentView === 'booking_search' && "text-accent font-bold"
                    )}
                  >
                    {t('bookings.search')}
                  </button>
                </div>
              )}
            </div>

            {/* Opción 3: Informes (Colapsable) */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSubMenu('reports')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={16} strokeWidth={1.8} className="text-gray-500" />
                  {!isCollapsed && <span>{t('reports.title')}</span>}
                </div>
                {!isCollapsed && (openMenus.reports ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {/* Sub-enlaces de Informes */}
              {openMenus.reports && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <button
                    onClick={() => onNavigate('report_revenue')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('reports.revenue')}
                  </button>
                  <button
                    onClick={() => onNavigate('report_meals')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('reports.meals')}
                  </button>
                  <button
                    onClick={() => onNavigate('report_police')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('reports.police')}
                  </button>
                </div>
              )}
            </div>

            {/* Opción 4: Contabilidad (Colapsable) */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSubMenu('accounting')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={16} strokeWidth={1.8} className="text-gray-500" />
                  {!isCollapsed && <span>{t('accounting.title')}</span>}
                </div>
                {!isCollapsed && (openMenus.accounting ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {/* Sub-enlaces de Contabilidad */}
              {openMenus.accounting && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <button
                    onClick={() => onNavigate('acc_cash_flow')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('accounting.cash_flow')}
                  </button>
                  <button
                    onClick={() => onNavigate('acc_expenses')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('accounting.expenses')}
                  </button>
                  <button
                    onClick={() => onNavigate('acc_invoiced')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('accounting.invoiced')}
                  </button>
                </div>
              )}
            </div>

            {/* Opción 5: Precios y Disponibilidades */}
            <button
              onClick={() => onNavigate('rates')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                currentView === 'rates' 
                  ? "bg-accent text-accent-foreground shadow-lg" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <Tag size={16} strokeWidth={1.8} className={currentView === 'rates' ? '' : 'text-gray-500'} />
              {!isCollapsed && <span>{t('rates')}</span>}
            </button>

            {/* Opción 6: Ama de Llaves */}
            <button
              onClick={() => onNavigate('housekeeping')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                currentView === 'housekeeping' 
                  ? "bg-accent text-accent-foreground shadow-lg" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <Sparkles size={16} strokeWidth={1.8} className={currentView === 'housekeeping' ? '' : 'text-gray-500'} />
              {!isCollapsed && <span>{t('housekeeping')}</span>}
            </button>

            {/* Opción 7: Motor de Reservas (Enlace Externo) */}
            <a
              href="https://beachcanasvieiras.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={16} strokeWidth={1.8} className="text-gray-500" />
                {!isCollapsed && <span>{t('booking_engine')}</span>}
              </div>
            </a>

            {/* Opción 8: Configuraciones (Colapsable) */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSubMenu('settings')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings size={16} strokeWidth={1.8} className="text-gray-500" />
                  {!isCollapsed && <span>{t('settings.title')}</span>}
                </div>
                {!isCollapsed && (openMenus.settings ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {/* Sub-enlaces de Configuraciones */}
              {openMenus.settings && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <button
                    onClick={() => onNavigate('settings_all')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('settings.all_settings')}
                  </button>
                  <button
                    onClick={() => onNavigate('settings_email')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('settings.email_templates')}
                  </button>
                  <button
                    onClick={() => onNavigate('settings_exchange')}
                    className="w-full text-left px-3 py-2 rounded-lg font-body text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t('settings.exchange_rates')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Cierre de Sesión (Abajo) */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-3.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.8} />
          {!isCollapsed && <span>{t('logout')}</span>}
        </button>
      </div>

    </div>
  );
};