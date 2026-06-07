import { motion } from 'framer-motion';

const rooms = [
  {
    id: 1,
    name: 'Suite Executive',
    description: 'Habitacion moderna con cama king size, minibar y vistas a la ciudad.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Minibar', 'Bano Privado'],
    price: '$150',
  },
  {
    id: 2,
    name: 'Suite Deluxe',
    description: 'Elegancia y confort con vistas al mar, cama queen size y detalles premium.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600https://images.unsplash.com/photo-1566073041694-a8fc8c3e7c3f?w=600&h=400&fit=croph=400https://images.unsplash.com/photo-1566073041694-a8fc8c3e7c3f?w=600&h=400&fit=cropfit=crop',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Minibar', 'Balcon con Vistas'],
    price: '$200',
  },
  {
    id: 3,
    name: 'Suite Presidencial',
    description: 'Lujo absoluto con cama queen size, jacuzzi privado y vistas panoramicas.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Minibar', 'Jacuzzi Privado'],
    price: '$300',
  },
  {
    id: 4,
    name: 'Habitacion Familiar',
    description: 'Espaciosa y comoda para familias, con multiples camas y zona de estar.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600https://images.unsplash.com/photo-1566073041694-a8fc8c3e7c3f?w=600&h=400&fit=croph=400https://images.unsplash.com/photo-1566073041694-a8fc8c3e7c3f?w=600&h=400&fit=cropfit=crop',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Minibar', 'Zona de Estar'],
    price: '$250',
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
            Nuestras Habitaciones
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Lujo y Confort
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Cada habitacion esta disenada para brindarte la maxima comodidad y elegancia durante tu estancia.
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
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl text-gray-900 mb-2">{room.name}</h3>
                <p className="font-body text-sm text-gray-600 mb-4">{room.description}</p>

                <div className="mb-4">
                  <p className="font-body text-xs font-semibold text-gray-700 mb-2">COMODIDADES</p>
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

                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-blue-700">{room.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Reservar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
