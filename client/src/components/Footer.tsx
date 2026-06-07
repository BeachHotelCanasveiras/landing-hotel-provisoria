import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-display text-lg font-bold">B</span>
              </div>
              <h3 className="font-display text-lg">Beach Hotel</h3>
            </div>
            <p className="font-body text-gray-400 text-sm leading-relaxed">
              Lujo ejecutivo frente al mar en Canasvieiras, Florianopolis. Tu destino perfecto para relajacion y negocios.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-gray-400">
                  Rua Hypolito Gregorio Pereira, 700<br />
                  Canasvieiras, Florianopolis, SC
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="tel:+5548999999999" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
                  +55 (48) 99999-9999
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@beachhotel.com.br" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
                  info@beachhotel.com.br
                </a>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Enlaces Rapidos</h4>
            <div className="space-y-2">
              <a href="#rooms" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Habitaciones
              </a>
              <a href="#gallery" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Galeria
              </a>
              <a href="#attractions" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Atracciones
              </a>
              <a href="#testimonials" className="font-body text-sm text-gray-400 hover:text-white transition-colors block">
                Resenas
              </a>
            </div>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-4">Siguenos</h4>
            <div className="flex gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-sm text-gray-400">
            © 2026 Beach Hotel Canasvieiras. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
              Politica de Privacidad
            </a>
            <a href="#" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
              Terminos de Servicio
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
