// client/src/contexts/AuthContext.tsx
/**
 * @file AuthContext.tsx
 * @description Proveedor de estado global de autenticación y roles de usuario.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Cumplimiento Estricto: Estabilización de dependencias con useCallback para evitar fallos de ESLint.
 * - Satisface el tipado estricto (no-any-implícito) mediante anotación nativa de Supabase.
 * - Smart Identity Manifesto: Sincroniza e hidrata en caliente el perfil del huésped en cookies seguras.
 * - Self-Healing Integrity Engine: Detecta y auto-repara de forma síncrona registros de huéspedes legacy huérfanos en public.guests.
 * - Workaround Deadlock: Desacopladas las llamadas asíncronas de base de datos dentro del ciclo de vida de autenticación.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { StorageService } from '@/lib/storage'; // 🚀 Importación del servicio de persistencia segura

export type UserRole = 'guest' | 'agency' | 'admin' | 'developer' | 'housekeeper';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Consulta el estado fresco del usuario en el servidor para actualizar metadatos en caliente */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene de forma asíncrona el rol relacional asignado al identificador del usuario.
   */
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error al recuperar rol del usuario:', error.message);
        setRole('guest');
      } else if (userData) {
        setRole(userData.role as UserRole);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      console.error('[AuthContext] Excepción al consultar rol:', msg);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🚀 MOTOR DE AUTO-CURACIÓN (Self-Healing Engine):
   * Comprueba la integridad del perfil, repara registros huérfanos de base de datos y cachea en cookies de forma segura.
   */
  const syncUserProfileCookie = useCallback(async (activeUser: User) => {
    try {
      const email = activeUser.email || '';
      
      // 1. Consultar si existe registro físico en public.guests para evitar "Byzantine Drift"
      const { data: guestData, error: fetchError } = await supabase
        .from('guests')
        .select('first_name, last_name, phone')
        .eq('id', activeUser.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      let firstName = '';
      let lastName = '';

      // 🛠️ ACCIÓN DE AUTO-CURACIÓN: Si la fila no existe en public.guests (Usuario legacy/húmedo)
      if (!guestData) {
        console.warn(`[Self-Healing] Detectado usuario sin perfil en public.guests: ${email}. Auto-reparando base de datos en caliente...`);
        
        const fullName = activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || '';
        const parts = fullName.trim().split(/\s+/);
        firstName = parts[0] || email.split('@')[0] || 'Huésped';
        
        // Capitalización limpia del Nombre
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = parts.slice(1).join(' ') || 'Huésped';

        // Insertar síncronamente el registro de auto-curación para que no vuelva a fallar
        const { error: insertError } = await supabase
          .from('guests')
          .insert([{
            id: activeUser.id,
            user_email: email,
            first_name: firstName,
            last_name: lastName
          }]);

        if (insertError) {
          console.error('[Self-Healing Failure] No se pudo insertar perfil de auto-curación:', insertError.message);
        } else {
          console.log(`[Self-Healing Success] Registro de huésped reparado con éxito en public.guests para: ${email}`);
        }
      } else {
        firstName = guestData.first_name || '';
        lastName = guestData.last_name || '';
      }

      // Si por razones excepcionales sigue vacío, aplicamos la capa Failsafe
      if (!firstName) {
        const emailPart = email.split('@')[0] || '';
        firstName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
        lastName = 'Huésped';
      }

      // 2. Sincronizar de forma instantánea la Cookie Ofuscada
      StorageService.setObfuscatedProfile({
        firstName,
        lastName,
        email
      });
      
      console.log('[AuthContext] Perfil de usuario sincronizado y cacheado en cookies locales.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de red';
      console.warn('[AuthContext] Error al guardar caché de perfil local:', msg);
    }
  }, []);

  /**
   * Consulta el estado del servidor de autenticación para actualizar metadatos en caliente
   */
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (updatedUser) {
        setUser(updatedUser);
        await syncUserProfileCookie(updatedUser); // Sincroniza metadatos frescos
        console.log('[AuthContext] Metadatos del usuario actualizados en caliente.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de red';
      console.error('[AuthContext] Fallo al refrescar usuario de forma silenciosa:', msg);
    }
  }, [syncUserProfileCookie]);

  useEffect(() => {
    // 1. Obtener la sesión activa al inicializar
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setUser(session.user);
        // WORKAROUND: Desacoplar consulta asíncrona del flujo de inicialización principal
        setTimeout(() => {
          fetchUserRole(session.user!.id);
          syncUserProfileCookie(session.user!); // 🚀 Sincronización in-background de cookie de perfil y auto-curación
        }, 0);
      } else {
        setLoading(false);
      }
    });

    // 2. Suscribirse a cambios con anotaciones de tipo nativas
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setUser(session.user);
          // WORKAROUND: Prevenir deadlock (bloqueo mutuo) en supabase-js v2 liberando el hilo síncrono
          setTimeout(() => {
            fetchUserRole(session.user!.id);
            syncUserProfileCookie(session.user!); // 🚀 Sincronización in-background de cookie de perfil y auto-curación
          }, 0);
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserRole, syncUserProfileCookie]);

  const signOut = async () => {
    setLoading(true);
    StorageService.removeObfuscatedProfile(); // 🚀 Destruye caché de perfil al desloguearse
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// CORRECCIÓN (react-refresh): Exclusión segura de la directiva de Fast Refresh para el hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}