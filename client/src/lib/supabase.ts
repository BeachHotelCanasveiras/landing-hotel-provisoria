// client/src/lib/supabase.ts
/**
 * @file supabase.ts
 * @description Cliente Singleton de Supabase blindado para entornos de producción.
 * - Evita el crash ("pantalla en blanco") de la aplicación principal si las variables 
 *   de entorno no están configuradas en el host (Vercel).
 * - Preserva el tipado nativo oficial de SupabaseClient para evitar errores TS7006.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCredentials = !!(supabaseUrl && supabaseAnonKey);

// Tipamos explícitamente como SupabaseClient para mantener la inferencia de tipos activa
export const supabase: SupabaseClient = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get(_, prop) {
        return () => {
          console.warn(
            `[Supabase Proxy] ⚠️ Intento de llamar a 'supabase.${String(prop)}' pero las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas.`
          );
          return Promise.resolve({ 
            data: { session: null }, // Mantenemos la estructura síncrona esperada por AuthContext
            error: { message: "Servicios administrativos temporalmente no disponibles." } 
          });
        };
      }
    }) as any;