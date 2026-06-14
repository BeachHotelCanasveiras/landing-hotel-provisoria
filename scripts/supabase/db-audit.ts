// scripts/supabase/db-audit.ts
import 'dotenv/config';
import WebSocket from 'ws';

(globalThis as any).WebSocket = WebSocket;

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function auditDB() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usamos SERVICE_ROLE para auditoría completa

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno (URL o KEY).");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: false as any
  });

  console.log("🔍 Realizando auditoría de tablas del esquema público...");

  // Listamos las tablas reales que deben estar creadas en el esquema
  const targetTables = ['users', 'guests', 'rooms', 'bookings'];
  const auditResults: any[] = [];

  for (const tableName of targetTables) {
    // Consultamos de forma ultra liviana (head: true) para verificar existencia
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      // PGRST116 indica que la tabla no se encuentra en el esquema
      console.log(`❌ Tabla Faltante: public.${tableName}`);
    } else {
      console.log(`✅ Tabla Detectada y Activa: public.${tableName}`);
      auditResults.push({ table_name: tableName, status: 'ACTIVE' });
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    tables: auditResults,
    total_tables: auditResults.length
  };

  if (!fs.existsSync('./reports')) fs.mkdirSync('./reports');
  fs.writeFileSync('./reports/db-schema-audit.json', JSON.stringify(report, null, 2));
  
  console.log("✅ Auditoría completada.");
  console.log("📍 Reporte detallado guardado en: ./reports/db-schema-audit.json");
}

auditDB();