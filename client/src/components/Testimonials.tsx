import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Carlos Rodriguez',
    location: 'Chile',
    rating: 5,
    text: 'Excelente ubicacion, espacios comodos y limpios. El desayuno exquisito, variado y abundante. Personal excelente.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Maria Lopez',
    location: 'Argentina',
    rating: 5,
    text: 'Las instalaciones en general, la piscina y los jacuzzi ideal para cuando uno desea relajarse. Muy recomendado.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Juan Martinez',
    location: 'Uruguay',
    rating: 5,
    text: 'Todo excelente! Seguridad, comodidad, limpieza, funcionarios muy atentos. Volveremos sin dudas.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    name: 'Patricia Gonzalez',
    location: 'Paraguay',
    rating: 5,
    text: 'La ubicacion, la atencion especialmente la gente del desayuno y recepcion. Muy limpio y comida deliciosa.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Lo que Dicen Nuestros Huespedes
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Testimonios y Resenas
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Conoce las experiencias de nuestros clientes satisfechos que han disfrutado de nuestro hotel.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-display text-lg text-gray-900">{testimonial.name}</h4>
                      <p className="font-body text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="font-body text-gray-700 text-sm leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-700 to-teal-600 rounded-lg p-8 text-center text-white"
        >
          <h3 className="font-display text-3xl mb-4">Calificacion Promedio: 8.4/10</h3>
          <p className="font-body text-lg mb-6">
            Basado en 1,398 resenas verificadas de huespedes satisfechos.
          </p>
          <motion.a
            href="https://www.booking.com/hotel/br/canasvieiras-praia.es.html"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 bg-white text-blue-700 rounded-lg font-body font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver Todas las Resenas
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
