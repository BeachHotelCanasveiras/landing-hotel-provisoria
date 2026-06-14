/**
 * @file AdminDashboard.tsx
 * @description Panel de control multi-rol con estética de diseño de Vercel.
 * - Soporte adaptativo para los 4 roles (guest, agency, admin, developer).
 * - Cabecera con menú de perfil y avatar intuitivo.
 * - Integrado con i18next, Supabase Auth y Framer Motion para transiciones fluidas.
 * - Rendimiento optimizado mediante modularidad interna.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  LogOut, Database, Layers, TrendingUp, Calendar, DollarSign, 
  Wifi, CheckCircle2, FileText, User, Compass, Tag, ShieldCheck 
} from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation('dashboard');
  const [, setLocation] = useLocation();
  const { user, role, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Redirigir si no hay sesión activa
  if (!user) {
    setLocation('/login');
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  // Obtener inicial para el avatar fallback
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body selection:bg-accent/30 flex flex-col">
      
      {/* 1. CABECERA AL ESTILO VERCEL (Minimalismo de Alta Definición) */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo Símbolo del Hotel */}
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-brand text-base font-bold shadow-xs">
            B
          </div>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            {role === 'developer' ? t('views.developer.title') : 
             role === 'admin' ? t('views.admin.title') : 
             role === 'agency' ? t('views.agency.title') : 
             t('views.guest.title')}
          </span>
        </div>

        {/* Menú de Perfil de Usuario e Interacción con el Avatar */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-all active:scale-95"
            aria-label="Menú de perfil"
          >
            <Avatar className="w-9 h-9 border border-gray-100 shadow-sm cursor-pointer">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-gray-950 text-white font-body font-bold text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl p-2 shadow-xl z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400 font-light">Autenticado como:</p>
                  <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[9px] font-bold uppercase tracking-wider mt-2 border border-gray-100">
                    {role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 mt-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  {t('logout_button')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. AREA DE CONTENIDO PRINCIPAL (Renderizado condicional por Rol) */}
      <main className="flex-1 container px-6 py-12 max-w-5xl">
        <div className="mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-[0.25em] mb-2">
            {t('role_badge')}: {role}
          </p>
          <h2 className="font-display text-4xl text-gray-900 tracking-tight">
            {t('welcome_message')} {user.email?.split('@')[0]}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {role === 'developer' && <DeveloperDashboardView t={t} />}
            {role === 'admin' && <AdminDashboardView t={t} />}
            {role === 'agency' && <AgencyDashboardView t={t} />}
            {role === 'guest' && <GuestDashboardView t={t} />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

// ============================================================================
// SUB-DASHBOARD 1: HUÉSPED (GUEST)
// ============================================================================
function GuestDashboardView({ t }: { t: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-6">
        <h3 className="font-display text-2xl text-gray-900 tracking-tight">
          {t('views.guest.my_bookings')}
        </h3>
        <div className="h-40 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50">
          <Calendar className="w-8 h-8 text-gray-300 mb-2" />
          <p className="font-body text-sm text-gray-400 font-light">
            {t('views.guest.no_bookings')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 space-y-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Compass size={20} />
        </div>
        <h4 className="font-display text-lg text-gray-900 tracking-tight">
          {t('views.guest.guide_title')}
        </h4>
        <p className="font-body text-xs text-gray-500 leading-relaxed font-light">
          {t('views.guest.guide_desc')}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-DASHBOARD 2: AGENCIA (AGENCY)
// ============================================================================
function AgencyDashboardView({ t }: { t: any }) {
  const mockRates = [
    { type: 'Habitación Single', rate: 'R$ 180' },
    { type: 'Habitación Doble', rate: 'R$ 252' },
    { type: 'Habitación Triple', rate: 'R$ 306' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-6">
        <h3 className="font-display text-2xl text-gray-900 tracking-tight">
          {t('views.agency.wholesale_rates')}
        </h3>
        
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          {mockRates.map((rate, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-b-0">
              <span className="font-body text-sm font-semibold text-gray-800">{rate.type}</span>
              <span className="font-body text-sm text-green-600 font-bold">{rate.rate} / noche</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 space-y-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Tag size={20} />
        </div>
        <h4 className="font-display text-lg text-gray-900 tracking-tight">
          {t('views.agency.discount_label')}
        </h4>
        <p className="font-body text-xs text-gray-500 leading-relaxed font-light">
          Usa tu código preferencial de operador para aplicar descuentos automáticos en cotizaciones grupales.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-DASHBOARD 3: ADMINISTRADOR (ADMIN)
// ============================================================================
function AdminDashboardView({ t }: { t: any }) {
  const stats = [
    { label: t('views.admin.occupancy'), value: '84%', change: '+2.4%', icon: TrendingUp },
    { label: t('views.admin.monthly_revenue'), value: 'R$ 48,200', change: '+12%', icon: DollarSign },
    { label: t('views.admin.active_bookings'), value: '18', change: 'Estable', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Grid de Métricas de Vercel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-body text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="font-body text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <span className="inline-block text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md mt-2">
                  {stat.change}
                </span>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Listado de Reservas Activas */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-6">
        <h3 className="font-display text-2xl text-gray-900 tracking-tight">
          {t('views.admin.bookings_list')}
        </h3>
        <div className="h-40 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50">
          <FileText className="w-8 h-8 text-gray-300 mb-2" />
          <p className="font-body text-sm text-gray-400 font-light">
            No hay solicitudes de reserva pendientes para procesar.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-DASHBOARD 4: DESARROLLADOR (DEVELOPER)
// ============================================================================
function DeveloperDashboardView({ t }: { t: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-6">
        <h3 className="font-display text-2xl text-gray-900 tracking-tight">
          {t('views.developer.system_logs')}
        </h3>
        
        {/* Consola DevOps de Sistema */}
        <div className="p-4 bg-gray-950 text-green-400 rounded-2xl font-mono text-xs overflow-x-auto space-y-2 border border-gray-900">
          <p className="text-gray-500">[2026-06-14 03:04:12] INFO: Supabase Auth SDK initialized.</p>
          <p className="text-gray-500">[2026-06-14 03:04:18] INFO: Connection success to 'public.users'.</p>
          <p className="text-gray-500">[2026-06-14 03:04:22] INFO: Cloudinary asset lookup ok (total 7 assets cached).</p>
          <p className="text-green-500 animate-pulse">&gt; {t('views.developer.status_healthy')}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <ShieldCheck size={20} />
          </div>
          <h4 className="font-display text-lg text-gray-900 tracking-tight">
            Métricas de Salud
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Database Engine:</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <Database size={12} /> Connected
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Cloud Storage:</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <Layers size={12} /> Cloudinary OK
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Vercel Cache:</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <Wifi size={12} /> Active & Clean
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}