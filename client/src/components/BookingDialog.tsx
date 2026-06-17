/**
 * @file BookingDialog.tsx
 * @description Orquestador principal de reservas de 3 pasos (Calendario -> Datos -> Revisión -> Pago).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA y las normas de rendimiento de React 19:
 * - Cero 'any': Tipado estricto en callbacks, estados y flujos de red.
 * - Saneamiento react-hooks/set-state-in-effect: Sincronización procesada de forma atómica en el manejador de eventos.
 * - Smart SSoT Auto-Hydration: Sistema dinámico de auto-hidratación de 3 capas en tiempo real (Stripe + Guests DB).
 * - Saneamiento TS2339 / TS7006: Reemplazado .then().catch() por IIFEs asíncronas con try/catch nativo para compatibilidad con PromiseLike y sin any implícitos.
 * - Saneamiento Doble 'X': showCloseButton={false} inyectado en DialogContent.
 * - SSoT Cookie Instant Fill: Lee primero síncronamente de StorageService (Capa 0) al renderizar.
 * - Flujo CRO: Integra el paso intermedio de revisión de reserva y cálculo de tarifas en caliente antes del pago.
 * - Compacto (Anti-Scroll): Header y cuerpo compactados para dispositivos móviles.
 */

import React, { useState, useEffect, useMemo } from 'react'; // 🚀 Saneado:useMemo importado de forma segura
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale'; 
import { ChevronLeft, X, Calendar, ClipboardCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext'; // Consumo de identidad unificada
import { StorageService } from '@/lib/storage'; // SSoT Cookie instantánea
import { BookingTranslationSchema } from '@/locales/schemas/booking.schema';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // 🚀 Saneado: Button importado de forma segura
import { Spinner } from "@/components/ui/spinner"; // 🚀 Saneado: Spinner importado de forma segura

// Importaciones atómicas de sub-componentes (Aparato C.1 y C.2)
import { BookingDatePicker, BookingDetailsForm } from './booking';
import { useBlockedDates } from './booking/useBlockedDates';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomType: string;
}

