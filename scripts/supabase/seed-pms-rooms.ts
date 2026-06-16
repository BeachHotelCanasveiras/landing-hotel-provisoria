/**
 * @file seed-pms-rooms.ts
 * @description Generador de topología hotelera de próxima generación (SaaS Ready).
 * Construye dinámicamente pisos, habitaciones físicas, y estados operativos.
 * - Idempotente (Upsert): Puede ejecutarse múltiples veces sin duplicar datos.
 * - ESLint 9 Compliant: Tipado estricto.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import WebSocket from 'ws';

Object.defineProperty(globalThis, 'WebSocket', {
  value: WebSocket,
  writable: true,
  configurable: true,
});

// Configuración de Topología del Hotel (Distribución Física)
const HOTEL_TOPOLOGY = [
  { floor: 1, type: 'single', price: 200, count: 10, prefix: 100 }, // Piso 1: 101 al 110 (Single)
  { floor: 2, type: 'double', price: 200, count: 12, prefix: 200 }, // Piso 2: 201 al 212 (Double)
  { floor: 3, type: 'triple', price: 280, count: 8, prefix: 300 },  // Piso 3: 301 al 308 (Triple)
  { floor: 4, type: 'grupal', price: 80, count: 5, prefix: 400 },   // Piso 4: 401 al 405 (Grupos)
];

interface RoomInsert {
  id: number;
  name: string;
  type: string;
  price_per_night: number;
  status: string;
  housekeeping_status: string;
}

async function seedPhysicalRooms() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: Faltan variables de entorno en tu .env locales.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log("=================================================");
  console.log("🏨 INICIANDO GENERACIÓN DE TOPOLOGÍA FÍSICA (PMS)");
  console.log("=================================================");

  // 1. Generar matriz de habitaciones dinámicamente
  const physicalRooms: RoomInsert[] = [];

  for (const config of HOTEL_TOPOLOGY) {
    for (let i = 1; i <= config.count; i++) {
      // Formatear el número de habitación (ej: 101, 102... 110)
      const roomNumber = config.prefix + i;
      const formattedName = `Suite ${roomNumber}`;

      // Inyectar variabilidad realista en el estado de limpieza (15% sucias o en limpieza por defecto)
      const randomSeed = Math.random();
      const hkStatus = randomSeed > 0.90 ? 'dirty' : randomSeed > 0.85 ? 'cleaning' : 'clean';

      physicalRooms.push({
        id: roomNumber, // El ID ahora es el número físico real de la habitación
        name: formattedName,
        type: config.type,
        price_per_night: config.price,
        status: 'available',
        housekeeping_status: hkStatus,
      });
    }
  }

  console.log(`📊 Generadas ${physicalRooms.length} habitaciones en memoria.`);

  try {
    // 2. Limpieza preventiva: Eliminamos las habitaciones genéricas con ID 1,2,3,4 (del snapshot viejo)
    await supabase.from('rooms').delete().in('id', [1, 2, 3, 4]);

    // 3. Inserción Masiva Idempotente (Upsert)
    console.log("⏳ Sincronizando con Supabase (Upsert)...");
    
    const { error } = await supabase.from('rooms').upsert(physicalRooms, {
      onConflict: 'id'
    });

    if (error) throw error;

    console.log("   ✅ Catálogo de habitaciones físicas poblado con éxito.");
    console.log("\n=================================================");
    console.log("✨ SISTEMA PMS LISTO PARA OPERAR EN DASHBOARD.");
    console.log("=================================================");

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error de base de datos desconocido.';
    console.error(`\n❌ ERROR CRÍTICO: ${errorMessage}`);
  }
}

seedPhysicalRooms();