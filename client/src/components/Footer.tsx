import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="container py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          {/* About */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-4">
              <Logo className="h-12 text-white" fill="white" withIcon={true} />
            </div>
            <p className="font-body text-gray-400 text-sm leading-relaxed">
              Tu hogar cálido y acogedor en la Avenida das Nações. Disfruta de la tranquilidad a solo dos cuadras del mar en Canasvieiras.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-gray-400">
                  {HOTEL_CONFIG.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={HOTEL_CONFIG.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {HOTEL_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={`mailto:${HOTEL_CONFIG.email}`} 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors break-all"
                >
                  {HOTEL_CONFIG.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <a href="#home" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Inicio
              </a>
              <a href="#rooms" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Habitaciones
              </a>
              <a href="#gallery" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Galería
              </a>
              <a href="#attractions" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Atracciones
              </a>
            </div>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Síguenos</h4>
            <div className="flex flex-wrap gap-4">
              <motion.a
                href={HOTEL_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={HOTEL_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={HOTEL_CONFIG.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={HOTEL_CONFIG.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-sm text-gray-400">
            © 2026 {HOTEL_CONFIG.fullName}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <span className="font-body text-xs text-gray-500 italic">
              Desarrollado por Raz Podestá - MetaShark Tech
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}