/**
 * @file const.ts
 * @description Fuente Única de Verdad (SSoT) de los datos de configuración del Hotel Beach Canasvieiras.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Centralización SSoT: Re-exporta de forma agrupada todas las cookies lógicas e inmutables desde @shared/const.
 * - Resiliencia SSR: Encapsula de forma segura btoa (safeBtoa) para evitar caídas de compilación e hidratación en Vercel.
 */

// 🚀 Re-exportación unificada de constantes inmutables desde el silo compartido
export { 
  COOKIE_NAME, 
  ONE_YEAR_MS,
  DASHBOARD_THEME_COOKIE,
  GUEST_PROFILE_COOKIE,
  CHECKOUT_INTENT_COOKIE
} from "@shared/const";

// Fuente Única de Verdad (SSoT) de los datos reales del Hotel Beach Canasvieiras
export const HOTEL_CONFIG = {
  name: "Beach Canasvieiras",
  fullName: "Hotel Beach Canasvieiras",
  tagline: "Hospitalidad y descanso a pasos del mar",
  location: "Canasvieiras - Florianópolis - SC, Brasil",
  address: "Avenida das Nações, 375, Canasvieiras, Florianópolis, SC, Brasil",
  phoneDisplay: "+55 (48) 99812-6650",
  email: "reservas@beachcanasvieiras.com",
  websiteUrl: "https://beachcanasvieiras.com",
  
  // Place ID oficial de Google para tu hotel (Sincronización de Reseñas)
  googlePlaceId: "ChIJo6u7Zly_J5URP6yFhmGglAx", 
  
  // Enlaces de Conversión Directa
  whatsappUrl: "https://wa.me/5548998126650",
  whatsappShortUrl: "https://w.app/hotelbeach", // Redirección corta alternativa
  
  // Redes Sociales Oficiales y Canales Profesionales
  instagramUrl: "https://www.instagram.com/hotelbeachcanasvieiras/",
  facebookUrl: "https://www.facebook.com/profile.php?id=61585066297738",
  twitterUrl: "https://x.com/beachcanasvieir",
  linkedinUrl: "https://www.linkedin.com/in/beach-canasvieiras"
};

/**
 * @function safeBtoa
 * @description Codifica un string a Base64 de forma segura en entornos cliente y servidor (SSR).
 */
const safeBtoa = (str: string): string => {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  // Fallback seguro en hilos del servidor de Node.js durante pre-rendering/compilación
  return globalThis.Buffer ? globalThis.Buffer.from(str).toString('base64') : str;
};

/**
 * @function getLoginUrl
 * @description Generador dinámico de URL de Login para Supabase Auth en tiempo de ejecución.
 */
export const getLoginUrl = (): string => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = safeBtoa(redirectUri); // 🚀 SSR Guard: Encodificación Base64 segura

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId || '');
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};