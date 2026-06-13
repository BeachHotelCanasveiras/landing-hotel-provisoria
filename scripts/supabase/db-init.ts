// scripts/supabase/db-init.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import WebSocket from 'ws';

(globalThis as any).WebSocket = WebSocket;

async function initDB() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno (URL o KEY).");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: false as any
  });

  console.log("🚀 Generando esquema SQL modular...");

  // El siguiente SQL debe ejecutarse en el SQL Editor de Supabase
  const sqlSchema = `
-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios (Autenticación y Roles)
-- El email es la clave única que nos permitirá gestionar la identidad y roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para usuarios
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tabla de Huéspedes (Información personal del cliente)
-- Relacionada con 'users' mediante el email
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT REFERENCES users(email),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para huéspedes
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Tabla de Habitaciones
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para habitaciones
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id INTEGER REFERENCES rooms(id),
    guest_id UUID REFERENCES guests(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para reservas
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
  `;

  // Guardamos el esquema en un archivo para referencia y documentación
  const schemaPath = './scripts/supabase/schema.sql';
  fs.writeFileSync(schemaPath, sqlSchema);

  console.log(`✅ Esquema SQL generado y guardado en: ${schemaPath}`);
  console.log(`\n⚠️ ATENCIÓN: Para aplicar este esquema, copia el contenido de ${schemaPath} y ejecútalo en el SQL Editor de Supabase.`);
  
  // Imprimimos el SQL para que lo puedas copiar fácilmente
  console.log("\n--- COPIA EL CÓDIGO ABAJO Y EJECÚTALO EN SUPABASE SQL EDITOR ---\n");
  console.log(sqlSchema);
  console.log("\n----------------------------------------------------------------\n");
}

initDB();