/**
 * @file AdminDashboard.tsx
 * @description Orquestador principal del panel de control multi-rol.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Código atómico: Delega la UI compleja a submódulos aislados.
 * - Enrutamiento protegido y gestión de sesión global con Supabase Auth.
 * - Estética Vercel: Cabecera minimalista y transiciones fluidas.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Importación limpia desde el archivo barril del módulo Dashboard
import { 
  GuestPortal, 
  AgencyPortal, 
  AdminPMS, 
  DeveloperConsole 
} from '@/components/dashboard';

export default function AdminDashboard() {
  const { t } = useTranslation('dashboard');
  const [, setLocation] = useLocation();
  const { user, role, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Redirigir si no hay sesión activa (Failsafe de seguridad)
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

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL (Orquestación Delegada por Rol) */}
      <main className="flex-1 container px-6 py-12 max-w-5xl">
        <div className="mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-[0.25em] mb-2">
            {t('role_badge')}: {role}
          </p>
          <h2 className="font-display text-4xl text-gray-900 tracking-tight">
            {t('welcome_message')} {user.user_metadata?.full_name || user.email?.split('@')[0]}
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
            {role === 'developer' && <DeveloperConsole t={t} />}
            {role === 'admin'      && <AdminPMS t={t} />}
            {role === 'agency'     && <AgencyPortal userEmail={user.email || ''} t={t} />}
            {role === 'guest'      && <GuestPortal userEmail={user.email || ''} t={t} />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}