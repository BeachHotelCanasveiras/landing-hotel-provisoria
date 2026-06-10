import { motion } from 'framer-motion';
import { HOTEL_CONFIG } from '@/const';

// Configuración de URLs de Cloudinary con auto-optimización
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1781114927/beach-hotel/";

const rooms = [
  {
    id: 1,
    name: 'Habitación Single',
    description: 'Espacio personal diseñado para tu descanso y desconexión. Un refugio tranquilo a pasos de la playa para disfrutar de tu propio tiempo.',
    image: `${CLOUDINARY_BASE}suites/single.png`,
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Minibar'],
  },
  {
    id: 2,
    name: 'Habitación Doble',
    description: 'El refugio ideal para parejas que buscan compartir momentos especiales. Comodidad y calidez en un ambiente pensado para el descanso.',
    image: `${CLOUDINARY_BASE}suites/single.png`, // Usamos la misma base de alta calidad
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Minibar'],
  },
  {
    id: 3,
    name: 'Habitación Triple',
    description: 'Perfecta para compartir con amigos o familiares. Una distribución acogedora que invita a la convivencia y al buen descanso.',
    image: `${CLOUDINARY_BASE}suites/triple.png`,
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Minibar'],
  },
  {
    id: 4,
    name: 'Plan Familiar & Grupos',
    description: 'Atención personalizada para grandes familias o grupos. Coordinación dedicada para asegurar que la logística sea impecable y todos disfruten por igual.',
    image: `${CLOUDINARY_BASE}suites/grupal.png`,
    amenities: ['Desayuno Buffet', 'Atención Coordinada', 'Camas Adicionales', 'WiFi de Alta Velocidad'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function Rooms() {
  return (
    <section id="rooms" className="py-20 bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Tu Lugar en Canasvieiras
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Nuestras Habitaciones
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Cada rincón está pensado para que te sientas como en casa, con la tranquilidad que buscas a solo 2 cuadras del mar.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <motion.img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div className="p-6 pb-0">
                  <h3 className="font-display text-xl text-gray-900 mb-2">{room.name}</h3>
                  <p className="font-body text-sm text-gray-600 mb-4 h-20 overflow-hidden text-ellipsis">
                    {room.description}
                  </p>

                  <div className="mb-4">
                    <p className="font-body text-xs font-semibold text-gray-700 mb-2 uppercase">Comodidades</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-body font-medium uppercase tracking-tighter">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="font-body text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilidad</span>
                  <span className="font-display text-sm text-green-600 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Inmediata
                  </span>
                </div>
                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=Hola!%20Me%20gustaría%20consultar%20disponibilidad%20para%20la%20${encodeURIComponent(room.name)}%20en%20el%20Hotel%20Beach%20Canasvieiras.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Consultar
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}