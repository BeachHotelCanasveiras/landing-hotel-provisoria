/**
 * @file Success.tsx
 * @description Página de retorno de Stripe (Fase 6 Post-Venta).
 * Implementa la arquitectura "Venta Primero, Registro Después".
 * - Recupera la sesión asíncrona de Stripe.
 * - Despliega un formulario de fricción mínima para capturar la contraseña.
 * - Crea el usuario en Supabase Auth y lo asocia silenciosamente a su reserva.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StorageService } from '@/lib/storage';

export default function Success() {
  const { t } = useTranslation('booking');
  const [, setLocation] = useLocation();

  // Estados de recuperación y autenticación
  const [loadingSession, setLoadingSession] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Datos recuperados de Stripe
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  
  // Datos de entrada del usuario
  const [password, setPassword] = useState('');

  useEffect(() => {
    /**
     * Recupera el ID de sesión de Stripe de la URL (Ej: ?session_id=cs_test_...)
     * y consulta al backend para obtener el correo del huésped.
     */
    const fetchStripeSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setLoadingSession(false);
        return;
      }

      try {
        // Esta llamada a la API la construiremos en el siguiente paso del backend
        const response = await fetch(`/api/checkout/retrieve?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          // Pre-cargamos los datos del cliente para que no tenga que volver a escribirlos
          setGuestEmail(data.customer_email || '');
          setGuestName(data.customer_name || 'Huésped');
          
          // Persistimos el estado en cookie de 1 año (Manifiesto de Ingeniería)
          StorageService.setCookie('beach_hotel_pending_registration', 'true');
        }
      } catch (error) {
        console.error('Error al recuperar sesión de Stripe:', error);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchStripeSession();
  }, []);

  /**
   * Registra al usuario en Supabase Auth y lo redirige a su Dashboard.
   * El correo se enlaza de forma automática con la tabla 'guests' mediante triggers SQL.
   */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsRegistering(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: guestEmail,
        password: password,
        options: {
          data: {
            role: 'guest',
            full_name: guestName,
          },
        },
      });

      if (error) throw error;

      toast.success(t('success_toast_ok'));
      // Limpiamos la cookie ya que el registro se concretó
      StorageService.setCookie('beach_hotel_pending_registration', 'false');
      
      // Redirección inmediata al PMS del huésped
      setLocation('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta.');
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 px-4 py-12 selection:bg-accent/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center relative overflow-hidden"
      >
        {loadingSession ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 opacity-50" />
            <p className="font-body text-sm text-gray-500 font-medium tracking-wide">
              {t('success_loading')}
            </p>
          </div>
        ) : (
          <>
            {/* Animación de Éxito Lujosa */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm"
            >
              <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2.5} />
            </motion.div>

            <h1 className="font-display text-3xl text-gray-900 tracking-tight mb-2">
              {t('success_title')}
            </h1>
            <p className="font-body text-sm text-gray-500 leading-relaxed font-light mb-8 max-w-sm mx-auto">
              {t('success_subtitle')}
            </p>

            {/* Formulario de Alta Conversión */}
            <form onSubmit={handleCreateAccount} className="space-y-4 text-left">
              
              {/* Correo Recuperado (Solo lectura) */}
              {guestEmail && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100/50 flex items-center justify-between">
                  <span className="font-body text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</span>
                  <span className="font-body text-sm text-gray-700 font-medium truncate ml-2">
                    {guestEmail}
                  </span>
                </div>
              )}

              {/* Captura de Contraseña */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <div className="flex-1">
                  <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {t('success_password_label')}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('success_password_placeholder')}
                    disabled={isRegistering}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Botón de Creación */}
              <Button
                type="submit"
                disabled={isRegistering || !password}
                className="w-full h-14 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('success_button')}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}