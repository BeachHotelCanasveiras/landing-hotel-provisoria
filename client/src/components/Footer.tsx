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
      <div className="container py-16 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Bloque de Marca: Versión Blanca para fondo oscuro */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="flex items-center">
              <Logo 
                className="scale-110 origin-left" 
                fill="white" 
                withIcon={true} 
              />
            </div>
            <p className="font-body text-gray-400 text-sm leading-relaxed max-w-xs">
              Tu rincón de hospitalidad en el corazón de Canasvieiras. Un espacio diseñado para el descanso auténtico a pasos del mar.
            </p>
          </motion.div>

          {/* Contacto: Sincronizado con SSoT */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="font-body text-sm text-gray-400 leading-tight">
                  {HOTEL_CONFIG.address}
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <a 
                  href={HOTEL_CONFIG.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {HOTEL_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <a 
                  href={`mailto:${HOTEL_CONFIG.email}`} 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors break-all"
                >
                  {HOTEL_CONFIG.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Navegación Rápida */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">Explorar</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="font-body text-sm text-gray-400 hover:text-blue-400 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#rooms" className="font-body text-sm text-gray-400 hover:text-blue-400 transition-colors">Habitaciones</a>
              </li>
              <li>
                <a href="#gallery" className="font-body text-sm text-gray-400 hover:text-blue-400 transition-colors">Galería</a>
              </li>
              <li>
                <a href="#attractions" className="font-body text-sm text-gray-400 hover:text-blue-400 transition-colors">Atracciones</a>
              </li>
            </ul>
          </motion.div>

          {/* Canales Digitales */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">Síguenos</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Facebook, url: HOTEL_CONFIG.facebookUrl, color: 'hover:bg-blue-600' },
                { icon: Instagram, url: HOTEL_CONFIG.instagramUrl, color: 'hover:bg-pink-600' },
                { icon: Twitter, url: HOTEL_CONFIG.twitterUrl, color: 'hover:bg-sky-500' },
                { icon: Linkedin, url: HOTEL_CONFIG.linkedinUrl, color: 'hover:bg-blue-700' }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center transition-colors ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-10" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left">
            <p className="font-body text-xs text-gray-500 uppercase tracking-widest">
              © 2026 {HOTEL_CONFIG.fullName}
            </p>
          </div>
          
          <div className="flex items-center gap-2 group cursor-default">
            <span className="font-body text-[10px] text-gray-600 uppercase tracking-[0.2em]">
              Crafted by
            </span>
            <span className="font-display text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
              Raz Podestá - MetaShark Tech
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}