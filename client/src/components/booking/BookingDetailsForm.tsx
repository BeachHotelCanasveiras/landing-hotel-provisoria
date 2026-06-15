/**
 * @file BookingDetailsForm.tsx
 * @description Sub-componente atómico para capturar datos de huésped, inicio de sesión rápido (SSO) y pago seguro.
 * Refactorizado para resolución precisa de namespaces i18n (auth:email_label).
 * - ISO 27001: Validación reactiva y segregación de responsabilidades.
 * - PCI-DSS: Integración con distintivos de seguridad Stripe.
 */

import React from 'react';
import { Mail, CheckCircle2, CreditCard, Chrome, Facebook, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
}) => {
  return (
    <div className="space-y-4">
      {/* Inputs agrupados de Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-4">
        {/* Campo: Nombre */}
        <div className="p-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">
            Nombre
          </label>
          <input 
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Tu nombre"
            disabled={paymentLoading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
          />
          {errors.firstName && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.firstName}</span>
          )}
        </div>

        {/* Campo: Apellido */}
        <div className="p-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">
            Apellido
          </label>
          <input 
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Tu apellido"
            disabled={paymentLoading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
          />
          {errors.lastName && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.lastName}</span>
          )}
        </div>
      </div>

      {/* Campo: Correo Electrónico (Prefijado con namespace de auth) */}
      <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all flex items-center gap-2">
        <Mail size={16} className="text-gray-400 shrink-0" />
        <div className="flex-1">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            {t('auth:email_label') || 'Correo Electrónico'}
          </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth:email_placeholder') || 'ejemplo@correo.com'}
            disabled={paymentLoading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
          />
          {errors.email && (
            <span className="text-[9px] text-red-500 font-body font-medium">{errors.email}</span>
          )}
        </div>
      </div>

      {/* Divisor de flujo de registro (o) */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-150"></div>
        <span className="flex-shrink mx-4 text-gray-400 font-body text-[10px] font-bold uppercase tracking-widest">
          O
        </span>
        <div className="flex-grow border-t border-gray-150"></div>
      </div>

      {/* Botones de Inicio de Sesión / Registro Social Rápido */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSocialLogin('google')}
          disabled={paymentLoading}
          className="h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center gap-2 border border-gray-200/80 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Chrome size={18} className="text-red-500" />
          <span className="font-body text-xs font-semibold">Google</span>
        </button>
        <button
          type="button"
          onClick={() => onSocialLogin('facebook')}
          disabled={paymentLoading}
          className="h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center gap-2 border border-gray-200/80 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Facebook size={18} className="text-blue-600" />
          <span className="font-body text-xs font-semibold">Facebook</span>
        </button>
      </div>

      {/* Selector de Huéspedes */}
      <div className="p-4 rounded-3xl border border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
            {t('guests_label')}
          </label>
          <div className="flex items-center gap-1 text-primary">
            <Users size={14} />
            <span className="text-xs font-body font-medium">{guestsCount} {t('guests_suffix')}</span>
          </div>
        </div>
        <div className="flex justify-between gap-3">
          {['1', '2', '3', '4+'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setGuestsCount(num)}
              disabled={paymentLoading}
              className={cn(
                "flex-1 h-12 rounded-full border-2 font-body font-semibold transition-all text-sm cursor-pointer disabled:opacity-50",
                guestsCount === num 
                  ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Distintivo de Seguridad Transaccional Stripe */}
      <div className="bg-blue-50/50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100/50">
        <div className="bg-blue-500 p-1 rounded-full text-white shrink-0 mt-0.5">
          <CheckCircle2 size={14} />
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed font-body font-medium">
          {t('trust_badge_stripe')}
        </p>
      </div>

      {/* Botón de Pago Final */}
      <Button 
        disabled={paymentLoading}
        onClick={onSubmit}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {paymentLoading ? (
          <Spinner className="h-5 w-5 text-white" />
        ) : (
          <>
            <CreditCard size={20} />
            {t('pay_now_button')}
          </>
        )}
      </Button>
    </div>
  );
};