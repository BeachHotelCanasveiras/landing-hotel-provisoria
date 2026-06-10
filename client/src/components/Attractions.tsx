import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';

const attractions = [
  {
    id: 1,
    name: 'Praia Brava',
    description: 'Playa salvaje y hermosa a 9 km del hotel, perfecta para surfistas y amantes de la naturaleza.',
    distance: '9 km',
    time: '15 min en auto',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    alt: 'Paisaje natural y olas de Praia Brava en Florianópolis cerca del hotel'
  },
  {
    id: 2,
    name: 'Playa Jurerê',
    description: 'Playa tradicional con ambiente bohemio, tiendas y restaurantes. Ideal para familias.',
    distance: '4 km',
    time: '10 min en auto',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    alt: 'Arena blanca y aguas calmas de la Playa Jurerê en Florianópolis'
  },
  {
    id: 3,
    name: 'Parque Acuático Água Show',
    description: 'Parque acuático con piscinas, toboganes y entretenimiento para toda la familia.',
    distance: '4 km',
    time: '10 min en auto',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
    alt: 'Toboganes de agua y piscinas recreativas en el Parque Acuático Água Show'
  },
  {
    id: 4,
    name: 'Centro Histórico',
    description: 'Centro colonial de Florianópolis con arquitectura histórica, museos y gastronomía.',
    distance: '27 km',
    time: '30 min en auto',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    alt: 'Arquitectura histórica y calles coloniales en el Centro de Florianópolis'
  },
  {
    id: 5,
    name: 'Isla del Francés',
    description: 'Tours en kayak, snorkel y avistamiento de fauna marina. Experiencia inolvidable.',
    distance: 'Tours desde el hotel',
    time: 'Medio día',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    alt: 'Excursión marítima y snorkel en las aguas cristalinas de la Isla del Francés'
  },
  {
    id: 6,
    name: 'Fortaleza São José',
    description: 'Fortaleza histórica del siglo XVIII con vistas panorámicas del océano.',
    distance: '15 km',
    time: '20 min en auto',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    alt: 'Murallas de piedra de la histórica Fortaleza de São José frente al mar'
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

export default function Attractions() {
  return (
    <section id="attractions" className="py-20 bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Explora la Isla
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Atracciones de Florianópolis
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Descubre las mejores playas, parques y atracciones turísticas cerca de nuestro hotel.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {attractions.map((attraction) => (
            <motion.div
              key={attraction.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={attraction.image}
                  alt={attraction.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl text-gray-900 mb-2">{attraction.name}</h3>
                <p className="font-body text-sm text-gray-600 mb-4">{attraction.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm">{attraction.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm">{attraction.time}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Más Información
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}