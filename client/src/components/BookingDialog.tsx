import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, MessageCircle, ChevronLeft, X, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { HOTEL_CONFIG } from '@/const';
import { cn } from '@/lib/utils';
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
  const [range, setRange] = useState<DateRange | undefined>();
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRange(undefined);
      // Aquí se sincronizaría con Supabase/iCal en producción
      setBlockedDates([]); 
    }
  }, [isOpen]);

  const handleSendWhatsApp = () => {
    if (!range?.from || !range?.to) return;
    const nights = differenceInDays(range.to, range.from);
    const message = `*SOLICITUD DE RESERVA* 🏠\n` +
      `--------------------------\n` +
      `*Habitación:* ${roomName}\n` +
      `*Check-in:* ${format(range.from, 'dd/MM/yyyy')}\n` +
      `*Check-out:* ${format(range.to, 'dd/MM/yyyy')}\n` +
      `*Noches:* ${nights}\n` +
      `*Huéspedes:* ${guestsCount}\n` +
      `*Nombre:* ${guestName}\n` +
      `--------------------------\n` +
      `_Enviado desde beachcanasvieiras.com_`;

    window.open(`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const today = startOfDay(new Date());

  const stepVariants: Variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      transition: { duration: 0.2 }
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl z-[100]">
        
        {/* Navigation Header - Airbnb Style */}
        <div className="relative px-6 pt-8 pb-5 border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between">
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
            
            <div className="text-center">
              <DialogTitle className="font-display text-lg text-gray-900 leading-tight">
                {step === 1 ? 'Fechas' : 'Tu Reserva'}
              </DialogTitle>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.15em] mt-0.5">
                {roomName}
              </p>
            </div>

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
                {/* Calendar Component */}
                <div className="mb-6 flex justify-center scale-95 sm:scale-100 origin-top">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    locale={es}
                    disabled={[{ before: today }, ...blockedDates]}
                    className="rounded-3xl"
                  />
                </div>

                {/* Date Summary Capsule */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <div className="bg-white p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Entrada</p>
                    <p className="text-sm font-bold text-gray-900">
                      {range?.from ? format(range.from, 'EEE, d MMM', { locale: es }) : 'Seleccionar'}
                    </p>
                  </div>
                  <div className="bg-white p-4 border-l border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Salida</p>
                    <p className="text-sm font-bold text-gray-900">
                      {range?.to ? format(range.to, 'EEE, d MMM', { locale: es }) : 'Seleccionar'}
                    </p>
                  </div>
                </div>

                <Button 
                  disabled={!range?.from || !range?.to}
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  Continuar
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
                {/* Name Input Group */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-blue-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre y Apellido</label>
                  <input 
                    type="text"
                    autoFocus
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-lg text-gray-900 placeholder:text-gray-300"
                  />
                </div>

                {/* Guests Selector Group */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Huéspedes</label>
                    <div className="flex items-center gap-1 text-blue-700">
                      <Users size={14} />
                      <span className="text-xs font-bold">{guestsCount} personas</span>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3">
                    {['1', '2', '3', '4+'].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGuestsCount(num)}
                        className={cn(
                          "flex-1 h-12 rounded-xl border-2 font-bold transition-all text-sm",
                          guestsCount === num 
                            ? "bg-blue-700 border-blue-700 text-white shadow-md" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-green-50/50 p-4 rounded-2xl flex items-start gap-3 border border-green-100/50">
                  <div className="bg-green-500 p-1 rounded-full text-white shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <p className="text-[11px] text-green-800 leading-relaxed font-body font-medium">
                    Confirmaremos tu reserva vía WhatsApp. Recibirás el detalle y los medios de pago disponibles.
                  </p>
                </div>

                <Button 
                  disabled={!guestName}
                  onClick={handleSendWhatsApp}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={22} />
                  Confirmar en WhatsApp
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}