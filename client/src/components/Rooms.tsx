import { motion } from 'framer-motion';
import { HOTEL_CONFIG } from '@/const';

const rooms = [
  {
    id: 1,
    name: 'Habitación Doble',
    description: 'Confortable y acogedora habitación para dos personas con desayuno buffet completo incluido. Perfecta para descansar a pasos del mar con la calidez del hogar.',
    image: '/images/suites/habitacion-single-ejecutiva-cama-matrimonial.png',
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Minibar'],
  },
  {
    id: 2,
    name: 'Habitación Triple',
    description: 'Amplia habitación ideal para familias pequeñas. Ofrece una distribución muy acogedora para disfrutar de una estadía cómoda, sintiéndose siempre como en casa.',
    image: '/images/suites/habitacion-triple-standard-camas-individuales.png',
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Minibar'],
  },
  {
    id: 3,
    name: 'Habitación Cuádruple',
    description: 'Espaciosa y totalmente equipada para alojar cómodamente a cuatro integrantes. El espacio ideal y seguro para compartir unas vacaciones familiares inolvidables.',
    image: '/images/suites/habitacion-doble-twin-camas-separadas.png',
    amenities: ['Desayuno Buffet', 'WiFi de Alta Velocidad', 'Aire Acondicionado', 'Zona de Estar'],
  },
  {
    id: 4,
    name: 'Plan Familiar & Grupos',
    description: 'Atención personalizada y tarifas especiales para grandes familias, delegaciones o grupos de viaje. Coordinación dedicada para que disfruten sin preocupaciones.',
    image: '/images/suites/habitacion-triple-standard-camas-individuales.png',
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
            Tu Hogar en la Playa
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Nuestras Habitaciones Familiares
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Espacios diseñados para ofrecerte descanso, calidez y el máximo confort a metros de la playa de Canasvieiras.
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
                    <p className="font-body text-xs font-semibold text-gray-700 mb-2">COMODIDADES Y DETALLES</p>
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

              {/* Botón de conversión cálido sin precios fijos */}
              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Disponibilidad
                  </span>
                  <span className="font-display text-sm text-green-600 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Inmediata
                  </span>
                </div>
                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=Hola!%20Me%20gustaría%20consultar%20disponibilidad%20y%20tarifas%20para%20la%20${encodeURIComponent(room.name)}%20en%20el%20Hotel%20Beach%20Canasvieiras.`}
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