/**
 * @file PMSSidebar.tsx
 * @description Panel lateral de navegación plana de alta fidelidad estilo Vercel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN y principios SOLID:
 * - Estética Vercel: Diseñado con accesos planos e interactivos, libre de acordeones colapsables.
 * - Saneamiento Temático: Ajustado al modelo de dos estados (Claro y Oscuro) para resolver de forma definitiva las inconsistencias de superposición (TS2322 / TS2367).
 * - Identidad Visual: Logotipo corporativo de Cloudinary integrado junto a la marca "Beach Canasvieiras".
 * - Limpieza de Footer: Remoción absoluta de los botones de salida y enlaces del pie de página para despejar la interfaz.
 * - Saneamiento de Importaciones: Reincorporados los iconos 'Hotel', 'Sun' y 'Moon' en la importación de lucide-react para corregir TS2304.
 * - RBAC Seguro: Filtrado reactivo de menús por rol. El rol 'developer' tiene bypass absoluto a todas las vistas.
 * - Saneado: Satisface ESLint v9, libre de variables huérfanas y advertencias de renderizado.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Calendar, BarChart3, Briefcase, 
  Sparkles, ExternalLink, Settings, Menu, 
  Database, Users2, Hotel, Sun, Moon // 🚀 Saneado (TS2304): Reincorporadas las importaciones de iconos necesarias
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useTheme, type DashboardTheme } from '@/contexts/ThemeContext';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Logo } from '@/components/Logo'; // 🚀 Integración de Logotipo de la Casa
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
  roles?: UserRole[]; // Restricción opcional de acceso (RBAC)
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
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia de montaje
  usePerformanceProfiler('PMSSidebar');

  const { t, i18n } = useTranslation('pms_sidebar');
  const { role } = useAuth(); // Saneado: Removido 'user' no utilizado para satisfacer ESLint
  const { dashboardTheme, setDashboardTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeRole: UserRole = role || 'guest';

  // Validación de esquema en modo DEV (Failsafe)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'pms_sidebar') || {};
      PMSSidebarTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[PMSSidebar] ❌ Error de integridad en esquema Zod:`, error);
    }
  }

  const cycleDashboardTheme = () => {
    // 🚀 SANEADO (TS2322): Rotación reducida para conmutar únicamente entre Claro (light) y Oscuro (dark)
    const themes: DashboardTheme[] = ['light', 'dark'];
    const currentIndex = themes.indexOf(dashboardTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setDashboardTheme(themes[nextIndex]);
  };

  // ============================================================================
  // ⚙️ CONFIGURACIÓN SSoT DE MENÚS Y RESTRICCIONES (RBAC)
  // ============================================================================
  const menuConfig: MenuItem[] = [
    {
      key: 'overview',
      label: t('overview'),
      icon: LayoutDashboard,
      view: 'overview',
      roles: ['admin', 'developer', 'receptionist', 'housekeeper', 'housekeeping_supervisor', 'guest']
    },
    {
      key: 'bookings',
      label: t('bookings.title'),
      icon: Calendar,
      roles: ['admin', 'developer', 'receptionist'],
      subItems: [
        { key: 'map', label: t('bookings.room_map'), view: 'room_map' },
        { key: 'search', label: t('bookings.search'), view: 'booking_search' },
      ]
    },
    {
      key: 'property',
      label: t('property.title'),
      icon: Hotel,
      roles: ['admin', 'developer', 'receptionist'],
      subItems: [
        { key: 'inventory', label: t('property.inventory'), view: 'room_inventory' },
        { key: 'rates', label: t('property.rates'), view: 'rates' },
      ]
    },
    {
      key: 'housekeeping',
      label: t('housekeeping'),
      icon: Sparkles,
      view: 'housekeeping',
      roles: ['admin', 'developer', 'receptionist', 'housekeeper', 'housekeeping_supervisor']
    },
    {
      key: 'accounting',
      label: t('accounting.title'),
      icon: Briefcase,
      roles: ['admin', 'developer'],
      subItems: [
        { key: 'cash', label: t('accounting.cash_flow'), view: 'acc_cash_flow' },
        { key: 'expenses', label: t('accounting.expenses'), view: 'acc_expenses' },
      ]
    },
    {
      key: 'reports',
      label: t('reports.title'),
      icon: BarChart3,
      roles: ['admin', 'developer', 'receptionist'],
      subItems: [
        { key: 'revenue', label: t('reports.revenue'), view: 'report_revenue' },
        { key: 'police', label: t('reports.police'), view: 'report_police' },
      ]
    },
    {
      key: 'agency_retail',
      label: t('agency_retail.title', { defaultValue: 'Agências de Viagens' }),
      icon: Users2,
      view: 'agency_retail_portal',
      roles: ['agency_retail']
    },
    {
      key: 'agency_wholesale',
      label: t('agency_wholesale.title', { defaultValue: 'Agências Majoristas' }),
      icon: Briefcase,
      view: 'agency_wholesale_portal',
      roles: ['agency_wholesale']
    },
    {
      key: 'booking_engine',
      label: t('booking_engine', { defaultValue: 'Motor de Reservas' }),
      icon: ExternalLink,
      view: 'booking_engine_external',
      roles: ['admin', 'developer', 'receptionist']
    },
    {
      key: 'database',
      label: t('database.title', { defaultValue: 'Base de Datos' }),
      icon: Database,
      roles: ['developer'],
      subItems: [
        { key: 'db_users', label: t('database.users', { defaultValue: 'Tabela Users' }), view: 'db_users' },
        { key: 'db_guests', label: t('database.guests', { defaultValue: 'Tabela Guests' }), view: 'db_guests' },
        { key: 'db_rooms', label: t('database.rooms', { defaultValue: 'Tabela Rooms' }), view: 'db_rooms' },
        { key: 'db_bookings', label: t('database.bookings', { defaultValue: 'Tabela Bookings' }), view: 'db_bookings' },
        { key: 'db_email_queue', label: t('database.email_queue', { defaultValue: 'Tabela Email Queue' }), view: 'db_email_queue' },
        { key: 'db_staff_profiles', label: t('database.staff_profiles', { defaultValue: 'Tabela Staff Profiles' }), view: 'db_staff_profiles' },
      ]
    },
    {
      key: 'settings',
      label: t('settings.title'),
      icon: Settings,
      roles: ['admin', 'developer'],
      subItems: [
        { key: 'staff', label: t('settings.staff'), view: 'staff' },
        { key: 'all', label: t('settings.all_settings'), view: 'settings_all' },
      ]
    }
  ];

  // ============================================================================
  // ⚡ FILTRADO REACTIVO DE SEGURIDAD (RBAC ENGINE)
  // ============================================================================
  const filteredMenu = menuConfig.filter(item => {
    // El rol 'developer' tiene bypass absoluto para ver todo el ecosistema
    if (activeRole === 'developer') return true;
    
    // Si el ítem define roles permitidos, verificar inclusión estricta
    if (item.roles && !item.roles.includes(activeRole)) return false;
    
    return true;
  });

  const handleItemNavigation = (item: MenuItem) => {
    if (item.key === 'booking_engine') {
      window.open('https://beachcanasvieiras.com', '_blank');
      return;
    }
    if (item.view) {
      onNavigate(item.view);
    } else if (item.subItems && item.subItems.length > 0) {
      // 🚀 NAVEGACIÓN PLANA VERCEL: Se redirige de inmediato al primer sub-elemento
      onNavigate(item.subItems[0].view);
    }
  };

  return (
    <div 
      className={cn(
        "h-screen bg-pms-surface text-pms-text-muted font-body flex flex-col justify-between transition-all duration-300 border-r border-pms-border shadow-xl shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* HEADER BRANDING */}
        <div className="p-6 mb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Logotipo responsivo de Cloudinary inyectado en el encabezado */}
            {!isCollapsed ? (
              <Logo variant="logo-main" theme="dark" className="h-6 origin-left animate-in fade-in duration-300" />
            ) : (
              <Logo variant="logo-square" theme="dark" className="w-8 h-8 rounded-xl shadow-md cursor-pointer mx-auto" />
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-pms-surface-high rounded-xl transition-all text-pms-text-muted hover:text-pms-text cursor-pointer border-none bg-transparent"
              aria-label="Minimizar barra lateral"
            >
              <Menu size={16} />
            </button>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col border-t border-pms-border/40 pt-4 animate-in fade-in duration-300">
              <span className="font-display text-sm font-bold text-pms-text leading-tight">
                Beach Canasvieiras
              </span>
              <span className="text-[9px] font-bold text-pms-accent uppercase tracking-tighter mt-0.5">
                {activeRole} Console
              </span>
            </div>
          )}
        </div>

        {/* LISTADO DE ACCESOS PLANOS (Vercel Style) */}
        <div className="px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {!isCollapsed && (
            <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-[0.25em] pl-4 mb-3 mt-2 opacity-60">
              {t('menu_principal')}
            </p>
          )}

          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view || item.subItems?.some(s => s.view === currentView);

            return (
              <div key={item.key}>
                <button
                  onClick={() => handleItemNavigation(item)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer border-none text-left",
                    isActive 
                      ? "bg-pms-surface-high text-pms-text shadow-sm border border-pms-border" 
                      : "bg-transparent text-pms-text-muted hover:text-pms-text hover:bg-pms-surface-high/30 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={16} 
                      strokeWidth={isActive ? 2.2 : 1.6} 
                      className={cn(isActive ? "text-pms-accent" : "text-pms-text-muted group-hover:text-pms-text")} 
                    />
                    {!isCollapsed && (
                      <span className={cn(
                        "text-[13px] tracking-normal normal-case transition-all", 
                        isActive ? "font-semibold text-pms-text" : "font-medium"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER & CONTROL MULTITEMA INTEGRADO */}
      <div className="p-4 border-t border-pms-border flex flex-col gap-4 bg-pms-surface-high/10">
        
        {/* Selector de Tema */}
        <div className="flex justify-center">
          {isCollapsed ? (
            <button
              onClick={cycleDashboardTheme}
              className="p-3 bg-pms-surface-high border border-pms-border rounded-full hover:bg-pms-accent hover:text-pms-accent-foreground transition-all cursor-pointer shadow-sm text-pms-text"
              title="Alternar Tema PMS"
            >
              {dashboardTheme === 'light' && <Sun size={14} />}
              {dashboardTheme === 'dark' && <Moon size={14} />}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1 bg-pms-surface-high border border-pms-border rounded-full shadow-inner w-full">
              {[
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'dark', icon: Moon, label: 'Dark' } // 🚀 SANEADO (TS2367): Mapeo acotado exclusivamente a Claro y Oscuro
              ].map((themeOpt) => {
                const IsActiveTheme = dashboardTheme === themeOpt.key;
                const ThemeIcon = themeOpt.icon;
                return (
                  <button
                    key={themeOpt.key}
                    onClick={() => setDashboardTheme(themeOpt.key as DashboardTheme)}
                    title={themeOpt.label}
                    className={cn(
                      "flex-1 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-none bg-transparent outline-none",
                      IsActiveTheme 
                        ? "bg-pms-surface text-pms-text shadow-sm border border-pms-border" 
                        : "text-pms-text-muted hover:text-pms-text"
                    )}
                  >
                    <ThemeIcon size={12} className={IsActiveTheme ? "text-pms-accent" : ""} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};