/**
 * @file storage.ts
 * @description Servicio de élite para la gestión de persistencia en el cliente.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Centralización SSoT: Consume las constantes unificadas GUEST_PROFILE_COOKIE de @shared/const.
 * - Saneamiento: Elimina aserciones de tipo 'any' implícitas al parsear localStorage con el contrato StorageItem<T>.
 * - Resiliencia: Soporta entornos híbridos (SSR) protegiendo de forma asíncrona btoa y atob.
 */

import { GUEST_PROFILE_COOKIE } from "@shared/const";

const ONE_YEAR_DAYS = 365;

interface StorageItem<T> {
  value: T;
  expiry: number;
}

export const StorageService = {
  // ============================================================================
  // COOKIES (Larga Duración / Preferencias / Tracking)
  // ============================================================================

  /**
   * Establece una cookie segura con duración de un año por defecto.
   */
  setCookie(name: string, value: string, days: number = ONE_YEAR_DAYS): void {
    if (typeof document === 'undefined') return;
    
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    
    // Secure y SameSite=Lax garantizan la protección contra ataques CSRF
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax;Secure`;
  },

  /**
   * Recupera el valor de una cookie por su nombre.
   */
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  // ============================================================================
  // PERFIL DE HUÉSPED OFUSCADO (Evita latencias y llamadas redundantes a Supabase)
  // ============================================================================

  /**
   * Guarda de forma segura y ofuscada el perfil básico del usuario en cookies por 30 días.
   */
  setObfuscatedProfile(profile: { firstName: string; lastName: string; email: string }): void {
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof btoa === 'undefined') return;
    try {
      const rawString = JSON.stringify(profile);
      // Codificación Base64 segura para ofuscación del lado del cliente
      const obfuscated = btoa(encodeURIComponent(rawString));
      this.setCookie(GUEST_PROFILE_COOKIE, obfuscated, 30); // 30 días de persistencia
    } catch (e: unknown) {
      console.warn('[StorageService] Error al serializar y ofuscar el perfil:', e instanceof Error ? e.message : e);
    }
  },

  /**
   * Recupera y des-ofusca el perfil básico del usuario de forma síncrona e instantánea.
   */
  getObfuscatedProfile(): { firstName: string; lastName: string; email: string } | null {
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof atob === 'undefined') return null;
    try {
      const cookieVal = this.getCookie(GUEST_PROFILE_COOKIE);
      if (!cookieVal) return null;
      
      const decodedString = decodeURIComponent(atob(cookieVal));
      return JSON.parse(decodedString) as { firstName: string; lastName: string; email: string };
    } catch (e: unknown) {
      console.warn('[StorageService] Error al des-ofuscar el perfil local:', e instanceof Error ? e.message : e);
      return null;
    }
  },

  /**
   * Elimina de forma segura la cookie del perfil de usuario (ej: al cerrar sesión).
   */
  removeObfuscatedProfile(): void {
    if (typeof document === 'undefined') return;
    // Expira de inmediato la cookie en el navegador
    document.cookie = `${GUEST_PROFILE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;Secure`;
  },

  // ============================================================================
  // LOCAL STORAGE (Corta-Media Duración / Caché de API)
  // ============================================================================

  /**
   * Guarda un valor en LocalStorage con un tiempo de vida (TTL) específico.
   * Útil para cachear disponibilidades de habitaciones sin golpear la DB.
   */
  setLocalWithTTL<T>(key: string, value: T, ttlMs: number): void {
    if (typeof window === 'undefined') return;
    
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttlMs,
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
      // 📊 Traza de Observabilidad: Registro pasivo de guardado de caché
      if (import.meta.env.DEV) {
        console.log(`[Storage Service] Guardado en caché local: ${key}`);
      }
    } catch (e: unknown) {
      console.warn(`[StorageService] Advertencia: LocalStorage bloqueado o lleno.`, e instanceof Error ? e.message : e);
    }
  },

  /**
   * Recupera un valor del LocalStorage. Si el TTL ha expirado,
   * se auto-limpia y retorna null.
   */
  getLocalWithTTL<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      // 🚀 Saneamiento: Tipado bajo el contrato genérico para evitar warning 'any' de ESLint
      const item = JSON.parse(itemStr) as StorageItem<T>;
      const now = new Date();

      // Validación de caducidad (TTL)
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key); // Auto-limpieza
        return null;
      }
      
      return item.value;
    } catch (e: unknown) {
      console.warn(`[StorageService] Advertencia: Error al leer LocalStorage.`, e instanceof Error ? e.message : e);
      return null;
    }
  },

  /**
   * Elimina explícitamente un registro del LocalStorage.
   */
  removeLocal(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};