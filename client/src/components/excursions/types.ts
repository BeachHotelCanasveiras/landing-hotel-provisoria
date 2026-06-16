/**
 * @file types.ts
 * @description Contratos de datos estandarizados para el ecosistema de Excursiones.
 * 
 * 🏗️ ROADMAP CMS (FASE 4):
 * - Esta interfaz mapeará exactamente con la tabla `public.excursions` en Supabase.
 * - `slug`: Permitirá rutas dinámicas SEO-friendly (ej. /excursiones/tour-floripa).
 * - `tags`: Array de strings para el motor de búsqueda transversal.
 * - `pdfUrl`: Enlace al folleto auto-generado alojado en el bucket de Cloudinary.
 */

export interface ExcursionItem {
  id: string; 
  slug: string; 
  image: string;
  destinationName: string;
  mapMode: 'directions' | 'satellite' | 'hybrid';
  altImages: string[];
  
  // --- METADATOS CMS (Búsqueda y Distribución) ---
  tags?: string[]; 
  pdfUrl?: string; 
  isActive?: boolean; 
}

const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/beach-hotel/excursiones/";

// SSoT Temporal hasta conectar useQuery con Supabase
export const FALLBACK_EXCURSIONS: ExcursionItem[] = [
  { id: 'city_tour', slug: 'city-tour-floripa', image: `${CLOUDINARY_BASE}city-tour.jpg`, destinationName: "Centro Historico, Florianopolis", mapMode: 'directions', altImages: ['https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=600&q=80'], tags: ['cultural', 'familiar'] },
  { id: 'beto_carrero', slug: 'beto-carrero-world', image: `${CLOUDINARY_BASE}beto-carrero.jpg`, destinationName: "Beto Carrero World, Penha", mapMode: 'directions', altImages: ['https://images.unsplash.com/photo-1513885045260-6b3086b24c17?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'], tags: ['diversion', 'infantil'] },
  { id: 'ilha_campeche', slug: 'ilha-do-campeche', image: `${CLOUDINARY_BASE}ilha-campeche.jpg`, destinationName: "Ilha do Campeche, Florianopolis", mapMode: 'satellite', altImages: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80'], tags: ['naturaleza', 'playa'] },
  { id: 'bombinhas', slug: 'praia-de-bombinhas', image: `${CLOUDINARY_BASE}bombinhas.jpg`, destinationName: "Praia de Bombinhas, SC", mapMode: 'hybrid', altImages: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80'], tags: ['playa', 'relax'] },
  { id: 'guarda_embau', slug: 'guarda-do-embau', image: `${CLOUDINARY_BASE}guarda-embau.jpg`, destinationName: "Guarda do Embau, Palhoca", mapMode: 'satellite', altImages: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'], tags: ['aventura', 'naturaleza'] },
  { id: 'joaquina', slug: 'playa-joaquina', image: `${CLOUDINARY_BASE}joaquina.jpg`, destinationName: "Praia da Joaquina, Florianopolis", mapMode: 'hybrid', altImages: ['https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80'], tags: ['surf', 'aventura'] },
];