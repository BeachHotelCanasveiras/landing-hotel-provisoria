import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <section
      id="home"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 59, 102, 0.4) 0%, rgba(74, 155, 142, 0.3) 100%), 
                           url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container text-center text-white max-w-3xl mx-auto px-4"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-body font-medium border border-white/30">
            Bienvenido a Canasvieiras
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          {HOTEL_CONFIG.fullName}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-body text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          Lujo ejecutivo frente al mar. Disfruta de la elegancia, comodidad y hospitalidad excepcional en el corazón de Florianópolis.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-700 text-white rounded-lg font-body font-semibold hover:bg-blue-800 transition-colors shadow-lg"
          >
            Reservar Ahora
          </motion.a>
          <motion.a
            href="#rooms"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-lg font-body font-semibold hover:bg-white/30 transition-colors border border-white/30"
          >
            Explorar
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </motion.div>
    </section>
  );
}