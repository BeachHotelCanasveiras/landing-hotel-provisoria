import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  { name: 'Carlos Rodriguez', location: 'Chile', rating: 5, text: 'La ubicación es perfecta, a pasos de todo y con una calidez que nos hizo sentir como en casa.', image: '/images/testimonials/avatar-cliente-chile.webp' },
  { name: 'Maria Lopez', location: 'Argentina', rating: 5, text: 'Desayuno delicioso y atención impecable. Es el lugar ideal para desconectarse en familia.', image: '/images/testimonials/avatar-cliente-argentina.webp' },
  { name: 'Juan Martinez', location: 'Uruguay', rating: 5, text: 'Excelente relación calidad-precio. La atención de todo el equipo fue maravillosa, volveremos pronto.', image: '/images/testimonials/avatar-cliente-uruguay.webp' },
  { name: 'Ana Silva', location: 'Brasil', rating: 5, text: 'Ambiente muy familiar y tranquilo sobre la avenida principal. Todo muy limpio y acogedor.', image: '/images/testimonials/avatar-cliente-brasil.webp' },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4">
            Nuestros huéspedes dicen
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-6">
            Experiencias reales en nuestro hogar
          </h2>
        </div>

        <Carousel 
          opts={{ align: "start", loop: true }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((t, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  className="bg-gray-50 p-8 rounded-2xl border border-gray-100 h-full flex flex-col justify-between"
                  whileHover={{ y: -5, borderColor: '#d4a574' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-body text-gray-700 text-base leading-relaxed italic">
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <img 
                      src={t.image} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => (e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png')}
                    />
                    <div>
                      <h4 className="font-display text-lg text-gray-900 font-semibold">{t.name}</h4>
                      <p className="font-body text-xs text-blue-700 uppercase tracking-wider">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-center mt-10 gap-4">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}