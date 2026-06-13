/**
 * @file Gallery.tsx
 * @description Sección de Galería de Imágenes (Fase 4 del Embudo: Validación Visual).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Textos traducidos dinámicamente desde el namespace 'gallery'.
 * - Validación defensiva de esquemas con Zod en DEV.
 * - Tipado estricto e inmutable de assets para prevenir excepciones de runtime.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { GalleryTranslationSchema } from '@/locales/schemas/gallery.schema';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/";

// Interfaz estricta para garantizar seguridad de tipos en el mapeo de imágenes
interface GalleryImage {
  id: number;
  key: string;
  image: string;
  title: string;
  category: string;
}

// Configuración inmutable de imágenes de la galería (Aislada del idioma)
const GALLERY_CONFIG = [
  { id: 1, key: 'reception', image: `${CLOUDINARY_BASE}hotel/hero-1.webp` },
  { id: 2, key: 'facade', image: `${CLOUDINARY_BASE}hotel/hero-2.webp` },
  { id: 3, key: 'pool', image: `${CLOUDINARY_BASE}hotel/piscina.webp` },
  { id: 4, key: 'sunset', image: `${CLOUDINARY_BASE}hotel/atardecer.webp` },
  { id: 5, key: 'suite', image: `${CLOUDINARY_BASE}suites/single.png` },
  { id: 6, key: 'family', image: `${CLOUDINARY_BASE}suites/grupal.png` },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { t, i18n } = useTranslation('gallery');

  // ============================================================================
  // VALIDACIÓN DE CONTRATO (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'gallery') || {};
      GalleryTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Gallery Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  /**
   * Combinar metadatos de imágenes con traducción localizada de forma defensiva.
   */
  const images: GalleryImage[] = GALLERY_CONFIG.map((config) => {
    const rawData = t(`items.${config.key}`, { returnObjects: true });
    const isObject = typeof rawData === 'object' && rawData !== null;

    return {
      ...config,
      title: isObject ? (rawData as any).title || '' : '',
      category: isObject ? (rawData as any).category || '' : '',
    };
  });

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container px-4">
        
        {/* Cabecera del Bloque */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            {t('title')}
          </h2>
        </div>

        {/* Grid de Imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <motion.div
              key={image.id}
              layoutId={`img-${image.id}`}
              onClick={() => setSelectedImage(image)}
              className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all bg-gray-100"
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

      {/* Lightbox Modal con soporte de LayoutId de Framer Motion */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-2"
              onClick={() => setSelectedImage(null)}
              aria-label="Cerrar vista"
            >
              <X size={32} />
            </button>
            <motion.img
              layoutId={`img-${selectedImage.id}`}
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}