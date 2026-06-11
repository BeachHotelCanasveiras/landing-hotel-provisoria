/**
 * @file Rooms.tsx
 * @description Catálogo de Habitaciones (Fase 3: Decisión).
 * Refactorizado bajo las directrices del Minimalismo Ejecutivo Costero y Confort.
 * Adapta el diseño a la nueva paleta gris antracita (Quiet Luxury), mejora la jerarquía tipográfica 
 * (usando font-body para estados y etiquetas) y suaviza los CTAs a formato píldora (rounded-full).
 * Se han corregido las rutas de las imágenes para apuntar a los activos reales y al nuevo renderizado familiar.
 */

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BookingDialog from './BookingDialog';

/**
 * CONFIGURACIÓN DE ACTIVOS - CLOUDINARY
 * Servimos imágenes con optimización automática de formato (f_auto) y calidad (q_auto).
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1781114927/beach-hotel/";

interface Room {
  id: number;
  type: string;
  name: string;
  description: string;
  image: string;
  amenities: string[];
}

const rooms: Room[] = [
  {
    id: 1,
    type: 'single',
    name: 'Habitación Single',
    description: 'Tu refugio personal de calma. Un espacio diseñado para el descanso absoluto tras un día de sol en la Avenida das Nações.',
    image: `${CLOUDINARY_BASE}suites/single.png`,
    amenities: ['Desayuno Buffet', 'WiFi Alta Velocidad', 'Climatización', 'Minibar'],
  },
  {
    id: 2,
    type: 'double',
    name: 'Habitación Doble',
    description: 'El escenario perfecto para compartir. Intimidad y confort en un ambiente acogedor a solo dos cuadras del mar.',
    /* Rectificado: Ahora apunta a grupal.png, que es el activo de la suite doble twin */
    image: `${CLOUDINARY_BASE}suites/grupal.png`, 
    amenities: ['Cama Matrimonial', 'Desayuno Buffet', 'WiFi Gratis', 'Caja Fuerte'],
  },
  {
    id: 3,
    type: 'triple',
    name: 'Habitación Triple',
    description: 'Espacio y calidez para disfrutar acompañados. La distribución ideal para quienes buscan comodidad y momentos compartidos.',
    image: `${CLOUDINARY_BASE}suites/triple.png`,
    amenities: ['3 Camas', 'Desayuno Incluido', 'WiFi Alta Velocidad', 'Aire Acondicionado'],
  },
  {
    id: 4,
    type: 'grupal',
    name: 'Plan Familiar & Grupos',
    description: 'Atención dedicada para grandes grupos. Coordinamos cada detalle para que la logística sea simple y la experiencia, inolvidable.',
    /* Rectificado: Ahora apunta al nuevo renderizado hiperrealista de viajeros en la playa */
    image: `${CLOUDINARY_BASE}suites/viajeros-grupo.png`,
    amenities: ['Capacidad Extendida', 'Coordinación VIP', 'Desayuno Completo', 'WiFi'],
  },
];

/**
 * Variantes para la entrada en cascada de las tarjetas.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/**
 * Variantes para la animación individual de cada tarjeta (fade-up).
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
    },
  },
};

export default function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <section id="rooms" className="py-24 bg-gray-50/50">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera de Sección - Transmite calma y calidez */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            Hospitalidad & Confort
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5 tracking-tight">
            Nuestros Espacios de Descanso
          </h2>
          <p className="font-body text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Descubre un rincón donde la cercanía del mar y la atención dedicada crean el escenario perfecto para tus días en Canasvieiras.
          </p>
        </motion.div>

        {/* Grid de Habitaciones */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col justify-between border border-gray-100"
            >
              <div>
                {/* Contenedor de la Imagen */}
                <div className="relative h-60 overflow-hidden bg-gray-100">
                  <motion.img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-[10px] font-body font-medium uppercase tracking-wider shadow-sm">
                      {room.type === 'grupal' ? 'Especial' : '10% OFF'}
                    </span>
                  </div>
                </div>

                {/* Contenido Textual */}
                <div className="p-8 pb-0">
                  <h3 className="font-display text-2xl text-gray-900 mb-3 tracking-tight">{room.name}</h3>
                  <p className="font-body text-sm text-gray-500 mb-6 leading-relaxed line-clamp-3">
                    {room.description}
                  </p>

                  {/* Amenidades de la Habitación */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 3).map((amenity, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md font-body font-medium border border-gray-100"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta - Conversión Silenciosa */}
              <div className="p-8 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto bg-gray-50/20">
                <div className="flex flex-col">
                  <span className="font-body text-[9px] font-bold text-gray-400 uppercase tracking-widest">Disponibilidad</span>
                  <span className="font-body text-xs text-green-600 font-medium mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Activa
                  </span>
                </div>
                
                {/* Botón Reservar: Adaptado a la nueva geometría de píldora */}
                <Button 
                  onClick={() => setSelectedRoom(room)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-4 font-body text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Reservar
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Portal de Reservas - Nivelación de Élite */}
      {selectedRoom && (
        <BookingDialog 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
          roomName={selectedRoom.name}
          roomType={selectedRoom.type}
        />
      )}
    </section>
  );
}