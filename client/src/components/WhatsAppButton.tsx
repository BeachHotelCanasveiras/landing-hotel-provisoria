import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

export default function WhatsAppButton() {
  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <motion.a
      href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      variants={pulseVariants}
      animate="pulse"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
      title="Contacta por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
}