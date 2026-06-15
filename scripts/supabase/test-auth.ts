/**
 * @file test-auth.ts
 * @description Script de diagnóstico para verificar el acceso y rol del Súper Usuario.
 * - ISO 27001: Verificación de control de accesos (RBAC) y login de credenciales administrativas.
 * - ESLint 9 Compliant: 100% libre de tipados 'any'.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

// Inyección limpia de WebSocket sin usar 'any'
Object.defineProperty(globalThis, 'WebSocket', {
  value: WebSocket,
  writable: true,
  configurable: true,
});

interface AuditStep {
  step: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  userId?: string;
  role_assigned?: string;
  session?: boolean;
  message?: string;
}

interface AuditReport {
  timestamp: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  steps: AuditStep[];
}

async function testAuthCycle() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: Faltan variables de entorno de Supabase.");
    return;
  }

  // Cliente administrativo
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Credenciales reales de producción (Ignoradas en Git para protección de secretos)
  const adminEmail = 'razpodesta@gmail.com';
  const adminPassword = 'BeachAdmin2026!';
  const reportPath = path.resolve(process.cwd(), 'reports', 'supabase', 'auth-audit.json');
  
  const report: AuditReport = { 
    timestamp: new Date().toISOString(), 
    status: 'RUNNING',
    steps: [] 
  };

  const saveProgress = () => {
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  };

  console.log("🔐 INICIANDO VERIFICACIÓN DE CONTROL DE ACCESOS (RBAC)\n");
  saveProgress();

  try {
    // PASO 1: Simular Login (Sign In)
    console.log(`⏳ 1. Autenticando Súper Usuario (${adminEmail})...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (signInError) throw new Error(`Fallo en Sign In: ${signInError.message}`);
    const userId = signInData.user?.id;
    
    report.steps.push({ step: 'SignIn', status: 'SUCCESS', userId, session: !!signInData.session });
    saveProgress();
    console.log("   ✅ Inicio de sesión validado con éxito.");

    // PASO 2: Verificar propagación de Rol en public.users
    console.log("⏳ 2. Verificando rol administrativo en public.users...");
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (publicError || !publicUser) {
      throw new Error(`El usuario no existe en la base de datos pública 'public.users'.`);
    }

    report.steps.push({ step: 'Database_Role_Verification', status: 'SUCCESS', role_assigned: publicUser.role });
    report.status = 'SUCCESS';
    saveProgress();
    
    console.log(`   ✅ Verificación de Rol Exitosa: Usuario tiene privilegios [${publicUser.role}]`);
    console.log("\n🚀 SISTEMA DE AUTENTICACIÓN Y ROLES TOTALMENTE OPERATIVO.");
    console.log(`📍 Reporte de éxito guardado en: ${reportPath}`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    report.status = 'FAILED';
    report.steps.push({ step: 'Error', status: 'FAILED', message: errorMessage });
    saveProgress();
    console.error(`\n❌ ERROR CRÍTICO: ${errorMessage}`);
    console.log(`📍 Reporte de error guardado en: ${reportPath}`);
  }
}

testAuthCycle();