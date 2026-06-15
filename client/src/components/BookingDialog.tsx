/**
 * @file BookingDialog.tsx
 * @description Orquestador principal de reservas de 2 pasos (Fase 6 del Embudo: Transacción).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Divide responsabilidades delegando en BookingDatePicker y BookingDetailsForm.
 * - Integra transiciones animadas con AnimatePresence y Framer Motion.
 * - Garantiza tipado estricto y blindaje total de llamadas al backend.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale'; 
import { ChevronLeft, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { BookingTranslationSchema } from '@/locales/schemas/booking.schema';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

// Importaciones atómicas de sub-componentes (Aparato C.1 y C.2)
import { BookingDatePicker } from './booking/BookingDatePicker';
import { BookingDetailsForm } from './booking/BookingDetailsForm';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomType: string;
}

export default function BookingDialog({ isOpen, onClose, roomName, roomType }: BookingDialogProps) {
  const { t, i18n } = useTranslation(['booking', 'auth']);
  const [range, setRange] = useState<DateRange | undefined>();
  const [step, setStep] = useState(1);
  
  // Estados de datos de huésped
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Estado de errores de validación
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});
  
  const [guestsCount, setGuestsCount] = useState('2');
  const [blockedDates] = useState<Date[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Validación estricta con Zod en modo desarrollo (Failsafe)
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'booking') || {};
      BookingTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[BookingDialog Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const getDateLocale = () => {
    if (i18n.language === 'en-US') return enUS;
    if (i18n.language === 'pt-BR') return ptBR;
    return es; 
  };

  const currentLocale = getDateLocale();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRange(undefined);
      setFirstName('');
      setLastName('');
      setEmail('');
      setErrors({});
      setPaymentLoading(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!firstName.trim()) {
      tempErrors.firstName = 'El nombre es obligatorio.';
      isValid = false;
    }
    if (!lastName.trim()) {
      tempErrors.lastName = 'El apellido es obligatorio.';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = 'El correo electrónico es obligatorio.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = 'Ingresa una dirección de correo válida.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleStripePayment = async () => {
    if (!range?.from || !range?.to) return;
    if (!validateForm()) {
      toast.error('Por favor, corrige los campos del formulario.');
      return;
    }
    
    setPaymentLoading(true);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomType,
          roomName,
          checkIn: format(range.from, 'yyyy-MM-dd'),
          checkOut: format(range.to, 'yyyy-MM-dd'),
          guestName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          guestsCount,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor de pagos no devolvió una respuesta válida.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error de red al inicializar la pasarela.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('La sesión de pago no devolvió una URL válida.');
      }
    } catch (error: any) {
      console.error('[Stripe Integration Error]:', error);
      toast.error(error.message || 'No se pudo conectar con el motor de pagos.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setPaymentLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Error al iniciar sesión con ${provider}: ` + error.message);
      setPaymentLoading(false);
    }
  };

  const stepVariants: Variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -30 : 30,
      transition: { duration: 0.25 }
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl z-[100]">
        
        {/* Encabezado de Navegación del Diálogo */}
        <div className="relative px-6 pt-8 pb-5 border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between">
            <div className="w-10">
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)} 
                  disabled={paymentLoading}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 disabled:opacity-50"
                >
                  <ChevronLeft size={22} className="text-gray-900" />
                </button>
              )}
            </div>
            
            <div className="text-center">
              <DialogTitle className="font-display text-lg text-gray-900 leading-tight">
                {step === 1 ? t('step1_title') : t('step2_title')}
              </DialogTitle>
              <p className="text-[10px] text-accent font-body font-semibold uppercase tracking-[0.15em] mt-1">
                {roomName}
              </p>
            </div>

            <div className="w-10 flex justify-end">
              <button 
                onClick={onClose} 
                disabled={paymentLoading}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 disabled:opacity-50"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del Diálogo */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 ? (
              <motion.div
                key="step-calendar"
                custom={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col"
              >
                <BookingDatePicker
                  range={range}
                  setRange={setRange}
                  currentLocale={currentLocale}
                  blockedDates={blockedDates}
                  onContinue={() => setStep(2)}
                  t={t}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step-details"
                custom={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <BookingDetailsForm
                  firstName={firstName}
                  setFirstName={setFirstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  email={email}
                  setEmail={setEmail}
                  errors={errors}
                  guestsCount={guestsCount}
                  setGuestsCount={setGuestsCount}
                  paymentLoading={paymentLoading}
                  onSubmit={handleStripePayment}
                  onSocialLogin={handleSocialLogin}
                  t={t}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}