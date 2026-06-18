/**
 * @file App.tsx
 * @description Enrutador principal de la SPA Beach Hotel Canasvieiras.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Saneamiento TS2307: Reemplazo de importaciones relativas por alias absolutos (@/*) para una resolución inmaculada de módulos.
 * - Inyecta el QueryClientProvider para cacheo avanzado de peticiones de disponibilidad y pagos.
 * - Integra el proveedor global de autenticación y roles de Supabase (AuthProvider).
 * - Implementa el guardián de rutas protegidas (ProtectedRoute) con redirección automatizada.
 * - Registro de rutas para portal de acceso (/login), éxito de Stripe (/success) y panel multi-rol (/admin).
 * - Vercel Analytics: Inyección del visor transaccional y de performance en la raíz de la app.
 * - Vercel Speed Insights: Monitoreo in-house de rendimiento y Core Web Vitals (LCP, CLS, INP) 100% gratuito.
 */

import { useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react"; // 🚀 Integración Oficial de Analíticas Vercel
import { SpeedInsights } from "@vercel/speed-insights/react"; // 🚀 Integración Oficial de Speed Insights Vercel
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary"; // 🚀 Saneamiento TS2307: Alias absoluto
import { ThemeProvider } from "@/contexts/ThemeContext"; // 🚀 Saneamiento TS2307: Alias absoluto
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // 🚀 Saneamiento TS2307: Alias absoluto
import Home from "@/pages/Home"; // 🚀 Saneamiento TS2307: Alias absoluto
import Login from "@/pages/Login"; // 🚀 Saneamiento TS2307: Alias absoluto
import AdminDashboard from "@/pages/AdminDashboard"; // 🚀 Saneamiento TS2307: Alias absoluto
import Success from "@/pages/Success"; // 🚀 Saneamiento TS2307: Alias absoluto
import { useAppMiddleware } from "@/hooks/useAppMiddleware"; // 🚀 Saneamiento TS2307: Alias absoluto

/**
 * Inicialización del cliente global de consultas (TanStack Query).
 * Brinda resiliencia a la red limitando los reintentos automáticos
 * y cacheando disponibilidades por 5 minutos.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

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
 * Guardián de Rutas Protegidas (ProtectedRoute)
 * Intercepta accesos no autorizados y redirige fluidamente a /login.
 */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="w-6 h-6 text-primary/50" />
      </div>
    );
  }

  return user ? <Component /> : null;
}

/**
 * Enrutador Principal de la Aplicación
 */
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Rutas Públicas y Transaccionales */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/success" component={Success} />
        
        {/* Rutas Protegidas (Garantía de Rol y Seguridad) */}
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} />}
        </Route>
        
        {/* Fallback de error 404 */}
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <TooltipProvider delayDuration={0}>
              <AppInitializer>
                <Toaster 
                  position="top-center" 
                  richColors 
                  closeButton
                />
                <Router />
                <Analytics /> {/* 🚀 Analíticas transversales de tráfico, velocidad y conversiones de Stripe */}
                <SpeedInsights /> {/* 🚀 Diagnóstico en tiempo real de rendimiento y Core Web Vitals */}
              </AppInitializer>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;