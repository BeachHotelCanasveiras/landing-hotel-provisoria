/**
 * @file BookingDetailsForm.tsx
 * @description Sub-componente atómico para capturar datos de huésped, inicio de sesión rápido (SSO) y pago seguro.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje e interacciones del formulario.
 * - ISO 27001: Validación reactiva y segregación de responsabilidades.
 * - PCI-DSS: Integración con distintivos de seguridad Stripe.
 * - CRO / UX: Oculta SSO si está logueado y añade soporte interactivo de reservas para terceros (On Behalf).
 * - Compacto (Anti-Scroll): Reducción de paddings y altura de inputs y botones para garantizar visualización sin scroll en móviles.
 */

import React from 'react';
import { Mail, CheckCircle2, CreditCard, Chrome, Facebook, Users, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';

interface BookingDetailsFormProps {
  /** Nombre del huésped */
  firstName: string;
  /** Setter para el nombre */
  setFirstName: (val: string) => void;
  /** Apellido del huésped */
  lastName: string;
  /** Setter para el apellido */
  setLastName: (val: string) => void;
  /** Correo electrónico del huésped */
  email: string;
  /** Setter para el correo electrónico */
  setEmail: (val: string) => void;
  /** Errores de validación activos */
  errors: { firstName?: string; lastName?: string; email?: string };
  /** Cantidad de huéspedes seleccionada */
  guestsCount: string;
  /** Setter para la cantidad de huéspedes */
  setGuestsCount: (val: string) => void;
  /** Estado de carga durante el procesamiento de pagos */
  paymentLoading: boolean;
  /** Callback para iniciar el procesamiento de Stripe Checkout */
  onSubmit: () => void;
  /** Callback para iniciar autenticación rápida de Supabase (OAuth) */
  onSocialLogin: (provider: 'google' | 'facebook') => void;
  /** Función de traducción del componente padre */
  t: (key: string) => string;
  
  // 🚀 Nuevas propiedades de flujo de sesión y reserva para terceros
  isLoggedIn?: boolean;
  isBookForSomeoneElse?: boolean;
  setIsBookForSomeoneElse?: (val: boolean) => void;
  submitLabel?: string; // 🚀 Etiqueta opcional para el botón principal
}

export const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  errors,
  guestsCount,
  setGuestsCount,
  paymentLoading,
  onSubmit,
  onSocialLogin,
  t,
  isLoggedIn = false,
  isBookForSomeoneElse = false,
  setIsBookForSomeoneElse,
  submitLabel,
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del formulario de detalles
  usePerformanceProfiler('BookingDetailsForm');

  // Lógica Heurística: Bloqueamos los inputs de texto si el usuario está logueado y NO seleccionó reservar para terceros
  const isFieldsLocked = isLoggedIn && !isBookForSomeoneElse;

  return (
    <div className="space-y-3">
      
      {/* 🚀 Widget On Behalf: Toggle para reservar para otro pasajero (Paddings reducidos) */}
      {isLoggedIn && setIsBookForSomeoneElse && (
        <div className="flex items-center gap-2.5 p-3 bg-accent/10 border border-accent/20 rounded-xl select-none transition-all">
          <input
            type="checkbox"
            id="bookForSomeoneElse"
            checked={isBookForSomeoneElse}
            disabled={paymentLoading}
            onChange={(e) => setIsBookForSomeoneElse(e.target.checked)}
            className="w-4 h-4 text-accent rounded-sm border-border focus:ring-accent focus:ring-2 cursor-pointer disabled:opacity-50"
          />
          <div className="flex-1">
            <label 
              htmlFor="bookForSomeoneElse" 
              className="block text-[11px] font-body font-bold text-foreground cursor-pointer"
            >
              ¿Reservar para otro pasajero?
            </label>
            <p className="text-[9px] text-muted-foreground font-light mt-0.5 leading-tight">
              Actívalo si estás comprando esta estadía para otra persona.
            </p>
          </div>
        </div>
      )}

      {/* Inputs agrupados de Nombre y Apellido (Diseño ultra-compacto de 2.5rem) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Campo: Nombre */}
        <div className={cn(
          "p-2.5 rounded-xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent/10 transition-all",
          isFieldsLocked && "bg-muted/60 border-border focus-within:border-border focus-within:ring-0"
        )}>
          <label className="block text-[8px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            Nombre
          </label>
          <input 
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Tu nombre"
            disabled={paymentLoading}
            readOnly={isFieldsLocked}
            className={cn(
              "w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-foreground placeholder:text-muted-foreground outline-none",
              isFieldsLocked && "text-muted-foreground cursor-not-allowed font-medium"
            )}
          />
          {errors.firstName && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.firstName}</span>
          )}
        </div>

        {/* Campo: Apellido */}
        <div className={cn(
          "p-2.5 rounded-xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent/10 transition-all",
          isFieldsLocked && "bg-muted/60 border-border focus-within:border-border focus-within:ring-0"
        )}>
          <label className="block text-[8px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            Apellido
          </label>
          <input 
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Tu apellido"
            disabled={paymentLoading}
            readOnly={isFieldsLocked}
            className={cn(
              "w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-foreground placeholder:text-muted-foreground outline-none",
              isFieldsLocked && "text-muted-foreground cursor-not-allowed font-medium"
            )}
          />
          {errors.lastName && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.lastName}</span>
          )}
        </div>
      </div>

      {/* Campo: Correo Electrónico (Prefijado con namespace de auth) */}
      <div className={cn(
        "p-3 rounded-xl border border-border bg-muted focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent/10 transition-all flex items-center gap-2",
        isFieldsLocked && "bg-muted/60 border-border focus-within:border-border focus-within:ring-0"
      )}>
        <Mail size={14} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <label className="block text-[8px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            {t('auth:email_label') || 'Correo Electrónico'}
          </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth:email_placeholder') || 'ejemplo@correo.com'}
            disabled={paymentLoading}
            readOnly={isFieldsLocked}
            className={cn(
              "w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-foreground placeholder:text-muted-foreground outline-none",
              isFieldsLocked && "text-muted-foreground cursor-not-allowed font-medium"
            )}
          />
          {errors.email && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.email}</span>
          )}
        </div>
      </div>

      {/* 🚀 Ocultamos todo el bloque de botones sociales si el usuario ya está autenticado */}
      {!isLoggedIn && (
        <>
          {/* Divisor de flujo de registro (o) */}
          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground font-body text-[9px] font-bold uppercase tracking-widest">
              O
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Botones de Inicio de Sesión / Registro Social Rápido (Compactados) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSocialLogin('google')}
              disabled={paymentLoading}
              className="h-11 bg-card hover:bg-muted text-foreground rounded-xl flex items-center justify-center gap-2 border border-border transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
            >
              <Chrome size={16} className="text-red-500" />
              <span className="font-body text-xs font-semibold">Google</span>
            </button>
            <button
              type="button"
              onClick={() => onSocialLogin('facebook')}
              disabled={paymentLoading}
              className="h-11 bg-card hover:bg-muted text-foreground rounded-xl flex items-center justify-center gap-2 border border-border transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
            >
              <Facebook size={16} className="text-blue-600" />
              <span className="font-body text-xs font-semibold">Facebook</span>
            </button>
          </div>
        </>
      )}

      {/* Notificación de perfil auto-completado si los campos están bloqueados */}
      {isFieldsLocked && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-[9px] text-green-500 font-body font-semibold uppercase tracking-wider">
          <UserCheck size={11} />
          Datos auto-completados con tu perfil activo
        </div>
      )}

      {/* Selector de Huéspedes (Gaps y alturas compactadas) */}
      <div className="p-3 rounded-2xl border border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[9px] font-body font-bold text-muted-foreground uppercase tracking-widest">
            {t('guests_label')}
          </label>
          <div className="flex items-center gap-1 text-accent">
            <Users size={12} />
            <span className="text-[11px] font-body font-medium">{guestsCount} {t('guests_suffix')}</span>
          </div>
        </div>
        <div className="flex justify-between gap-2.5">
          {['1', '2', '3', '4+'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setGuestsCount(num)}
              disabled={paymentLoading}
              className={cn(
                "flex-1 h-10 rounded-full border-2 font-body font-semibold transition-all text-xs cursor-pointer disabled:opacity-50",
                guestsCount === num 
                  ? "bg-accent border-accent text-accent-foreground shadow-xs" 
                  : "bg-card border-border text-muted-foreground hover:border-accent"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Distintivo de Seguridad Transaccional Stripe (Compactado) */}
      <div className="bg-accent/10 p-3 rounded-xl flex items-start gap-2 border border-accent/20">
        <div className="bg-accent p-0.5 rounded-full text-accent-foreground shrink-0 mt-0.5">
          <CheckCircle2 size={11} />
        </div>
        <p className="text-[10px] text-foreground leading-normal font-body font-medium">
          {t('trust_badge_stripe')}
        </p>
      </div>

      {/* Botón de Pago / Acción Dinámica (CRO) */}
      <Button 
        disabled={paymentLoading}
        onClick={onSubmit}
        className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-body font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 border-none cursor-pointer"
      >
        {paymentLoading ? (
          <Spinner className="h-5 w-5 text-primary-foreground" />
        ) : (
          <>
            <CreditCard size={15} />
            {submitLabel || t('pay_now_button')}
          </>
        )}
      </Button>
    </div>
  );
};