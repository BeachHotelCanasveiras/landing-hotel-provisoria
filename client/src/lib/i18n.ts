/**
 * @file i18n.ts
 * @description Configuración centralizada de i18next de alto rendimiento.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Observabilidad: Instrumentación con performance.now() para auditar la latencia de análisis e hidratación de diccionarios JSON (DevOps logs).
 * - Trinidad Atómica: Mapea los namespaces de forma dinámica a partir de los diccionarios unificados 'translation.json'
 *   autogenerados por el compilador automático en cada ciclo de compilación/desarrollo (dev, build, check).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { performance } from 'perf_hooks'; // 🚀 Saneamiento: Importación nativa para evitar advertencias de tipado ambiental

// --- IMPORTACIONES UNIFICADAS DE RENDIMIENTO (EVITA PARPADEO DE TEXTOS Y CARGAS REDUNDANTES) ---
import esESTranslation from '../locales/es-ES/translation.json';
import enUSTranslation from '../locales/en-US/translation.json';
import ptBRTranslation from '../locales/pt-BR/translation.json';

const startTimer = performance.now();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'es-ES': esESTranslation, // Contiene dinámicamente nav, hero, rooms, about, attractions, contact, excursions y pms namespaces
      'en-US': enUSTranslation,
      'pt-BR': ptBRTranslation
    },
    lng: 'es-ES', // Idioma por defecto inicializado bajo norma regional
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false // React ya protege nativamente contra XSS (Data Sanitization)
    }
  });

const duration = performance.now() - startTimer;

// 📊 Registro de telemetría pasiva para auditoría de inicio multilingüe
console.log(
  JSON.stringify({
    event: 'I18N_INITIALIZATION_SUCCESS',
    timestamp: new Date().toISOString(),
    latencyMs: parseFloat(duration.toFixed(3)),
    fallbackLang: 'es-ES',
  })
);

export default i18n;