export default function BookingDialog({ isOpen, onClose, roomName, roomType }: BookingDialogProps) {
  const { t, i18n } = useTranslation(['booking', 'auth']);
  const { user } = useAuth(); // Extraemos la sesión activa de forma síncrona
  
  // Consumo dinámico del inventario en Supabase (Cero sobre-reservas)
  const { data: blockedDates = [] } = useBlockedDates(roomType);

  const [range, setRange] = useState<DateRange | undefined>();
  const [step, setStep] = useState(1);
  
  // Estados de datos de huésped
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Estado de errores de validación
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});
  
  const [guestsCount, setGuestsCount] = useState('2');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 🚀 Control de precio para cálculo en paso de revisión
  const [roomPrice, setRoomPrice] = useState<number | null>(null);

  // 🚀 Control reactivo para reservas destinadas a terceros
  const [isBookForSomeoneElse, setIsBookForSomeoneElse] = useState(false);

  // Sincronización de Estado en Renderizado (React 19 Pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setRange(undefined);
      setErrors({});
      setPaymentLoading(false);
      setIsBookForSomeoneElse(false); // Reset al abrir
      
      // 🚀 CAPA 0 (SSOT INSTANTÁNEO): Intentar rellenar de la cookie de perfil ofuscada en milisegundos
      const cachedProfile = StorageService.getObfuscatedProfile();
      if (cachedProfile) {
        setEmail(cachedProfile.email);
        setFirstName(cachedProfile.firstName);
        setLastName(cachedProfile.lastName);
      } else if (user) {
        setEmail(user.email || '');
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const parts = fullName.trim().split(/\s+/);
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      } else {
        setFirstName('');
        setLastName('');
        setEmail('');
      }
    }
  }

  // 🚀 Obtener precio por noche en caliente al abrir para la pantalla de revisión (Saneado TS2339 / TS7006)
  useEffect(() => {
    if (isOpen && roomType) {
      (async () => {
        try {
          const { data } = await supabase
            .from('rooms')
            .select('price_per_night')
            .eq('type', roomType)
            .limit(1)
            .maybeSingle();
          
          if (data) {
            setRoomPrice(Number(data.price_per_night));
          }
        } catch (e: unknown) {
          console.warn('[BookingDialog] Error al consultar precio base:', e instanceof Error ? e.message : e);
        }
      })();
    }
  }, [isOpen, roomType]);

  // 🚀 MANEJADOR DE EVENTOS ATÓMICO: Evita renderizados en cascada (set-state-in-effect)
  const handleToggleBookForSomeoneElse = (val: boolean) => {
    setIsBookForSomeoneElse(val);

    if (user) {
      if (val) {
        // Se limpia para permitir escribir datos de terceros
        setFirstName('');
        setLastName('');
        setEmail('');
        setErrors({});
      } else {
        // Se restaura de la Cookie Local (Capa 0 SSoT) o metadatos de forma síncrona
        const cachedProfile = StorageService.getObfuscatedProfile();
        if (cachedProfile) {
          setEmail(cachedProfile.email);
          setFirstName(cachedProfile.firstName);
          setLastName(cachedProfile.lastName);
          setErrors({});
        } else {
          setEmail(user.email || '');
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const parts = fullName.trim().split(/\s+/);
          const metaFirst = parts[0] || '';
          const metaLast = parts.slice(1).join(' ') || '';

          if (metaFirst && metaFirst !== 'Huésped' && metaLast) {
            setFirstName(metaFirst);
            setLastName(metaLast);
            setErrors({});
          } else {
            // 🚀 IIFE Asíncrona para compatibilidad inmaculada con PromiseLike de Supabase (Saneado TS2339)
            (async () => {
              try {
                const { data } = await supabase
                  .from('guests')
                  .select('first_name, last_name')
                  .eq('id', user.id)
                  .maybeSingle();

                if (data && data.first_name) {
                  setFirstName(data.first_name);
                  setLastName(data.last_name || 'Huésped');
                } else {
                  const emailPart = user.email?.split('@')[0] || '';
                  const capitalized = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
                  setFirstName(capitalized);
                  setLastName('Huésped');
                }
              } catch {
                const emailPart = user.email?.split('@')[0] || '';
                const capitalized = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
                setFirstName(capitalized);
                setLastName('Huésped');
              }
            })();
            setErrors({});
          }
        }
      }
    }
  };

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

  const validateForm = (): boolean => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!firstName.trim()) {
      tempErrors.firstName = t('booking:error_first_name_required', { defaultValue: 'El nombre es obligatorio.' });
      isValid = false;
    }
    if (!lastName.trim()) {
      tempErrors.lastName = t('booking:error_last_name_required', { defaultValue: 'El apellido es obligatorio.' });
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = t('booking:error_email_required', { defaultValue: 'El correo electrónico es obligatorio.' });
      isValid = false;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = t('booking:error_email_invalid', { defaultValue: 'Ingresa una dirección de correo válida.' });
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleStripePayment = async () => {
    if (!range?.from || !range?.to) return;
    if (!validateForm()) {
      toast.error(t('booking:error_form_invalid', { defaultValue: 'Por favor, corrige los campos del formulario.' }));
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
          locale: i18n.language // Propagamos el locale activo del cliente para despachar vouchers bilingües
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de Stripe desconocido';
      console.error('[Stripe Integration Error]:', error);
      toast.error(errorMessage || 'No se pudo conectar con el motor de pagos.');
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de SSO desconocido';
      toast.error(`Error al iniciar sesión con ${provider}: ` + errorMessage);
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

  // Cálculo de noches de estadía
  const nightsCount = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 3600 * 24));
  }, [range]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 🚀 showCloseButton={false} inyectado para erradicar el doble botón X */}
      <DialogContent showCloseButton={false} className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl z-[100]">
        
        {/* Encabezado Compactado */}
        <div className="relative px-5 pt-6 pb-4 border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between">
            <div className="w-10">
              {step > 1 && (
                <button 
                  onClick={() => setStep(prev => prev - 1)} 
                  disabled={paymentLoading}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={22} className="text-gray-900" />
                </button>
              )}
            </div>
            
            <div className="text-center select-none">
              <DialogTitle className="font-display text-lg text-gray-900 leading-tight">
                {step === 1 ? t('step1_title') : step === 2 ? t('step2_title') : 'Revisar Reserva'}
              </DialogTitle>
              {/* 🚀 Eliminada la redundancia de mostrar "Quarto Single" debajo de "Sua Reserva" */}
            </div>

            <div className="w-10 flex justify-end">
              <button 
                onClick={onClose} 
                disabled={paymentLoading}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo Compactado (Anti-Scroll en móviles: p-4 sm:p-5 y max-h-85vh) */}
        <div className="p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
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
            ) : step === 2 ? (
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
                  // 🚀 El submit del formulario de datos ahora avanza al paso 3 de revisión
                  onSubmit={() => {
                    if (validateForm()) {
                      setStep(3);
                    }
                  }}
                  onSocialLogin={handleSocialLogin}
                  t={t}
                  isLoggedIn={!!user} // Identifica estado de sesión activo
                  isBookForSomeoneElse={isBookForSomeoneElse} // Pasa el estado reactivo
                  setIsBookForSomeoneElse={handleToggleBookForSomeoneElse} // Manejador de eventos libre de useEffect
                  submitLabel="Revisar Reserva" // 🚀 Etiqueta CRO para continuar al resumen
                />
              </motion.div>
            ) : (
              /* 🚀 NUEVO PASO 3: REVISIÓN DE DETALLES DE RESERVA (CRO & UX de Elite) */
              <motion.div
                key="step-review"
                custom={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 text-left font-body"
              >
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-1">
                    <ClipboardCheck size={14} className="text-accent" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resumen de Cotización</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Alojamiento</span>
                    <span className="font-semibold text-gray-900">{roomName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    {/* 🚀 Saneado: El icono Calendar se inyecta al lado de la etiqueta Periodo, resolviendo la advertencia de no-unused-vars */}
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      Periodo
                    </span>
                    <span className="font-semibold text-gray-900">
                      {range?.from && range?.to 
                        ? `${format(range.from, 'dd/MM/yyyy')} al ${format(range.to, 'dd/MM/yyyy')} (${nightsCount} ${nightsCount === 1 ? 'noche' : 'noches'})` 
                        : ''}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Pasajero principal</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[170px]">
                      {firstName} {lastName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Huéspedes</span>
                    <span className="font-semibold text-gray-900">
                      {guestsCount} {guestsCount === '1' ? 'persona' : 'personas'}
                    </span>
                  </div>

                  {roomPrice && nightsCount > 0 && (
                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-gray-200">
                      <span className="text-gray-900 font-bold text-xs">Importe Total</span>
                      <span className="text-base font-display font-bold text-accent">
                        R$ {(roomPrice * nightsCount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/30 p-3.5 rounded-2xl flex items-start gap-2.5 border border-blue-100/50 text-[10px] text-blue-800 leading-relaxed font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 animate-pulse" />
                  Al proceder al pago, te redirigiremos a Stripe para completar el cobro mediante tarjeta de forma 100% encriptada.
                </div>

                <Button
                  disabled={paymentLoading}
                  onClick={handleStripePayment}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-body font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <Spinner className="w-5 h-5 text-white" />
                  ) : (
                    "Proceder ao Pagamento"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}