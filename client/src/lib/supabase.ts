/**
 * @file supabase.ts
 * @description Cliente Singleton de Supabase blindado para entornos de producción.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - TypeScript SSoT: Erradicación absoluta de aserciones de tipo 'any' mediante el uso seguro de 'unknown'.
 * - Observabilidad: Registra un log estructurado JSON de inicialización (Database Connection Status).
 * - Resiliencia: Evita el crash ("pantalla en blanco") de la aplicación principal si las variables de entorno no están configuradas en Vercel.
 * - Rendimiento: Preserva el tipado nativo oficial de SupabaseClient para mantener la inferencia de tipos activa.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCredentials = !!(supabaseUrl && supabaseAnonKey);

// 📊 Registro de telemetría pasiva para auditoría de inicio de conexión
console.log(
  JSON.stringify({
    event: 'SUPABASE_CLIENT_INITIALIZED',
    timestamp: new Date().toISOString(),
    connectionEstablished: hasCredentials,
  })
);

// Tipamos explícitamente como SupabaseClient para mantener la inferencia de tipos activa sin usar 'any'
export const supabase: SupabaseClient = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as unknown as Record<string, unknown>, {
      get(_target: Record<string, unknown>, prop: string | symbol) {
        return () => {
          console.warn(
            `[Supabase Proxy] ⚠️ Intento de llamar a 'supabase.${String(prop)}' pero las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas.`
          );
          return Promise.resolve({ 
            data: { session: null }, // Mantenemos la estructura síncrona esperada por AuthContext
            error: { message: "Servicios administrativos de base de datos temporalmente no disponibles." } 
          });
        };
      }
    }) as unknown as SupabaseClient);