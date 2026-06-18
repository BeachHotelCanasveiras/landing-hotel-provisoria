/**
 * @file booking-config.ts
 * @description Fuente Única de Verdad (SSoT) y validador de configuración para la API de Booking.com.
 * Implementado bajo estándares de ingeniería de élite:
 * - ISO 27001: Centralización y enmascaramiento de credenciales de máquina sensibles.
 * - Validación Defensiva: Lanza errores preventivos detallados en inicialización si los secretos están corruptos.
 * - Zero 'any': Tipado estricto de acuerdo con TypeScript y ESLint v9.
 */

interface BookingConfig {
  /** URL base para las peticiones (Sandbox o Producción) */
  apiUrl: string;
  /** Nombre de usuario de la cuenta de máquina (XML/REST) */
  apiUsername: string;
  /** Contraseña de la cuenta de máquina */
  apiPassword: string;
  /** Identificador numérico del hotel en Booking.com */
  hotelId: string;
  /** Versión del API en uso */
  apiVersion: string;
}

/**
 * Recupera de forma validada y segura las variables de entorno para la integración con Booking.com
 * @throws {Error} Si alguna variable requerida no cumple con las directivas de seguridad o está ausente.
 */
export function getBookingConfig(): BookingConfig {
  const apiUrl = process.env.BOOKING_API_URL?.trim();
  const apiUsername = process.env.BOOKING_API_USERNAME?.trim();
  const apiPassword = process.env.BOOKING_API_PASSWORD?.trim();
  const hotelId = process.env.BOOKING_HOTEL_ID?.trim();
  const apiVersion = process.env.VITE_BOOKING_API_VERSION?.trim() || '3.2';

  // 1. Validar presencia de credenciales requeridas
  if (!apiUrl) {
    throw new Error('Falta la variable requerida [BOOKING_API_URL] en las variables de entorno.');
  }
  if (!apiUsername) {
    throw new Error('Falta la variable requerida [BOOKING_API_USERNAME] en las variables de entorno.');
  }
  if (!apiPassword) {
    throw new Error('Falta la variable requerida [BOOKING_API_PASSWORD] en las variables de entorno.');
  }
  if (!hotelId) {
    throw new Error('Falta la variable requerida [BOOKING_HOTEL_ID] en las variables de entorno.');
  }

  // 2. Validación de protocolo de seguridad (Debe ser HTTPS)
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`Inseguridad de red detectada: [BOOKING_API_URL] debe iniciar con el protocolo seguro "https://".`);
  }

  // 3. Validación de complejidad mínima de contraseña de máquina B2B
  if (apiPassword.length < 12) {
    throw new Error('Seguridad de credenciales comprometida: [BOOKING_API_PASSWORD] es sospechosamente corta.');
  }

  return {
    apiUrl,
    apiUsername,
    apiPassword,
    hotelId,
    apiVersion
  };
}

/**
 * @function getBasicAuthHeader
 * @description Genera de forma segura el encabezado HTTP de autorización básica codificado en Base64
 */
export function getBookingBasicAuthHeader(config: BookingConfig): string {
  const rawCredentials = `${config.apiUsername}:${config.apiPassword}`;
  
  // Codificación segura compatible con entornos Node.js
  const base64Credentials = Buffer.from(rawCredentials).toString('base64');
  return `Basic ${base64Credentials}`;
}