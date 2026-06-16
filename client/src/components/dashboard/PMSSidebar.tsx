/**
 * @file PMSSidebar.tsx
 * @description Panel colapsable de navegación principal del PMS.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Full Internationalization: 0% strings hardcodeados.
 * - Trinidad Atómica: Integración con PMSSidebarTranslationSchema.
 * - UX Premium: Estética de lujo con micro-interacciones.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Calendar, BarChart3, Briefcase, 
  Sparkles, ExternalLink, Settings, LogOut, ChevronDown, ChevronUp, 
  Menu, Hotel 
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const { t, i18n } = useTranslation('pms_sidebar');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    bookings: false,
    property: true,
    reports: false,
    accounting: false,
    settings: false,
  });

  // Validación de esquema en modo DEV
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
        "h-screen bg-[#141517] text-gray-400 font-body flex flex-col justify-between transition-all duration-500 border-r border-white/5 shadow-2xl shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* HEADER */}
        <div className="p-6 mb-2 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-700">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-[0_0_20px_rgba(212,165,116,0.3)]">
                <Hotel size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold text-white leading-tight">Mini Hotel</span>
                <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">Premium PMS</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-white cursor-pointer"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* NAV */}
        <div className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-none">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] pl-4 mb-4 mt-2">
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
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer",
                    isActive && !isGroup ? "bg-accent text-white shadow-lg" : "hover:bg-white/5",
                    isActive && isGroup && "text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                    {!isCollapsed && (
                      <span className={cn("text-xs font-semibold uppercase tracking-wider", isActive ? "opacity-100" : "opacity-80")}>
                        {item.label}
                      </span>
                    )}
                  </div>
                  {isGroup && !isCollapsed && (
                    isOpen ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />
                  )}
                </button>

                {isGroup && isOpen && !isCollapsed && (
                  <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems?.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => onNavigate(sub.view)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer relative",
                          currentView === sub.view 
                            ? "text-accent font-bold bg-accent/5" 
                            : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                        )}
                      >
                        {currentView === sub.view && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-accent rounded-full" />
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

      {/* FOOTER */}
      <div className="p-4 border-t border-white/5">
        <a
          href="https://beachcanasvieiras.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 mb-2 hover:bg-white/5 text-gray-500 hover:text-white rounded-2xl transition-all text-xs font-semibold uppercase tracking-wider"
        >
          <ExternalLink size={16} />
          {!isCollapsed && <span>{t('booking_engine')}</span>}
        </a>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-500/10 text-red-400/70 hover:text-red-400 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};