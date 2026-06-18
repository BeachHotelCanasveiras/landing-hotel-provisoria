/**
 * @file Login.tsx
 * @description Portal de Autenticación de Mínima Fricción de marca blanca.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border, bg-primary y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del portal de ingreso.
 * - Saneamiento de ESLint: Cero variables de tipo 'any' mediante tipado estricto de excepciones de red 'unknown'.
 * - Soporte para inicios de sesión rápidos (Google, Apple, Facebook, Instagram).
 * - Transición de estados fluida y animada (Framer Motion).
 * - Selector de roles durante el registro para facilitar la demostración de los 4 dashboards.
 * - Integrado con Supabase Auth y Sonner para notificaciones inmediatas.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Mail, Lock, UserPlus, LogIn, Chrome, Facebook } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Login() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del portal de login
  usePerformanceProfiler('Login');

  const { t } = useTranslation('auth');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(false);

  // Redirigir al dashboard si ya está autenticado
  if (user) {
    setLocation('/admin');
  }

  /**
   * Manejador de inicio de sesión o registro nativo de Supabase
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Registro de cuenta incluyendo Metadata del Rol para el trigger de base de datos
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole,
            },
          },
        });
        if (error) throw error;
        toast.success(t('toast_register_success'));
        setIsRegister(false); // Cambiar a login tras registrar
      } else {
        // Inicio de sesión clásico
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(t('toast_login_success'));
        setLocation('/admin');
      }
    } catch (error: unknown) {
      // 🚀 Saneamiento ESLint (Zero 'any'): Captura segura y tipada de errores
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicio de sesión social de Supabase (OAuth)
   */
  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/admin`,
        }
      });
      if (error) throw error;
    } catch (error: unknown) {
      // 🚀 Saneamiento ESLint (Zero 'any'): Captura segura y tipada de errores
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      toast.error(`Error de autenticación con ${provider}: ` + errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/50 px-4 py-12 selection:bg-accent/30 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-card rounded-[2.5rem] border border-border p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
      >
        {/* Cabecera del Portal */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-muted text-muted-foreground rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-3 border border-border">
            Hotel Beach Portal
          </span>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            {isRegister ? t('title_register') : t('title_login')}
          </h1>
          <p className="font-body text-xs text-muted-foreground mt-2">
            {isRegister ? t('subtitle_register') : t('subtitle_login')}
          </p>
        </div>

        {/* 1. BOTONES DE ACCESO SOCIAL (Mínima fricción) */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin('google')}
            className="h-14 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl flex items-center justify-center border border-border/60 transition-all active:scale-95 cursor-pointer"
            title="Acceder con Google"
          >
            <Chrome size={20} className="text-red-500" />
          </button>
          
          {/* Apple */}
          <button
            onClick={() => handleSocialLogin('apple')}
            className="h-14 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl flex items-center justify-center border border-border/60 transition-all active:scale-95 cursor-pointer"
            title="Acceder con Apple"
          >
            <span className="font-sans font-bold text-lg text-foreground select-none"></span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleSocialLogin('facebook')}
            className="h-14 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl flex items-center justify-center border border-border/60 transition-all active:scale-95 cursor-pointer"
            title="Acceder con Facebook"
          >
            <Facebook size={20} className="text-blue-600" />
          </button>

          {/* Instagram */}
          <button
            onClick={() => toast.info('Acceso con Instagram próximamente disponible.')}
            className="h-14 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl flex items-center justify-center border border-border/60 transition-all active:scale-95 cursor-pointer"
            title="Acceder con Instagram"
          >
            <span className="font-body font-bold text-xs bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">Insta</span>
          </button>
        </div>

        {/* Divisor Visual */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-border flex-1" />
          <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest font-bold">o ingresa con correo</span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* 2. FORMULARIO DE ACCESO POR CORREO */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo Correo */}
          <div className="p-4 rounded-2xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Mail size={18} className="text-muted-foreground" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                {t('email_label')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="p-4 rounded-2xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Lock size={18} className="text-muted-foreground" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                {t('password_label')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* SELECTOR DE ROL (Solo visible en Registro para permitir demostración) */}
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2 pt-2"
              >
                <label className="block text-[9px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  {t('role_label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'guest', label: t('roles.guest') },
                    { role: 'agency', label: t('roles.agency') },
                    { role: 'admin', label: t('roles.admin') },
                    { role: 'developer', label: t('roles.developer') },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role as UserRole)}
                      className={cn(
                        "h-11 rounded-xl border font-body text-[11px] font-semibold transition-all cursor-pointer bg-transparent",
                        selectedRole === item.role 
                          ? "bg-accent border-accent text-accent-foreground shadow-xs" 
                          : "bg-card border-border text-muted-foreground hover:border-accent"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de Envío Principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] border-none cursor-pointer"
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? t('button_register') : t('button_login')}
          </Button>

        </form>

        {/* Interruptor de Modo (Login vs Registro) */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-body text-accent hover:text-foreground underline underline-offset-4 font-medium transition-colors border-none bg-transparent"
          >
            {isRegister ? t('switch_to_login') : t('switch_to_register')}
          </button>
        </div>

      </motion.div>
    </div>
  );
}