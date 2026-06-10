import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

const galleryImages = [
  {
    id: 1,
    title: 'Piscina con Vista Panorámica',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    alt: 'Piscina del Hotel Beach Canasvieiras al atardecer con vista panorámica del océano',
    category: 'Instalaciones',
  },
  {
    id: 2,
    title: 'Habitación Ejecutiva',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
    alt: 'Interior de la habitación Ejecutiva del Hotel Beach Canasvieiras con cama matrimonial',
    category: 'Habitaciones',
  },
  {
    id: 3,
    title: 'Playa de Canasvieiras',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    alt: 'Playa de Canasvieiras Florianópolis con agua turquesa frente al hotel',
    category: 'Playas',
  },
  {
    id: 4,
    title: 'Restaurante Oasis',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
    alt: 'Área del buffet del desayuno buffet incluido en el Restaurante Oasis del hotel',
    category: 'Gastronomía',
  },
  {
    id: 5,
    title: 'Jacuzzi y Spa',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
    alt: 'Área de bienestar del hotel con jacuzzi de agua templada para huéspedes',
    category: 'Bienestar',
  },
  {
    id: 6,
    title: 'Atardecer en la Playa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    alt: 'Vista del atardecer desde el balcón de la suite en Hotel Beach Canasvieiras',
    category: 'Vistas',
  },
];

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
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Galería de Fotos
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            Descubre Nuestro Hotel
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Explora las instalaciones, habitaciones y vistas hermosas que te esperan en Beach Hotel Canasvieiras.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {galleryImages.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              onClick={() => setSelectedImage(image)}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
            >
              <motion.img
                src={image.image}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white"
                >
                  <p className="font-display text-lg">{image.title}</p>
                  <p className="font-body text-sm text-white/80">{image.category}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedImage ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedImage(null)}
        className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 ${
          selectedImage ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {selectedImage && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full"
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.alt}
              className="w-full h-auto rounded-lg"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <div className="mt-4 text-white">
              <h3 className="font-display text-2xl">{selectedImage.title}</h3>
              <p className="font-body text-white/80">{selectedImage.category}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}