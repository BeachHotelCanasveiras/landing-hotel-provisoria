/**
 * @file i18n.ts
 * @description Configuración centralizada de i18next de alto rendimiento.
 * Mapea los namespaces estáticos de forma dinámica a partir de los diccionarios unificados 'translation.json'
 * autogenerados por el compilador automático en cada ciclo de compilación/desarrollo (dev, build, check).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- IMPORTACIONES UNIFICADAS DE RENDIMIENTO (EVITA PARPADEO DE TEXTOS Y CARGAS REDUNDANTES) ---
import esESTranslation from '../locales/es-ES/translation.json';
import enUSTranslation from '../locales/en-US/translation.json';
import ptBRTranslation from '../locales/pt-BR/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'es-ES': esESTranslation, // Contiene dinámicamente nav, hero, rooms, about, attractions y futuros namespaces
      'en-US': enUSTranslation,
      'pt-BR': ptBRTranslation
    },
    lng: 'es-ES', // Idioma por defecto inicializado bajo norma regional
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false // React ya protege nativamente contra XSS
    }
  });

export default i18n;