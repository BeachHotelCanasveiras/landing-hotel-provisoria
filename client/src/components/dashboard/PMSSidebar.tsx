/**
 * @file PMSSidebar.tsx
 * @description Panel colapsable de navegación principal del PMS.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface y pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje.
 * - Trinidad Atómica: Localización total del texto institucional del hotel.
 * - Control Multitema: Selector de píldora segmentada integrado en el pie del sidebar.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Calendar, BarChart3, Briefcase, 
  Sparkles, ExternalLink, Settings, LogOut, ChevronDown, ChevronUp, 
  Menu, Hotel, Sun, Moon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, type DashboardTheme } from '@/contexts/ThemeContext';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { PMSSidebarTranslationSchema } from '@/locales/schemas/pms_sidebar.schema';

interface SubMenuItem {
  key: string;
  label: string;
  view: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  view?: string;
  subItems?: SubMenuItem[];
}

interface PMSSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSignOut: () => Promise<void>;
}

export const PMSSidebar: React.FC<PMSSidebarProps> = ({
  currentView,
  onNavigate,
  onSignOut,
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia de montaje
  usePerformanceProfiler('PMSSidebar');

  const { t, i18n } = useTranslation('pms_sidebar');
  const { dashboardTheme, setDashboardTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    bookings: false,
    property: true,
    reports: false,
    accounting: false,
    settings: false,
  });

  // Validación de esquema en modo DEV (Failsafe)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'pms_sidebar') || {};
      PMSSidebarTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[PMSSidebar] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const toggleSubMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  /**
   * Rota los temas del dashboard de forma secuencial al estar el menú colapsado
   */
  const cycleDashboardTheme = () => {
    const themes: DashboardTheme[] = ['light', 'sovereign-dark', 'gemini-dark'];
    const currentIndex = themes.indexOf(dashboardTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setDashboardTheme(themes[nextIndex]);
  };

  // Configuración del menú consumiendo el esquema de traducción
  const menuConfig: MenuItem[] = [
    {
      key: 'overview',
      label: t('overview'),
      icon: LayoutDashboard,
      view: 'overview'
    },
    {
      key: 'bookings',
      label: t('bookings.title'),
      icon: Calendar,
      subItems: [
        { key: 'map', label: t('bookings.room_map'), view: 'room_map' },
        { key: 'search', label: t('bookings.search'), view: 'booking_search' },
      ]
    },
    {
      key: 'property',
      label: t('property.title'),
      icon: Hotel,
      subItems: [
        { key: 'inventory', label: t('property.inventory'), view: 'room_inventory' },
        { key: 'rates', label: t('property.rates'), view: 'rates' },
      ]
    },
    {
      key: 'housekeeping',
      label: t('housekeeping'),
      icon: Sparkles,
      view: 'housekeeping'
    },
    {
      key: 'accounting',
      label: t('accounting.title'),
      icon: Briefcase,
      subItems: [
        { key: 'cash', label: t('accounting.cash_flow'), view: 'acc_cash_flow' },
        { key: 'expenses', label: t('accounting.expenses'), view: 'acc_expenses' },
      ]
    },
    {
      key: 'reports',
      label: t('reports.title'),
      icon: BarChart3,
      subItems: [
        { key: 'revenue', label: t('reports.revenue'), view: 'report_revenue' },
        { key: 'police', label: t('reports.police'), view: 'report_police' },
      ]
    },
    {
      key: 'settings',
      label: t('settings.title'),
      icon: Settings,
      subItems: [
        { key: 'staff', label: t('settings.staff'), view: 'staff' },
        { key: 'all', label: t('settings.all_settings'), view: 'settings_all' },
      ]
    }
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-pms-surface text-pms-text-muted font-body flex flex-col justify-between transition-all duration-500 border-r border-pms-border shadow-2xl shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* HEADER (Con marcas de posición traducidas de forma robusta) */}
        <div className="p-6 mb-2 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-700">
              <div className="w-9 h-9 rounded-xl bg-pms-accent flex items-center justify-center text-pms-accent-foreground shadow-lg transition-transform duration-300">
                <Hotel size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold text-pms-text leading-tight">
                  {t('brand_title', { defaultValue: 'Mini Hotel' })}
                </span>
                <span className="text-[9px] font-bold text-pms-accent uppercase tracking-tighter">
                  {t('brand_subtitle', { defaultValue: 'Premium PMS' })}
                </span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-pms-surface-high rounded-xl transition-all text-pms-text-muted hover:text-pms-text cursor-pointer"
            aria-label="Minimizar barra lateral"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* NAV (Gobernación Semántica del Menú) */}
        <div className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-pms-text-muted uppercase tracking-[0.2em] pl-4 mb-3 mt-2 opacity-60">
              {t('menu_principal')}
            </p>
          )}

          {menuConfig.map((item) => {
            const Icon = item.icon;
            const isGroup = !!item.subItems;
            const isOpen = openMenus[item.key];
            const isActive = currentView === item.view || item.subItems?.some(s => s.view === currentView);

            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => isGroup ? toggleSubMenu(item.key) : item.view && onNavigate(item.view)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer border-none",
                    isActive && !isGroup 
                      ? "bg-pms-accent text-pms-accent-foreground shadow-lg" 
                      : "hover:bg-pms-surface-high text-pms-text-muted hover:text-pms-text"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 1.8} 
                      className={cn(isActive ? "text-pms-accent-foreground" : "text-pms-text-muted group-hover:text-pms-text")} 
                    />
                    {!isCollapsed && (
                      <span className={cn("text-xs font-semibold uppercase tracking-wider", isActive ? "opacity-100" : "opacity-80")}>
                        {item.label}
                      </span>
                    )}
                  </div>
                  {isGroup && !isCollapsed && (
                    isOpen ? <ChevronDown size={14} className="opacity-40" /> : <ChevronUp size={14} className="opacity-40" />
                  )}
                </button>

                {isGroup && isOpen && !isCollapsed && (
                  <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems?.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => onNavigate(sub.view)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer relative border-none bg-transparent",
                          currentView === sub.view 
                            ? "text-pms-accent font-bold bg-pms-accent/5" 
                            : "text-pms-text-muted hover:text-pms-text hover:bg-pms-surface-high"
                        )}
                      >
                        {currentView === sub.view && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-pms-accent rounded-full" />
                        )}
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER & CONTROL MULTITEMA INTEGRADO (SaaS Spec) */}
      <div className="p-4 border-t border-pms-border flex flex-col gap-4 bg-pms-surface-high/20">
        
        {/* Selector Multitema Píldora Segmentada */}
        <div className="flex justify-center">
          {isCollapsed ? (
            <button
              onClick={cycleDashboardTheme}
              className="p-3 bg-pms-surface-high border border-pms-border rounded-full hover:bg-pms-accent hover:text-pms-accent-foreground transition-all cursor-pointer shadow-sm text-pms-text animate-pulse"
              title="Alternar Tema PMS"
            >
              {dashboardTheme === 'light' && <Sun size={15} />}
              {dashboardTheme === 'sovereign-dark' && <Moon size={15} />}
              {dashboardTheme === 'gemini-dark' && <Sparkles size={15} />}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 bg-pms-surface-high border border-pms-border rounded-full shadow-inner w-full max-w-[200px]">
              {[
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'sovereign-dark', icon: Moon, label: 'Sovereign' },
                { key: 'gemini-dark', icon: Sparkles, label: 'Gemini' }
              ].map((themeOpt) => {
                const IsActiveTheme = dashboardTheme === themeOpt.key;
                const ThemeIcon = themeOpt.icon;
                return (
                  <button
                    key={themeOpt.key}
                    onClick={() => setDashboardTheme(themeOpt.key as DashboardTheme)}
                    title={themeOpt.label}
                    className={cn(
                      "flex-1 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border-none bg-transparent",
                      IsActiveTheme 
                        ? "bg-pms-accent text-pms-accent-foreground shadow-md" 
                        : "text-pms-text-muted hover:text-pms-text hover:bg-pms-surface/50"
                    )}
                  >
                    <ThemeIcon size={14} className={IsActiveTheme ? "text-pms-accent-foreground" : ""} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Enlace Externo Motor de Reservas */}
        <a
          href="https://beachcanasvieiras.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pms-surface-high text-pms-text-muted hover:text-pms-text rounded-2xl transition-all text-xs font-semibold uppercase tracking-wider text-center"
        >
          <ExternalLink size={16} />
          {!isCollapsed && <span>{t('booking_engine')}</span>}
        </a>

        {/* Cerrar Sesión Segura */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-500/10 text-red-400/70 hover:text-red-400 rounded-2xl transition-all cursor-pointer border-none bg-transparent text-left"
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};