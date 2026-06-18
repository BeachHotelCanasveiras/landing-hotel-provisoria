/**
 * @file i18n.ts
 * @description Configuración centralizada de i18next de alto rendimiento para el Hotel Beach.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Saneamiento de Redundancia: Remoción absoluta de importaciones de Node.js (perf_hooks) incompatibles con el navegador.
 * - Observabilidad: Instrumentación nativa con performance.now() para auditar la latencia de carga e hidratación.
 * - Trinidad Atómica: Mapeo dinámico de namespaces a partir de los diccionarios unificados translation.json.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- IMPORTACIONES UNIFICADAS DE RENDIMIENTO (EVITA PARPADEO DE TEXTOS EN PRIMERA PINTURA) ---
import esESTranslation from '../locales/es-ES/translation.json';
import enUSTranslation from '../locales/en-US/translation.json';
import ptBRTranslation from '../locales/pt-BR/translation.json';

// Medición de inicio síncrona segura utilizando la API Web estándar
const startTimer = typeof performance !== 'undefined' ? performance.now() : Date.now();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'es-ES': esESTranslation, // Contiene dinámicamente los namespaces: nav, hero, rooms, about, etc.
      'en-US': enUSTranslation,
      'pt-BR': ptBRTranslation
    },
    lng: 'es-ES', // Configuración regional por defecto de la casa
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false // React ya desinfecta y protege nativamente contra ataques XSS
    },
    defaultNS: 'translation',
    fallbackNS: 'translation'
  });

const endTimer = typeof performance !== 'undefined' ? performance.now() : Date.now();
const duration = endTimer - startTimer;

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