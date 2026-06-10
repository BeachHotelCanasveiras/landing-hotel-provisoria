import { useEffect } from "react";
import { useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

/**
 * Componente de Utilidad: ScrollToTop
 * Asegura que al cambiar de ruta o interactuar con el router, 
 * la vista regrese al inicio de la página para una experiencia fluida.
 */
function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/404" component={NotFound} />
        {/* Fallback para cualquier ruta no definida */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

/**
 * Aplicación Principal
 * Configurada con un enfoque Mobile-First y Renderizado de Alto Rendimiento.
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider delayDuration={0}>
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;