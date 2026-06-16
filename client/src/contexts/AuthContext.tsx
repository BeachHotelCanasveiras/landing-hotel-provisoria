// client/src/contexts/AuthContext.tsx
/**
 * @file AuthContext.tsx
 * @description Proveedor de estado global de autenticación y roles de usuario.
 * - Satisface el tipado estricto (no-any-implícito) mediante anotación nativa de Supabase.
 * - Saneamiento: Resuelto el hoisting de fetchUserRole declarándola de forma clásica.
 * - Saneamiento: Exclusión de Fast Refresh para el hook personalizado para lograr compilación limpia.
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

  useEffect(() => {
    // 1. Obtener la sesión activa al inicializar
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

// CORRECCIÓN (react-refresh): Exclusión segura de la directiva de Fast Refresh para el hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}