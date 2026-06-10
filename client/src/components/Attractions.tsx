import { motion, Variants } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

// Fuente Única para Imágenes de Atracciones en Cloudinary
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/attractions/";

const attractions = [
  {
    id: 1,
    name: 'Praia Brava',
    description: 'Un refugio natural a pocos minutos de nuestro hogar, ideal para conectar con el surf y la serenidad de la isla.',
    distance: '9 km',
    time: '15 min en auto',
    image: `${CLOUDINARY_BASE}praia-brava.webp`,
  },
  {
    id: 2,
    name: 'Playa Jurerê',
    description: 'Tradición y frescura a corta distancia. Una opción excelente para compartir momentos inolvidables cerca de nosotros.',
    distance: '4 km',
    time: '10 min en auto',
    image: `${CLOUDINARY_BASE}jurere.webp`,
  },
  {
    id: 3,
    name: 'Parque Água Show',
    description: 'Diversión garantizada para disfrutar con los tuyos. El parque acuático más famoso de la isla a pasos de tu estadía.',
    distance: '4 km',
    time: '10 min en auto',
    image: `${CLOUDINARY_BASE}agua-show.webp`,
  },
  {
    id: 4,
    name: 'Centro Histórico',
    description: 'Un paseo por la arquitectura colonial y la esencia de Florianópolis. Descubre la historia que rodea nuestra ubicación.',
    distance: '27 km',
    time: '30 min en auto',
    image: `${CLOUDINARY_BASE}centro-historico.webp`,
  },
  {
    id: 5,
    name: 'Isla del Francés',
    description: 'Conexión mágica con la fauna marina y aguas cristalinas. Tours y salidas disponibles muy cerca de nuestra recepción.',
    distance: 'Salidas cercanas',
    time: 'Medio día',
    image: `${CLOUDINARY_BASE}ilha-frances.webp`,
  },
  {
    id: 6,
    name: 'Fortaleza São José',
    description: 'Vistas panorámicas y un viaje al pasado histórico. Un punto de encuentro con la cultura local frente al océano.',
    distance: '15 km',
    time: '20 min en auto',
    image: `${CLOUDINARY_BASE}fortaleza.webp`,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function Attractions() {
  return (
    <section id="attractions" className="py-20 bg-gray-50">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4 uppercase tracking-wider">
            Ubicación Estratégica
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Descubre Canasvieiras
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Desde nuestro rincón en la Avenida das Nações, tienes acceso privilegiado a las mejores experiencias de Florianópolis.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {attractions.map((attraction) => (
            <motion.div
              key={attraction.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-display text-2xl text-gray-900 mb-3">{attraction.name}</h3>
                <p className="font-body text-sm text-gray-600 mb-6 leading-relaxed flex-1">
                  {attraction.description}
                </p>

                <div className="space-y-3 mb-8 border-t border-gray-50 pt-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm font-medium">{attraction.distance}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm font-medium">{attraction.time}</span>
                  </div>
                </div>

                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=Hola!%20Me%20gustaría%20saber%20cómo%20llegar%20a%20${encodeURIComponent(attraction.name)}%20desde%20el%20Hotel.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full text-center py-3 bg-blue-700 text-white rounded-xl font-body text-sm font-semibold hover:bg-blue-800 transition-colors shadow-md"
                >
                  Consultar trayecto
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}