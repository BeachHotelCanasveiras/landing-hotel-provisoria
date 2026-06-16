/**
 * @file Rooms.tsx
 * @description Catálogo de Habitaciones (Fase 3 del Embudo: Decisión).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Saneamiento completo de tipos: Libre de 'any' para ESLint v9.
 * - Inyección visual de mini-iconos responsivos al lado de cada píldora de amenities.
 * - Implementa la TÁCTICA HÍBRIDA móvil (Snap-Scroll horizontal en celulares).
 * - Textos mapeados dinámicamente desde el namespace 'rooms' de i18next.
 * - Validación estructural estricta con Zod (RoomsTranslationSchema).
 */

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  AirVent, Wifi, Coffee, GlassWater, BedDouble, Bed, 
  KeyRound, Users, ShieldCheck, HelpCircle 
} from 'lucide-react';
import BookingDialog from './BookingDialog';
import { RoomsTranslationSchema } from '@/locales/schemas/rooms.schema';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1781114927/beach-hotel/";

interface RoomConfig {
  id: number;
  type: 'single' | 'double' | 'triple' | 'grupal';
  image: string;
}

interface RoomData {
  id: number;
  type: string;
  name: string;
  description: string;
  image: string;
  amenities: string[];
}

/**
 * Contrato estricto para los textos localizados devueltos por i18next
 * para evitar el tipo 'any' implícito (satisfaciendo ESLint v9).
 */
interface RoomTranslation {
  name: string;
  description: string;
  amenities: string[];
}

const ROOMS_CONFIG: RoomConfig[] = [
  { id: 1, type: 'single', image: `${CLOUDINARY_BASE}suites/single.png` },
  { id: 2, type: 'double', image: `${CLOUDINARY_BASE}suites/grupal.png` },
  { id: 3, type: 'triple', image: `${CLOUDINARY_BASE}suites/triple.png` },
  { id: 4, type: 'grupal', image: `${CLOUDINARY_BASE}suites/viajeros-grupo.png` },
];

/**
 * @function getAmenityIcon
 * @description Mapeador de precisión bilingüe para inyectar mini-iconos de alta definición.
 * @param {string} amenityText - Texto localizado del amenity.
 * @returns {React.ReactElement} Icono SVG de Lucide React de 12px de ancho.
 */
const getAmenityIcon = (amenityText: string): React.ReactElement => {
  const text = amenityText.toLowerCase();
  
  if (text.includes('aire') || text.includes('climatizac') || text.includes('ac')) {
    return <AirVent size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('wifi') || text.includes('internet')) {
    return <Wifi size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('desayuno') || text.includes('café') || text.includes('comida')) {
    return <Coffee size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('minibar') || text.includes('frigobar') || text.includes('bebida')) {
    return <GlassWater size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('matrimonial') || text.includes('casal') || text.includes('doble')) {
    return <BedDouble size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('cama') || text.includes('solteiro') || text.includes('single')) {
    return <Bed size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('fuerte') || text.includes('cofre') || text.includes('seguridad')) {
    return <KeyRound size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('grupal') || text.includes('capacidad') || text.includes('familia') || text.includes('grupo')) {
    return <Users size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  if (text.includes('vip') || text.includes('coordinac')) {
    return <ShieldCheck size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
  }
  
  return <HelpCircle size={12} className="text-accent shrink-0" strokeWidth={1.8} />;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; type: string; name: string } | null>(null);
  const { t, i18n } = useTranslation('rooms');

  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'rooms') || {};
      RoomsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Rooms Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  const rooms: RoomData[] = ROOMS_CONFIG.map((config) => {
    const rawData = t(`suites.${config.type}`, { returnObjects: true });
    const isObject = typeof rawData === 'object' && rawData !== null;
    
    // Casting de tipos seguro para evitar explicit-any de ESLint
    const typedData = isObject ? (rawData as unknown as RoomTranslation) : null;

    return {
      ...config,
      name: typedData ? typedData.name : '',
      description: typedData ? typedData.description : '',
      amenities: typedData && Array.isArray(typedData.amenities) 
        ? typedData.amenities 
        : [],
    };
  });

  return (
    <section id="rooms" className="py-24 bg-gray-50/50">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5 tracking-tight">{t('title')}</h2>
          <p className="font-body text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">{t('subtitle')}</p>
        </motion.div>

        {/* CONTENEDOR HÍBRIDO ADAPTATIVO (Mobile: Snap-Scroll / Desktop: Grid de 4 columnas) */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          className="flex lg:grid lg:grid-cols-4 gap-8 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 lg:pb-0 px-4 -mx-4 sm:px-0 sm:mx-0"
        >
          {rooms.map((room) => (
            <motion.div 
              key={room.id} 
              variants={itemVariants} 
              whileHover={{ y: -8 }} 
              className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-500 flex flex-col justify-between border border-gray-100"
            >
              <div>
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
                      {room.type === 'grupal' ? t('special_badge') : t('discount_badge')}
                    </span>
                  </div>
                </div>
                <div className="p-8 pb-0">
                  <h3 className="font-display text-2xl text-gray-900 mb-3 tracking-tight">{room.name}</h3>
                  <p className="font-body text-sm text-gray-500 mb-6 leading-relaxed line-clamp-3">{room.description}</p>
                  
                  {/* Píldoras de Amenities Saneadas e Iconizadas */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 text-[10px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md font-body font-medium border border-gray-100 select-none"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto bg-gray-50/20">
                <div className="flex flex-col">
                  <span className="font-body text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('availability_label')}</span>
                  <span className="font-body text-xs text-green-600 font-medium mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    {t('active_status')}
                  </span>
                </div>
                <Button 
                  onClick={() => setSelectedRoom({ id: room.id, type: room.type, name: room.name })} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-4 font-body text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {t('book_button')}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Indicador de ayuda táctil para móviles */}
        <div className="flex lg:hidden justify-center items-center gap-1.5 mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="font-body text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Desliza para ver más habitaciones
          </p>
        </div>

      </div>

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