import { motion } from 'framer-motion';
import { HOTEL_CONFIG } from '@/const';

const rooms = [
  {
    id: 1,
    name: 'Habitación Doble',
    description: 'Confortable habitación para dos personas con desayuno incluido. Ideal para parejas o estancias individuales de negocios.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    amenities: ['Desayuno Incluido', 'WiFi Gratis', 'Aire Acondicionado', 'Minibar'],
    price: 'R$ 200',
    suffix: '',
  },
  {
    id: 2,
    name: 'Habitación Triple',
    description: 'Amplia habitación para tres personas con desayuno incluido. Excelente distribución para viajes familiares o de negocios grupales.',
    image: 'https://images.unsplash.com/photo-1566073041694-a8fc8c3e7c3f?w=600&h=400&fit=crop',
    amenities: ['Desayuno Incluido', 'WiFi Gratis', 'Aire Acondicionado', 'Minibar'],
    price: 'R$ 280',
    suffix: '',
  },
  {
    id: 3,
    name: 'Habitación Cuádruple',
    description: 'Espaciosa y equipada para alojar cómodamente a cuatro personas con desayuno incluido. Ideal para familias o delegaciones.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
    amenities: ['Desayuno Incluido', 'WiFi Gratis', 'Aire Acondicionado', 'Zona de Estar'],
    price: 'R$ 340',
    suffix: '',
  },
  {
    id: 4,
    name: 'Tarifa Grupal Especial',
    description: 'Tarifa preferencial por pasajero para delegaciones y grupos de viaje. Incluye desayuno completo y política especial de cortesía.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    amenities: ['Desayuno Incluido', '1 Liberada c/10 hab.', 'Soporte Coordinador', 'WiFi Gratis'],
    price: 'R$ 80',
    suffix: ' / por pasajero',
  },
];

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
    transition: { duration: 0.6 },
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
            Tarifario de Temporada
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Habitaciones y Tarifas Netas
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Consulta nuestras tarifas netas particulares vigentes de junio a agosto con desayuno incluido.
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
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div className="p-6 pb-0">
                  <h3 className="font-display text-xl text-gray-900 mb-2">{room.name}</h3>
                  <p className="font-body text-sm text-gray-600 mb-4">{room.description}</p>

                  <div className="mb-4">
                    <p className="font-body text-xs font-semibold text-gray-700 mb-2">COMODIDADES Y CONDICIONES</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-body"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="font-display text-2xl text-blue-700 leading-none">
                    {room.price}
                  </span>
                  {room.suffix && (
                    <span className="text-[10px] text-gray-500 font-body mt-1">
                      {room.suffix}
                    </span>
                  )}
                </div>
                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=Hola!%20Me%20gustaría%20consultar%20disponibilidad%20para%20la%20${encodeURIComponent(room.name)}%20con%20tarifa%20de%20${encodeURIComponent(room.price)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
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