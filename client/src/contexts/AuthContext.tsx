// client/src/contexts/AuthContext.tsx
/**
 * @file AuthContext.tsx
 * @description Proveedor de estado global de autenticación y roles de usuario.
 * - Satisface el tipado estricto (no-any-implícito) mediante anotación nativa de Supabase.
 * - Expone el estado del usuario logueado y su rol (guest, agency, admin, developer).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserRole = 'guest' | 'agency' | 'admin' | 'developer';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa al inicializar (Tipado explícitamente de forma defensiva)
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Suscribirse a cambios con anotaciones de tipo nativas
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
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

  /**
   * Consulta el rol inmutable del usuario directamente en la base de datos de Supabase
   */
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error al recuperar rol del usuario:', error.message);
        setRole('guest'); // Fallback de seguridad en caso de error
      } else if (data) {
        setRole(data.role as UserRole);
      }
    } catch (e) {
      console.error('[AuthContext] Excepción al consultar rol:', e);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}