import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import WebSocket from 'ws';

// Inyección global para Node.js
(globalThis as any).WebSocket = WebSocket;

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno.");
    return;
  }

  // Usamos 'as any' en realtime para ignorar la restricción del tipo oficial 
  // y permitir la inyección de WebSocket sin errores de TS.
  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      webSocket: WebSocket
    } as any 
  });

  console.log("🔍 Probando conexión a Supabase...");

  try {
    const { error } = await supabase.from('test_connection').select('id').limit(1);
    
    // PGRST116: La tabla no existe, pero significa que la conexión fue exitosa
    const report = {
      timestamp: new Date().toISOString(),
      status: (!error || error.code === 'PGRST116') ? 'SUCCESS' : 'FAILED',
      message: error ? error.message : "Conexión exitosa"
    };

    if (!fs.existsSync('./reports')) fs.mkdirSync('./reports');
    fs.writeFileSync('./reports/connection-report.json', JSON.stringify(report, null, 2));

    if (report.status === 'SUCCESS') {
      console.log("✅ Conexión exitosa. Reporte guardado en ./reports/connection-report.json");
    } else {
      console.error("❌ Fallo en la conexión. Revisa el reporte.");
    }
  } catch (err) {
    console.error("❌ Error inesperado:", err);
  }
}

testConnection();