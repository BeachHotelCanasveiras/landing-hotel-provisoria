/**
 * @file ErrorBoundary.tsx
 * @description Guardián de fallos de nivel raíz para contener y reportar excepciones de renderizado.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-background, bg-card, border-border de la landing.
 * - Observabilidad: Captura y registro asíncrono estructurado en JSON (DevOps logs) para su análisis en Axiom/Vercel.
 * - Identidad: Integra el componente de Logotipo corporativo en la cabecera para mantener la estética de la casa.
 * - Localización Failsafe: Detección y traducción síncrona robusta sin dependencias de hooks para evitar loops de colapso.
 */

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface LocaleStrings {
  title: string;
  desc: string;
  btn: string;
}

/**
 * @function getFailsafeLocales
 * @description Devuelve cadenas de traducción síncronas para el idioma activo del navegador.
 */
function getFailsafeLocales(): LocaleStrings {
  // Intentar detectar idioma desde el HTML o el navegador
  const activeLang = (typeof document !== "undefined" && document.documentElement.lang) || 
                     (typeof navigator !== "undefined" && navigator.language) || 
                     "es";

  const lowerLang = activeLang.toLowerCase();

  if (lowerLang.startsWith("pt")) {
    return {
      title: "Ops, algo deu errado",
      desc: "Estamos trabalhando para que sua experiência seja perfeita. Por favor, tente recarregar a página.",
      btn: "Recarregar página"
    };
  }

  if (lowerLang.startsWith("en")) {
    return {
      title: "Oops, something went wrong",
      desc: "We are working to ensure your experience is comfortable. Please try refreshing the page.",
      btn: "Refresh page"
    };
  }

  // Fallback por defecto: Español de España (es-ES)
  return {
    title: "Ups, algo salió mal",
    desc: "Estamos trabajando para que tu experiencia sea ideal. Por favor, intenta refrescar la página.",
    btn: "Recargar página"
  };
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 📊 Capa de Telemetría DevOps: Registro asíncrono estructurado en JSON
    console.error(
      JSON.stringify({
        event: "FRONTEND_CRASH",
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      })
    );
  }

  render() {
    if (this.state.hasError) {
      const locales = getFailsafeLocales();

      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-background transition-colors duration-300">
          <div className="flex flex-col items-center w-full max-w-lg p-8 sm:p-10 bg-card rounded-[2.5rem] border border-border shadow-2xl text-center space-y-6">
            
            {/* Logotipo Branded Integrado */}
            <div className="flex justify-center border-b border-border pb-4 w-full">
              <Logo variant="logo-main" theme="dark" className="h-8 md:h-[30px]" />
            </div>

            <div className="relative">
              {/* Alerta animada de sutil contraste */}
              <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping scale-75" />
              <AlertTriangle
                size={44}
                className="text-accent mb-2 flex-shrink-0 relative z-10"
              />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl text-foreground tracking-tight">
                {locales.title}
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed font-light">
                {locales.desc}
              </p>
            </div>

            {/* Botón de Recuperación Rápida */}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-none w-full",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer font-body font-semibold text-xs uppercase tracking-wider shadow-md"
              )}
            >
              <RotateCcw size={14} />
              {locales.btn}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;