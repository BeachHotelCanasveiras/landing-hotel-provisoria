import { useEffect } from "react";
import { useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useAppMiddleware } from "./hooks/useAppMiddleware";

/**
 * Componente de Utilidad: ScrollToTop
 * Asegura que al cambiar de ruta, la vista regrese al inicio.
 */
function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Enrutador Principal
 */
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

/**
 * Inicializador de Aplicación (Gatekeeper)
 * Retiene la carga de la UI hasta que el Middleware de Idioma/Cookies esté listo.
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isReady } = useAppMiddleware();

  if (!isReady) {
    // Pantalla de carga ultra-minimalista (evita Flash of Translated Text)
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="w-6 h-6 text-primary/50" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Aplicación Principal
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider delayDuration={0}>
          <AppInitializer>
            <Toaster 
              position="top-center" 
              richColors 
              closeButton
            />
            <Router />
          </AppInitializer>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;