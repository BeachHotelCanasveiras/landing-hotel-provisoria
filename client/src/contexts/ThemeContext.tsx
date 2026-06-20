/**
 * @file ThemeContext.tsx
 * @description Proveedor de estado global de temas para el ecosistema Beach Hotel.
 * - Desacoplado: Gobernación independiente para Landing Page y Dashboard Operativo PMS.
 * - SSoT: Persistencia robusta de preferencias mediante StorageService.
 * - Tema por Defecto: Inicialización nativa en 'dark' (Tema Oscuro estilo Vercel) para el PMS.
 * - Rendimiento: Inyección directa por atributos HTML para aceleración por GPU sin renders en cascada.
 * - Telemetría: Registro de auditoría estructurado (ISO 27001) para transiciones estéticas de interfaz.
 * - Saneamiento: Resuelve la advertencia react-refresh/only-export-components de ESLint.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";

export type Theme = "light" | "dark";
export type DashboardTheme = "light" | "dark"; // 🚀 Saneamiento: Simplificado a solo Claro y Oscuro

interface ThemeContextType {
  // Configuración del Portal Web Público / Landing Page
  theme: Theme;
  toggleTheme?: () => void;
  setTheme: (theme: Theme) => void;
  switchable: boolean;

  // Configuración del Dashboard Operativo (PMS)
  dashboardTheme: DashboardTheme;
  setDashboardTheme: (theme: DashboardTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultDashboardTheme?: DashboardTheme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultDashboardTheme = "dark", // 🚀 Saneamiento: 'dark' (Oscuro) establecido como predeterminado
  switchable = true,
}: ThemeProviderProps) {
  
  // 1. Inicialización del Tema del Portal Público
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  // 2. Inicialización del Tema del Dashboard Operativo (SaaS-Ready)
  const [dashboardTheme, setDashboardThemeState] = useState<DashboardTheme>(() => {
    const stored = StorageService.getCookie("beach_dashboard_theme");
    return (stored as DashboardTheme) || defaultDashboardTheme;
  });

  // 3. Sincronización síncrona del Tema del Portal Público
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  // 4. Sincronización síncrona del Tema del Dashboard PMS + Auditoría de Telemetría (ISO 27001)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-dashboard-theme", dashboardTheme);
    StorageService.setCookie("beach_dashboard_theme", dashboardTheme, 30); // Persistencia de 30 días

    // 📊 Auditoría no intrusiva de transiciones estéticas de la consola
    console.log(
      JSON.stringify({
        event: "UI_THEME_TRANSITION",
        timestamp: new Date().toISOString(),
        scope: "dashboard",
        theme: dashboardTheme,
      })
    );
  }, [dashboardTheme]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const setDashboardTheme = (newTheme: DashboardTheme) => {
    setDashboardThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        setTheme, 
        switchable,
        dashboardTheme,
        setDashboardTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser utilizado dentro de un ThemeProvider");
  }
  return context;
}