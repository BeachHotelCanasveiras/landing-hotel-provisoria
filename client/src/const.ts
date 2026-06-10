export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Fuente Única de Verdad (SSoT) de los datos reales del Hotel Beach Canasvieiras
export const HOTEL_CONFIG = {
  name: "Beach Canasvieiras",
  fullName: "Hotel Beach Canasvieiras",
  tagline: "Hospitalidad y descanso a pasos del mar",
  location: "Canasvieiras - Florianópolis - SC, Brasil",
  address: "Avenida das Nações, 75, Canasvieiras, Florianópolis, SC, Brasil",
  phoneDisplay: "+55 (48) 99812-6650",
  email: "Hotelbeachcanasvieiras@gmail.com",
  websiteUrl: "https://beachcanasvieiras.com",
  
  // Enlaces de Conversión Directa
  whatsappUrl: "https://wa.me/5548998126650",
  whatsappShortUrl: "https://w.app/hotelbeach", // Redirección corta alternativa
  
  // Redes Sociales Oficiales y Canales Profesionales
  instagramUrl: "https://www.instagram.com/hotelbeachcanasvieiras/",
  facebookUrl: "https://www.facebook.com/profile.php?id=61585066297738",
  twitterUrl: "https://x.com/beachcanasvieir",
  linkedinUrl: "https://www.linkedin.com/in/beach-canasvieiras"
};

// Generador dinámico de URL de Login en tiempo de ejecución
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};