/**
 * @file Home.tsx
 * @description Página principal optimizada con Lazy Loading (Code Splitting).
 * Implementación de Suspense para mitigar CLS y mejorar el rendimiento de carga inicial.
 */

import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from "@/components/ui/spinner";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Rooms from "@/components/Rooms";
import Gallery from "@/components/Gallery";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { HomeTranslationSchema } from '@/locales/schemas/home.schema';

// Carga perezosa de los aparatos pesados
const Attractions = lazy(() => import("@/components/attractions").then(m => ({ default: m.Attractions })));
const Excursions = lazy(() => import("@/components/excursions").then(m => ({ default: m.Excursions })));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const MapView = lazy(() => import("@/components/Map").then(m => ({ default: m.MapView })));

// Componente fallback ligero para mantener la jerarquía visual
const SectionFallback = () => (
  <div className="py-20 flex justify-center">
    <Spinner className="w-8 h-8 text-accent opacity-50" />
  </div>
);

export default function Home() {
  const { t, i18n } = useTranslation('home');

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
        <Hero />
        <AboutSection />
        <Rooms />
        <Gallery />
        
        <Suspense fallback={<SectionFallback />}>
          <Attractions />
          <Excursions />
        </Suspense>
        
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
            
            <div className="max-w-4xl mx-auto">
              <Suspense fallback={<div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-[2.5rem]" />}>
                <MapView className="w-full h-[400px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100" />
              </Suspense>
            </div>
          </div>
        </section>

        <ContactSection />

        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}