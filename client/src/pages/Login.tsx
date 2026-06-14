/**
 * @file Login.tsx
 * @description Portal de Autenticación de Mínima Fricción.
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
import { supabase } from '@/lib/supabase';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // <-- CORRECCIÓN: Importación de la utilidad cn agregada

export default function Login() {
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
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error inesperado.');
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
    } catch (error: any) {
      toast.error(`Error de autenticación con ${provider}: ` + error.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 px-4 py-12 selection:bg-accent/30">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
      >
        {/* Cabecera del Portal */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-3">
            Hotel Beach Portal
          </span>
          <h1 className="font-display text-3xl text-gray-900 tracking-tight">
            {isRegister ? t('title_register') : t('title_login')}
          </h1>
          <p className="font-body text-xs text-gray-400 mt-2">
            {isRegister ? t('subtitle_register') : t('subtitle_login')}
          </p>
        </div>

        {/* 1. BOTONES DE ACCESO SOCIAL (Mínima fricción) */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin('google')}
            className="h-14 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center border border-gray-100/60 transition-all active:scale-95"
            title="Acceder con Google"
          >
            <Chrome size={20} className="text-red-500" />
          </button>
          
          {/* Apple */}
          <button
            onClick={() => handleSocialLogin('apple')}
            className="h-14 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center border border-gray-100/60 transition-all active:scale-95"
            title="Acceder con Apple"
          >
            <span className="font-sans font-bold text-lg text-black"></span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleSocialLogin('facebook')}
            className="h-14 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center border border-gray-100/60 transition-all active:scale-95"
            title="Acceder con Facebook"
          >
            <Facebook size={20} className="text-blue-600" />
          </button>

          {/* Instagram */}
          <button
            onClick={() => toast.info('Acceso con Instagram próximamente disponible.')}
            className="h-14 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center border border-gray-100/60 transition-all active:scale-95"
            title="Acceder con Instagram"
          >
            <span className="font-body font-bold text-xs bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">Insta</span>
          </button>
        </div>

        {/* Divisor Visual */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="font-body text-[10px] text-gray-300 uppercase tracking-widest font-bold">o ingresa con correo</span>
          <div className="h-px bg-gray-100 flex-1" />
        </div>

        {/* 2. FORMULARIO DE ACCESO POR CORREO */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo Correo */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('email_label')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('password_label')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
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
                <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest pl-1">
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
                        "h-11 rounded-xl border font-body text-[11px] font-semibold transition-all cursor-pointer",
                        selectedRole === item.role 
                          ? "bg-accent border-accent text-accent-foreground shadow-xs" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
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
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? t('button_register') : t('button_login')}
          </Button>

        </form>

        {/* Interruptor de Modo (Login vs Registro) */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-body text-accent hover:text-accent-foreground underline underline-offset-4 font-medium transition-colors"
          >
            {isRegister ? t('switch_to_login') : t('switch_to_register')}
          </button>
        </div>

      </motion.div>
    </div>
  );
}