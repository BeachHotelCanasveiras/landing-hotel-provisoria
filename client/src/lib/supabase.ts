// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "[Supabase Client] ⚠️ Advertencia: Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en tu archivo .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);