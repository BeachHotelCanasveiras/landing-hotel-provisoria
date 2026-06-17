// client/src/contexts/AuthContext.tsx
/**
 * @file AuthContext.tsx
 * @description Proveedor de estado global de autenticación y roles de usuario.
 * - Satisface el tipado estricto (no-any-implícito) mediante anotación nativa de Supabase.
 * - Smart Identity Manifesto: Añadido método 'refreshUser' para hidratación en caliente sin parpadeo de recarga de página.
 * - Workaround Deadlock: Desacopladas las llamadas asíncronas de base de datos dentro del ciclo de vida
 *   de autenticación usando macro-tasks (setTimeout 0) para evitar colgar las conexiones del cliente.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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

  // Declaración clásica para que se eleve al inicio de la compilación de forma segura (Hoisting)
  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error al recuperar rol del usuario:', error.message);
        setRole('guest');
      } else if (data) {
        setRole(data.role as UserRole);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      console.error('[AuthContext] Excepción al consultar rol:', msg);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Consulta el estado del servidor de autenticación para hidratar metadatos en caliente
   */
  const refreshUser = async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (updatedUser) {
        setUser(updatedUser);
        console.log('[AuthContext] Metadatos del usuario actualizados en caliente.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de red';
      console.error('[AuthContext] Fallo al refrescar usuario de forma silenciosa:', msg);
    }
  };

  useEffect(() => {
    // 1. Obtener la sesión activa al inicializar
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setUser(session.user);
        // WORKAROUND: Desacoplar consulta asíncrona del flujo de inicialización principal
        setTimeout(() => {
          fetchUserRole(session.user!.id);
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
  }, []);

  const signOut = async () => {
    setLoading(true);
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