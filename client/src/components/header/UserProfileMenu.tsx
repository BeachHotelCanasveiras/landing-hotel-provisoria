/**
 * @file UserProfileMenu.tsx
 * @description Sub-componente atómico para el menú desplegable del perfil de usuario autenticado.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-popover, bg-muted, border-border, text-foreground y text-destructive de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del menú de perfil de usuario.
 * - UX/UI: Avatar con iniciales de respaldo, saludo personalizado y diseño glassmorphic.
 * - ISO 27001: Rutas de control interno protegidas y cierre seguro de sesión.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileMenuProps {
  /** Objeto de usuario autenticado de Supabase */
  user: SupabaseUser;
  /** Callback para ejecutar el cierre de sesión seguro */
  onSignOut: () => Promise<void>;
  /** Callback para redireccionar en el enrutador */
  onNavigate: (path: string) => void;
  /** Función de traducción del componente padre */
  t: (key: string) => string;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  onSignOut,
  onNavigate,
  t,
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del menú
  usePerformanceProfiler('UserProfileMenu');

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extraer información legible del perfil del usuario
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Huésped';
  const firstName = fullName.trim().split(' ')[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  
  // Generador de iniciales de respaldo
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Cerrar el menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="relative text-left"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      ref={menuRef}
    >
      {/* Botón de Perfil con saludo e imagen de avatar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-muted/10 border border-border hover:border-accent transition-all duration-300 cursor-pointer text-left select-none group"
      >
        <span className="hidden md:inline font-body text-xs text-muted-foreground group-hover:text-foreground transition-colors tracking-wide font-light">
          Olá, <span className="font-medium text-foreground">{firstName}</span>
        </span>
        <Avatar className="w-7 h-7 border border-border/30 shadow-sm">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-body font-bold text-[10px]">
            {initials || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Menú Flotante con Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-2xl p-1.5 flex flex-col gap-1 shadow-2xl z-50 min-w-[210px] origin-top-right"
          >
            {/* Cabecera de Identidad */}
            <div className="px-3.5 py-2.5 border-b border-border/50 select-none">
              <p className="text-[10px] text-accent uppercase tracking-widest font-bold">Sesión Activa</p>
              <p className="text-xs font-semibold text-foreground truncate mt-1">{fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-light">{user.email}</p>
            </div>

            {/* Enlaces de Acción */}
            <div className="pt-1.5 space-y-1">
              {/* Opción 1: Ir al Panel (PMS / DevOps / Guest) */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/admin');
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-xl text-[11px] font-body uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer border-none bg-transparent text-left"
              >
                <LayoutDashboard size={14} strokeWidth={1.5} className="text-accent" />
                {t('dashboard') || 'Mi Panel'}
              </button>

              {/* Opción 2: Cerrar Sesión Segura */}
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await onSignOut();
                  onNavigate('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-destructive/10 text-destructive/85 hover:text-destructive rounded-xl text-[11px] font-body uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer border-none bg-transparent text-left"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sair / Salir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};