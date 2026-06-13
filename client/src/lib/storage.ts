/**
 * @file storage.ts
 * @description Servicio de élite para la gestión de persistencia en el cliente.
 * Implementa Cookies de larga duración (Marketing/i18n) y LocalStorage con
 * recolección de basura automática (TTL) para optimizar el performance.
 */

const ONE_YEAR_DAYS = 365;

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
    } catch (e) {
      console.warn(`[StorageService] Advertencia: LocalStorage bloqueado o lleno.`, e);
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

      const item = JSON.parse(itemStr);
      const now = new Date();

      // Validación de caducidad (TTL)
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key); // Auto-limpieza
        return null;
      }
      
      return item.value as T;
    } catch (e) {
      console.warn(`[StorageService] Advertencia: Error al leer LocalStorage.`, e);
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