// scripts/supabase/db-audit.ts
import 'dotenv/config';
import WebSocket from 'ws';

// Inyección global ANTES de importar Supabase
(globalThis as any).WebSocket = WebSocket;

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function auditDB() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usamos SERVICE_ROLE para auditoría

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno (URL o KEY).");
    return;
  }

  // Desactivamos realtime por completo en la inicialización
  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: false as any
  });

  console.log("🔍 Realizando auditoría completa de base de datos...");

  // Obtenemos las tablas del esquema public
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error("❌ Error al auditar esquema:", error.message);
    return;
  }

  const report = {
    timestamp: new Date().toISOString(),
    tables: data,
    total_tables: data?.length || 0
  };

  if (!fs.existsSync('./reports')) fs.mkdirSync('./reports');
  fs.writeFileSync('./reports/db-schema-audit.json', JSON.stringify(report, null, 2));
  
  console.log("✅ Auditoría completada.");
  console.log("📍 Reporte detallado guardado en: ./reports/db-schema-audit.json");
  console.table(data); 
}

auditDB();