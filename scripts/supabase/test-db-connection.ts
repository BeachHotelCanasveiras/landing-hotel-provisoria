// scripts/supabase/test-db-connection.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import WebSocket from 'ws';

(globalThis as any).WebSocket = WebSocket;

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno en tu .env.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      webSocket: WebSocket
    } as any 
  });

  console.log("🔍 Probando conexión a Supabase...");

  try {
    // Consultamos la tabla 'rooms' que ya existe en tu base de datos
    const { error } = await supabase.from('rooms').select('id').limit(1);
    
    // Si la conexión se realiza, el error será null o un error de políticas RLS (lo cual es normal si no estás logueado)
    const isSuccess = !error || error.code !== 'PGRST116';

    const report = {
      timestamp: new Date().toISOString(),
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      message: isSuccess ? "Conexión establecida con éxito y credenciales validadas." : (error ? error.message : "Error desconocido")
    };

    if (!fs.existsSync('./reports')) fs.mkdirSync('./reports');
    fs.writeFileSync('./reports/connection-report.json', JSON.stringify(report, null, 2));

    if (report.status === 'SUCCESS') {
      console.log("✅ Conexión exitosa a la base de datos.");
    } else {
      console.error("❌ Fallo en la conexión:", report.message);
    }
  } catch (err: any) {
    console.error("❌ Error inesperado de conexión:", err.message);
  }
}

testConnection();