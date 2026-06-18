/**
 * @file Home.tsx
 * @description Página principal optimizada con Lazy Loading (Code Splitting) de marca blanca.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y pintura del orquestador principal.
 * - Trinidad Atómica: Localización total y validación con esquemas Zod en desarrollo.
 * - Performance: Implementación de Suspense para mitigar CLS y mejorar el rendimiento de carga inicial.
 */

import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
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
  <div className="py-20 flex justify-center bg-transparent">
    <Spinner className="w-8 h-8 text-accent opacity-50" />
  </div>
);

export default function Home() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del layout principal de la landing
  usePerformanceProfiler('Home');

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
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
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
        
        <section className="py-20 bg-background border-t border-border transition-colors duration-300">
          <div className="container px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-5 py-1.5 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-border">
                {t('map_badge')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                {t('map_title')}
              </h2>
              <p className="font-body text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
                {t('map_subtitle')}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Suspense fallback={<div className="w-full h-[400px] bg-muted animate-pulse rounded-[2.5rem] border border-border" />}>
                <MapView className="w-full h-[400px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border" />
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