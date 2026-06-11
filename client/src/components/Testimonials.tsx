/**
 * @file Testimonials.tsx
 * @description Sección de Testimonios y Prueba Social (Fase 5: Certeza Geográfica e Histórica).
 * Refactorizado bajo las directrices del Confort Costero. Incorpora rotación automática infinita
 * cada 3 segundos (3000ms) mediante temporizador React sobre la API de Embla, con transiciones 
 * cinemáticas amortiguadas de velocidad ultra-suave.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { 
  type CarouselApi, 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

/**
 * CONFIGURACIÓN DE ACTIVOS - CLOUDINARY
 * cloud_name: dap9ukdyq
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/testimonials/";

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

const testimonials: Testimonial[] = [
  { 
    name: 'Carlos Rodriguez', 
    location: 'Chile', 
    rating: 5, 
    text: 'La ubicación es perfecta, a pasos de todo y con una calidez que nos hizo sentir como en casa.', 
    image: `${CLOUDINARY_BASE}avatar-cliente-chile.webp` 
  },
  { 
    name: 'Maria Lopez', 
    location: 'Argentina', 
    rating: 5, 
    text: 'Desayuno delicioso y atención impecable. Es el lugar ideal para desconectarse en familia.', 
    image: `${CLOUDINARY_BASE}avatar-cliente-argentina.webp` 
  },
  { 
    name: 'Juan Martinez', 
    location: 'Uruguay', 
    rating: 5, 
    text: 'Excelente relación calidad-precio. La atención de todo el equipo fue maravillosa, volveremos pronto.', 
    image: `${CLOUDINARY_BASE}avatar-cliente-uruguay.webp` 
  },
  { 
    name: 'Ana Silva', 
    location: 'Brasil', 
    rating: 5, 
    text: 'Ambiente muy familiar y tranquilo sobre la avenida principal. Todo muy limpio y acogedor.', 
    image: `${CLOUDINARY_BASE}avatar-cliente-brasil.webp` 
  },
];

export default function Testimonials() {
  const [api, setApi] = useState<CarouselApi>();

  /**
   * Ciclo de Autoplay Infinito y Transición Suave:
   * Ejecuta la rotación cada 3000ms cuando la API de Embla está disponible.
   * Embla maneja el ciclo de regreso al inicio nativamente gracias a `loop: true`.
   */
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 3000); // 3 segundos exactos

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="container px-4">
        
        {/* Cabecera de Sección */}
        <div className="text-center mb-12">
          <span className="inline-block px-5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            Nuestros huéspedes dicen
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-6 tracking-tight">
            Experiencias reales en nuestro hogar
          </h2>
        </div>

        {/* 
          Carrusel de Testimonios:
          duration: 45 ralentiza el tiempo de deslizamiento haciéndolo increíblemente suave y continuo.
        */}
        <Carousel 
          setApi={setApi}
          opts={{ align: "start", loop: true, duration: 45 }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((t, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  className="bg-gray-50 p-8 rounded-3xl border border-gray-100 h-full flex flex-col justify-between"
                  whileHover={{ y: -5, borderColor: '#d4a574' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    {/* Sistema de Calificación (5 Estrellas) */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-body text-gray-700 text-base leading-relaxed italic">
                      "{t.text}"
                    </p>
                  </div>
                  
                  {/* Ficha del Huésped */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <img 
                      src={t.image} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png')}
                    />
                    <div>
                      <h4 className="font-display text-lg text-gray-900 font-semibold leading-tight">{t.name}</h4>
                      {/* Procedencia destacada en color arena cálida */}
                      <p className="font-body text-[10px] text-accent font-semibold uppercase tracking-wider mt-1">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navegación del Carrusel (Desktop) */}
          <div className="hidden md:flex justify-center mt-10 gap-4">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}