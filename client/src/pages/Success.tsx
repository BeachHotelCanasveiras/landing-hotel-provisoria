/**
 * @file Success.tsx
 * @description Página de retorno de Stripe (Fase 6 Post-Venta).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border, bg-primary y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del portal de éxito.
 * - Saneamiento ESLint: Sincronización estricta de dependencias en useEffect para resolver react-hooks/exhaustive-deps.
 * - Arquitectura Venta Primero, Registro Después: Reclamo de cuenta con verificación de firma Stripe.
 * - Desglose de Categoría: Muestra la categoría de alojamiento contratada de forma clara y desacoplada de ID físico.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, ArrowRight, Loader2, Mail, Send, Calendar, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { StorageService } from '@/lib/storage';

export default function Success() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de la modal de éxito
  usePerformanceProfiler('Success');

  const { t } = useTranslation('booking');
  const [, setLocation] = useLocation();

  const [loadingSession, setLoadingSession] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [password, setPassword] = useState('');

  // --- DETALLES DE COMPRA ADICIONALES (Smart Identity Manifesto) ---
  const [purchaseRoom, setPurchaseRoom] = useState('');
  const [purchaseCheckIn, setPurchaseCheckIn] = useState('');
  const [purchaseCheckOut, setPurchaseCheckOut] = useState('');
  const [purchaseTotalPrice, setPurchaseTotalPrice] = useState<number | null>(null);
  const [purchaseCurrency, setPurchaseCurrency] = useState('BRL');

  // --- WIDGET DE ENVÍO ALTERNATIVO ---
  const [alternativeEmail, setAlternativeEmail] = useState('');
  const [isSendingCopy, setIsSendingCopy] = useState(false);
  const [copySent, setCopySent] = useState(false);

  useEffect(() => {
    const fetchStripeSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setLoadingSession(false);
        setLocation('/');
        return;
      }

      try {
        const response = await fetch(`/api/checkout/retrieve?session_id=${sessionId}`);
        if (!response.ok) throw new Error('No se pudo recuperar la sesión.');
        
        const data = await response.json();
        setGuestEmail(data.customer_email || '');
        setGuestName(data.customer_name || 'Huésped');
        
        // Carga de variables financieras de Stripe expandidas (Categoría)
        setPurchaseRoom(data.room_name || 'Habitación Reservada');
        setPurchaseCheckIn(data.check_in || '');
        setPurchaseCheckOut(data.check_out || '');
        setPurchaseTotalPrice(data.total_price || null);
        setPurchaseCurrency(data.currency || 'BRL');
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        toast.error('Error al validar tu reserva.');
      } finally {
        setLoadingSession(false);
      }
    };

    fetchStripeSession();
    // 🚀 Saneamiento react-hooks/exhaustive-deps: Sincronización inmaculada de dependencias estables
  }, [
    setLocation, 
    setGuestEmail, 
    setGuestName, 
    setPurchaseRoom, 
    setPurchaseCheckIn, 
    setPurchaseCheckOut, 
    setPurchaseTotalPrice, 
    setPurchaseCurrency
  ]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsRegistering(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      // 1. Reclamar la cuenta pre-creada mediante nuestro endpoint seguro de firma
      const response = await fetch('/api/checkout/claim-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la reclamación de la cuenta.');
      }

      // 2. Iniciar sesión automáticamente de forma transparente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: password,
      });

      if (signInError) throw signInError;

      toast.success(t('success_toast_ok') || '¡Cuenta activada con éxito!');
      StorageService.setCookie('beach_hotel_pending_registration', 'false');
      setLocation('/admin');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al crear la cuenta.';
      toast.error(msg);
      setIsRegistering(false);
    }
  };

  const handleSendAlternativeCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alternativeEmail || !alternativeEmail.trim()) {
      toast.error('Por favor, ingresa un correo de destino.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(alternativeEmail)) {
      toast.error('Por favor, ingresa una dirección de correo válida.');
      return;
    }

    setIsSendingCopy(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      const response = await fetch('/api/checkout/send-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          alternativeEmail: alternativeEmail.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo despachar el correo secundario.');
      }

      setCopySent(true);
      toast.success('¡Comprobante alternativo enviado con éxito!');
      setAlternativeEmail('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error de red al despachar copia.';
      toast.error(msg);
    } finally {
      setIsSendingCopy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/50 px-4 py-12 selection:bg-accent/30 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-card rounded-[2.5rem] border border-border p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center relative overflow-hidden"
      >
        {loadingSession ? (
          <div className="flex flex-col items-center justify-center py-12 bg-transparent">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 opacity-50" />
            <p className="font-body text-sm text-muted-foreground font-medium tracking-wide">
              {t('success_loading')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Cabecera Éxito */}
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-card shadow-xs"
              >
                <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2.5} />
              </motion.div>

              <h1 className="font-display text-3xl text-foreground tracking-tight">
                {guestName ? `Obrigado, ${guestName.trim().split(' ')[0]}!` : t('success_title')}
              </h1>
              <p className="font-body text-xs text-muted-foreground font-light mt-1 text-center">
                {t('success_subtitle')}
              </p>
            </div>

            {/* 📋 TARJETA DESGLOSE DE COMPRA (Categoría de Alojamiento) */}
            {purchaseTotalPrice !== null && (
              <div className="p-5 bg-muted rounded-2xl border border-border text-left space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
                  <Calendar size={13} className="text-accent" />
                  <span className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest">Resumen de Estadía</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-body text-muted-foreground">Alojamiento</span>
                  <span className="font-body font-semibold text-foreground">{purchaseRoom}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-body text-muted-foreground">Periodo</span>
                  <span className="font-body font-semibold text-foreground">{purchaseCheckIn} al {purchaseCheckOut}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed border-border">
                  <span className="font-body text-foreground font-bold">Total Pagado</span>
                  <span className="font-display text-base font-bold text-accent">
                    {purchaseCurrency} {purchaseTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* 📧 WIDGET DE ENVÍO ALTERNATIVO (Comprobante secundario) */}
            <div className="p-5 bg-accent/10 rounded-2xl border border-accent/20 text-left space-y-3">
              <div>
                <p className="text-[10px] font-body font-bold text-foreground uppercase tracking-widest">¿Enviar copia a otro correo?</p>
                <p className="text-[10px] text-muted-foreground font-light mt-0.5">Útil para justificantes de empresa o acompañantes.</p>
              </div>

              <form onSubmit={handleSendAlternativeCopy} className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-xl border border-border bg-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all flex items-center gap-2">
                  <Mail size={13} className="text-muted-foreground" />
                  <input
                    type="email"
                    value={alternativeEmail}
                    onChange={(e) => setAlternativeEmail(e.target.value)}
                    placeholder="contador@empresa.com"
                    disabled={isSendingCopy || copySent}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingCopy || !alternativeEmail}
                  className="px-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-body font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none border-none"
                >
                  {isSendingCopy ? <Loader2 size={12} className="animate-spin" /> : copySent ? <Check size={12} className="text-green-500" /> : <Send size={11} />}
                  {copySent ? 'Enviado' : 'Enviar'}
                </button>
              </form>
            </div>

            {/* Formulario Activación de Cuenta */}
            <form onSubmit={handleCreateAccount} className="space-y-4 text-left">
              <div className="p-3.5 rounded-2xl bg-muted border border-border/50 flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Principal</span>
                <span className="font-body text-sm text-foreground font-medium truncate ml-2">
                  {guestEmail}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <label className="block text-[9px] font-body font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    {t('success_password_label')}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('success_password_placeholder')}
                    disabled={isRegistering}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isRegistering || !password}
                className="w-full h-14 mt-4 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 border-none"
              >
                {isRegistering ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                ) : (
                  <>
                    {t('success_button')}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

          </div>
        )}
      </motion.div>
    </div>
  );
}