import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/";

const galleryImages = [
  { id: 1, title: 'Recepción Principal', image: `${CLOUDINARY_BASE}hotel/hero-1.webp`, category: 'Hotel' },
  { id: 2, title: 'Fachada Avenida das Nações', image: `${CLOUDINARY_BASE}hotel/hero-2.webp`, category: 'Exterior' },
  { id: 3, title: 'Piscina en la Azotea', image: `${CLOUDINARY_BASE}hotel/piscina.webp`, category: 'Instalaciones' },
  { id: 4, title: 'Atardecer en Canasvieiras', image: `${CLOUDINARY_BASE}hotel/atardecer.webp`, category: 'Vistas' },
  { id: 5, title: 'Confort Suite', image: `${CLOUDINARY_BASE}suites/single.png`, category: 'Habitaciones' },
  { id: 6, title: 'Espacios Familiares', image: `${CLOUDINARY_BASE}suites/grupal.png`, category: 'Habitaciones' },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Nuestro rincón
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">Galería de Momentos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <motion.div
              key={image.id}
              layoutId={`img-${image.id}`}
              onClick={() => setSelectedImage(image)}
              className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={image.image}
                alt={image.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <p className="font-display text-lg">{image.title}</p>
                  <p className="font-body text-xs text-white/80 uppercase tracking-widest">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          >
            <button className="absolute top-6 right-6 text-white hover:text-blue-400 transition-colors">
              <X size={32} />
            </button>
            <motion.img
              layoutId={`img-${selectedImage.id}`}
              src={selectedImage.image}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}