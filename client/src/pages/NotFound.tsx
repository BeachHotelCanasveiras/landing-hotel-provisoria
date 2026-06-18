/**
 * @file NotFound.tsx
 * @description Página de error 404 (reenvío y fallback de rutas no encontradas).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-background, border-border y text-foreground de la landing.
 * - Observabilidad: Instrumentación con usePerformanceProfiler y registro estructurado en consola para auditoría de ruteo muerto.
 * - Trinidad Atómica: Traducción localizada completa de textos informativos con valores de resiliencia.
 */

import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del 404
  usePerformanceProfiler('NotFound');

  const { t } = useTranslation('nav');
  const [, setLocation] = useLocation();

  // 📊 Registro de telemetría pasiva para auditoría de enlaces rotos en desarrollo
  if (import.meta.env.DEV) {
    console.warn(
      `[Routing Warning] Acceso a ruta inexistente (404) en la ruta: ${window.location.pathname}`
    );
  }

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 transition-colors duration-300">
      <Card className="w-full max-w-lg mx-4 shadow-xl border border-border bg-card/85 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center justify-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Alerta de error sutil y adaptativa */}
              <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse scale-110" />
              <AlertCircle className="relative h-16 w-16 text-destructive" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t('not_found_title', { defaultValue: 'Page Not Found' })}
          </h2>

          <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed max-w-sm">
            {t('not_found_desc', { 
              defaultValue: "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted." 
            })}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-[240px]">
            <Button
              onClick={handleGoHome}
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {t('go_home_button', { defaultValue: 'Go Home' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}