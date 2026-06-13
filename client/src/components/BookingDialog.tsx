/**
 * @file BookingDialog.tsx
 * @description Diálogo interactivo de reservas de 2 pasos (Fase 6 del Embudo: Transacción).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Textos traducidos dinámicamente desde el namespace 'booking'.
 * - Validación estructural estricta con Zod (BookingTranslationSchema).
 * - Calendario interactivo (react-day-picker) localizado en tiempo de ejecución de forma simétrica (es-ES, en-US, pt-BR).
 * - Mensaje de WhatsApp de salida estructurado y traducido al idioma del cliente.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale'; // 'es' es el código interno de la librería de terceros
import { CheckCircle2, MessageCircle, ChevronLeft, X, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { HOTEL_CONFIG } from '@/const';
import { cn } from '@/lib/utils';
import { BookingTranslationSchema } from '@/locales/schemas/booking.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomType: string;
}

export default function BookingDialog({ isOpen, onClose, roomName, roomType }: BookingDialogProps) {
  const { t, i18n } = useTranslation('booking');
  const [range, setRange] = useState<DateRange | undefined>();
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DEL ESQUEMA (ZOD) - ISO 27001
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'booking') || {};
      BookingTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[BookingDialog Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  /**
   * Obtiene la localización de fecha mapeando nuestro estándar regional
   * es-ES, en-US y pt-BR a los archivos internos de date-fns.
   */
  const getDateLocale = () => {
    if (i18n.language === 'en-US') return enUS;
    if (i18n.language === 'pt-BR') return ptBR;
    return es; // Mapeo explícito y seguro para el fallback de 'es-ES'
  };

  const currentLocale = getDateLocale();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRange(undefined);
      setBlockedDates([]); 
    }
  }, [isOpen]);

  /**
   * Genera el mensaje estructurado de reserva y abre WhatsApp.
   */
  const handleSendWhatsApp = () => {
    if (!range?.from || !range?.to) return;
    const nights = differenceInDays(range.to, range.from);
    
    const message = 
      `${t('whatsapp_template.header')}\n` +
      `--------------------------\n` +
      `${t('whatsapp_template.room')} ${roomName}\n` +
      `${t('whatsapp_template.check_in')} ${format(range.from, 'dd/MM/yyyy')}\n` +
      `${t('whatsapp_template.check_out')} ${format(range.to, 'dd/MM/yyyy')}\n` +
      `${t('whatsapp_template.nights')} ${nights}\n` +
      `${t('whatsapp_template.guests')} ${guestsCount}\n` +
      `${t('whatsapp_template.name')} ${guestName}\n` +
      `--------------------------\n` +
      `${t('whatsapp_template.footer')}`;

    window.open(`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const today = startOfDay(new Date());

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
            {/* Botón Atrás (Paso 2) */}
            <div className="w-10">
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)} 
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                >
                  <ChevronLeft size={22} className="text-gray-900" />
                </button>
              )}
            </div>
            
            {/* Título de Paso y Nombre de la Habitación */}
            <div className="text-center">
              <DialogTitle className="font-display text-lg text-gray-900 leading-tight">
                {step === 1 ? t('step1_title') : t('step2_title')}
              </DialogTitle>
              <p className="text-[10px] text-accent font-body font-semibold uppercase tracking-[0.15em] mt-1">
                {roomName}
              </p>
            </div>

            {/* Botón de Cierre */}
            <div className="w-10 flex justify-end">
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del Diálogo */}
        <div className="p-6">
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
                {/* Calendario de Selección de Fechas */}
                <div className="mb-6 flex justify-center scale-95 sm:scale-100 origin-top">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    locale={currentLocale}
                    disabled={[{ before: today }, ...blockedDates]}
                    className="rounded-3xl"
                  />
                </div>

                {/* Resumen del Rango de Fechas */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <div className="bg-white p-4">
                    <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {t('check_in_label')}
                    </p>
                    <p className="text-sm font-body font-medium text-gray-900">
                      {range?.from ? format(range.from, 'EEE, d MMM', { locale: currentLocale }) : t('select_placeholder')}
                    </p>
                  </div>
                  <div className="bg-white p-4 border-l border-gray-200">
                    <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {t('check_out_label')}
                    </p>
                    <p className="text-sm font-body font-medium text-gray-900">
                      {range?.to ? format(range.to, 'EEE, d MMM', { locale: currentLocale }) : t('select_placeholder')}
                    </p>
                  </div>
                </div>

                {/* Botón de Continuación */}
                <Button 
                  disabled={!range?.from || !range?.to}
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base font-body font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  {t('continue_button')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step-details"
                custom={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* Entrada: Nombre del Huésped */}
                <div className="p-4 rounded-3xl border border-gray-200 bg-gray-50 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <label className="block text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {t('guest_name_label')}
                  </label>
                  <input 
                    type="text"
                    autoFocus
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('guest_name_placeholder')}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-base text-gray-900 placeholder:text-gray-300 outline-none"
                  />
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
                        onClick={() => setGuestsCount(num)}
                        className={cn(
                          "flex-1 h-12 rounded-full border-2 font-body font-semibold transition-all text-sm cursor-pointer",
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

                {/* Badge de Seguridad y Confianza (CRO) */}
                <div className="bg-green-50/50 p-4 rounded-2xl flex items-start gap-3 border border-green-100/50">
                  <div className="bg-green-500 p-1 rounded-full text-white shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <p className="text-[11px] text-green-800 leading-relaxed font-body font-medium">
                    {t('trust_badge')}
                  </p>
                </div>

                {/* Botón de Transacción Final (WhatsApp) */}
                <Button 
                  disabled={!guestName}
                  onClick={handleSendWhatsApp}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-full text-base font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle size={22} />
                  {t('whatsapp_button')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}