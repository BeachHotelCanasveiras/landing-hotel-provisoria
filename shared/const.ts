/**
 * @file const.ts
 * @description Fuente Única de Verdad (SSoT) para constantes estáticas compartidas del ecosistema.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Centralización SSoT: Cohesión de identificadores de cookies de sesión, temas y perfiles en un solo silo inmutable.
 */

// 1. Duraciones de Tiempo de Vida (TTL) Estándar
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const THIRTY_MINUTES_S = 60 * 30; // Tiempo límite transaccional óptimo

// 2. Identificadores Únicos de Cookies de Sesión e Identidad (SSoT)
export const COOKIE_NAME = "app_session_id";
export const DASHBOARD_THEME_COOKIE = "beach_dashboard_theme";
export const GUEST_PROFILE_COOKIE = "beach_guest_profile";
export const CHECKOUT_INTENT_COOKIE = "beach_checkout_intent";