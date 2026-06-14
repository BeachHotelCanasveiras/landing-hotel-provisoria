/**
 * @file Home.tsx
 * @description Página principal (Landing Page) de la SPA.
 * Estructurada bajo el "Plan de Viaje y Conversión Real" para optimizar el embudo (CRO).
 * Integra de forma nativa la sección de Geolocalización Interactiva (MapView) para dotar al viajero
 * de control geográfico y mitigar riesgos (Fase 5), validando la cercanía del hotel a la playa.
 * Inyecta el nuevo componente de Excursiones Propias como potenciador de reserva de alta gama.
 */

import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection"; // Inyección de la Fase 2 del Embudo
import Rooms from "@/components/Rooms";
import Gallery from "@/components/Gallery";
import Attractions from "@/components/Attractions";
import Excursions from "@/components/Excursions"; // Inyección de la Fase 5: Experiencias Propias
import { MapView } from "@/components/Map"; // Integración del aparato geográfico previamente huérfano
import ContactSection from "@/components/ContactSection"; // Inyección de la sección de contacto
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { HomeTranslationSchema } from '@/locales/schemas/home.schema';

export default function Home() {
  const { t, i18n } = useTranslation('home');

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DEL ESQUEMA (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'home') || {};
      HomeTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Home Page] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Fase 1: Inspiración y Deseo */}
        <Hero />
        
        {/* Fase 2: Conexión y Propuesta de Confort (El Gancho) */}
        <AboutSection />
        
        {/* Fase 3: Configuración del Descanso e Interacción de Reserva (Carrusel responsivo) */}
        <Rooms />
        
        {/* Fase 4: Validación Visual Real */}
        <Gallery />
        
        {/* Fase 5: Viabilidad Logística e Integración Geográfica */}
        <Attractions />

        {/* Fase 5 (B): Excursiones organizadas del Hotel (Carrusel responsivo) */}
        <Excursions />
        
        {/* Bloque de Geolocalización Interactiva */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="container px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                {t('map_badge')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-gray-900 mb-4 tracking-tight">
                {t('map_title')}
              </h2>
              <p className="font-body text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
                {t('map_subtitle')}
              </p>
            </div>
            
            {/* 
              Aparato MapView:
              Estilo Soft-UI con bordes de 2.5rem para transmitir confort y accesibilidad.
              Usa la API Key de Google Maps protegida desde variables de entorno locales.
            */}
            <div className="max-w-4xl mx-auto">
              <MapView className="w-full h-[400px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100" />
            </div>
          </div>
        </section>

        {/* Fase 6: Cierre de Conversión (Formulario de Contacto Alternativo) */}
        <ContactSection />

        {/* Fase 6: Validación Social */}
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}