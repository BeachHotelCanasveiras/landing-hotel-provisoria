/**
 * @file main.tsx
 * @description Punto de entrada síncrono de montaje de la SPA en el DOM.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Saneamiento de Rutas: Reemplazo de importaciones relativas locales por alias absolutos (@/*) para máxima consistencia del compilador.
 * - Rendimiento: Montaje atómico nativo de React 19.
 */

import { createRoot } from "react-dom/client";
import App from "@/App"; // 🚀 Saneamiento de Rutas: Alias absoluto
import "@/index.css"; // 🚀 Saneamiento de Rutas: Alias absoluto
import "@/lib/i18n"; // 🚀 Saneamiento de Rutas: Alias absoluto

// Montaje atómico e inmutable en el nodo raíz de index.html
createRoot(document.getElementById("root")!).render(<App />);