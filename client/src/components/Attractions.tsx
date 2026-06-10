import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

const attractions = [
  {
    id: 1,
    name: 'Praia Brava',
    description: 'Un refugio natural a pocos minutos de nuestra ubicación en Avenida das Nações, ideal para conectar con el surf y la serenidad.',
    distance: '9 km',
    time: '15 min en auto',
    image: '/images/attractions/praia-brava.webp',
  },
  {
    id: 2,
    name: 'Playa Jurerê',
    description: 'Tradición y frescura a corta distancia. Una opción excelente para disfrutar momentos inolvidables en familia.',
    distance: '4 km',
    time: '10 min en auto',
    image: '/images/attractions/jurere.webp',
  },
  {
    id: 3,
    name: 'Parque Água Show',
    description: 'Entretenimiento garantizado para todas las edades. Diversión y risas a pocos minutos de tu estadía.',
    distance: '4 km',
    time: '10 min en auto',
    image: '/images/attractions/agua-show.webp',
  },
  {
    id: 4,
    name: 'Centro Histórico',
    description: 'Un paseo por la arquitectura colonial y la cultura de Florianópolis. Descubre la historia de la isla.',
    distance: '27 km',
    time: '30 min en auto',
    image: '/images/attractions/centro-historico.webp',
  },
  {
    id: 5,
    name: 'Isla del Francés',
    description: 'Un destino mágico para conectar con la fauna marina y las aguas cristalinas. Tours disponibles desde nuestra recepción.',
    distance: 'Salidas cercanas',
    time: 'Medio día',
    image: '/images/attractions/ilha-frances.webp',
  },
  {
    id: 6,
    name: 'Fortaleza São José',
    description: 'Vistas panorámicas y un viaje al pasado. Un punto de encuentro con la historia local frente al océano.',
    distance: '15 km',
    time: '20 min en auto',
    image: '/images/attractions/fortaleza.webp',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
            Ubicación Privilegiada
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Explora Canasvieiras
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Desde nuestro hogar en Avenida das Nações, tienes acceso rápido a lo mejor de Florianópolis.
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
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl text-gray-900 mb-2">{attraction.name}</h3>
                <p className="font-body text-sm text-gray-600 mb-4 h-16">{attraction.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm">{attraction.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm">{attraction.time}</span>
                  </div>
                </div>

                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=Hola!%20Me%20gustaría%20información%20para%20visitar%20${encodeURIComponent(attraction.name)}%20desde%20el%20Hotel.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full text-center px-4 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Saber cómo llegar
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}