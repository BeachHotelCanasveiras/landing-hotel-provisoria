import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

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

  return (
    <motion.a
      href="https://wa.me/5548999999999?text=Hola%20Beach%20Hotel%20Canasvieiras%2C%20me%20gustaría%20hacer%20una%20reserva"
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
