/**
 * @file App.tsx
 * @description Enrutador principal de la SPA Beach Hotel Canasvieiras.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Integra el proveedor global de autenticación y roles de Supabase (AuthProvider).
 * - Implementa el guardián de rutas protegidas (ProtectedRoute) con redirección automatizada.
 * - Registro de rutas para portal de acceso (/login) y panel multi-rol (/admin).
 */

import { useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard"; // Se creará en el siguiente paso
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
        {/* Rutas Públicas */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        
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
            </AppInitializer>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;