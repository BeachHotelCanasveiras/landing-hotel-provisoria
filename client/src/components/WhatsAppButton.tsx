/**
 * @file WhatsAppButton.tsx
 * @description Botón flotante global de contacto directo (Fase de Conversión).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Eliminación de texto hardcodeado. Consume el namespace centralizado 'whatsapp'.
 * - Accesibilidad (A11y) mejorada con aria-labels.
 * - Validación Zod en tiempo de desarrollo.
 */

import { motion, Variants } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOTEL_CONFIG } from '@/const';
import { WhatsappTranslationSchema } from '@/locales/schemas/whatsapp.schema';

export default function WhatsAppButton() {
  const { t, i18n } = useTranslation('whatsapp');

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DEL ESQUEMA (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'whatsapp') || {};
      WhatsappTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[WhatsAppButton] ❌ Error de integridad en diccionario 'whatsapp' (${i18n.language}):`, error);
    }
  }

  // Animación de latido suave (CRO Trigger visual)
  const pulseVariants: Variants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Interpolación dinámica y segura del mensaje
  const whatsappMessage = t('general_contact', { 
    hotelName: HOTEL_CONFIG.name,
    defaultValue: `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}` 
  });

  return (
    <motion.a
      href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      variants={pulseVariants}
      animate="pulse"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-4 focus:ring-green-500/30"
      aria-label="Contactar por WhatsApp"
      title="Contacta por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
}