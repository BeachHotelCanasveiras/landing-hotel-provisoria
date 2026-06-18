/**
 * @file StaffManagement.tsx
 * @description Panel administrativo de alta fidelidad para el registro de personal del hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y transiciones animadas.
 * - Trinidad Atómica: Localización total del texto institucional de control (RBAC).
 * - Saneamiento: Se corrige el error TS2304 importando explícitamente el helper "cn".
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Key, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // 🚀 Saneamiento TS2304: Importación agregada

export const StaffManagement: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje
  usePerformanceProfiler('StaffManagement');

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'housekeeper' | 'receptionist' | 'admin'>('housekeeper');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado para desplegar credenciales generadas
  const [credentials, setCredentials] = useState<{ email: string; tempPass: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    setCredentials(null);

    try {
      // Obtener la sesión activa para inyectar el token JWT
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión de administrador no encontrada.');

      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ username, fullName, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar alta');
      }

      setCredentials({
        email: data.email,
        tempPass: data.tempPassword
      });

      toast.success('¡Funcionario registrado con éxito!');
      setUsername('');
      setFullName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!credentials) return;
    const text = `*Credenciales de Acceso - Hotel Beach*\n📧 *Usuario:* ${credentials.email}\n🔑 *Contraseña Temporal:* ${credentials.tempPass}\n\n_Recuerda cambiar tu contraseña al ingresar al sistema por seguridad._`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado para enviar por WhatsApp');
    setTimeout(() => setCopied(false), 2000);
  };

  // CORRECCIÓN (no-explicit-any): Tipado contractual estricto del array de renderizado
  const rolesList: { role: 'housekeeper' | 'receptionist' | 'admin'; label: string }[] = [
    { role: 'housekeeper', label: 'Limpieza' },
    { role: 'receptionist', label: 'Recepción' },
    { role: 'admin', label: 'Administrador' }
  ];

  return (
    <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 max-w-xl transition-colors duration-300">
      
      <div>
        <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
          Control de Personal (RBAC)
        </span>
        <h3 className="font-display text-2xl text-pms-text tracking-tight flex items-center gap-2">
          Registrar Funcionario
          <Shield className="w-5 h-5 text-pms-accent" strokeWidth={1.5} />
        </h3>
        <p className="font-body text-xs text-pms-text-muted font-light mt-1">
          Da de alta nuevos auxiliares de limpieza, recepcionistas o administradores de forma segura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre Completo */}
        <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
          <label className="block text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Nombre Completo</label>
          <input 
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre y Apellido"
            disabled={loading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-pms-text placeholder:text-pms-text-muted outline-none"
          />
        </div>

        {/* Nombre de Usuario */}
        <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
          <label className="block text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-wider mb-1">Nombre de Usuario (Opcional: Email completo)</label>
          <input 
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="b.martinez (Se autogenerará @beachcanasvieiras.com)"
            disabled={loading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-pms-text placeholder:text-pms-text-muted outline-none"
          />
        </div>

        {/* Selector de Rol */}
        <div className="p-4 rounded-3xl border border-pms-border bg-pms-surface-high">
          <label className="block text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-3">Asignar Cargo / Rol</label>
          <div className="grid grid-cols-3 gap-2">
            {rolesList.map((item) => {
              const IsActiveRole = role === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setRole(item.role)}
                  disabled={loading}
                  className={cn(
                    "h-11 rounded-xl border font-body text-xs font-semibold transition-all cursor-pointer bg-transparent",
                    IsActiveRole 
                      ? "bg-pms-accent text-pms-accent-foreground border-pms-accent shadow-md" 
                      : "bg-pms-surface text-pms-text-muted border-pms-border hover:border-pms-accent/40"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-pms-accent text-pms-accent-foreground hover:opacity-90 rounded-full text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] border-none"
        >
          {loading ? <Spinner className="w-5 h-5 text-pms-accent-foreground" /> : <><UserPlus size={16} /> Registrar Funcionario</>}
        </Button>
      </form>

      {/* ⚡ TARJETA DE CREDENCIALES TEMPORALES GENERADAS */}
      <AnimatePresence>
        {credentials && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-pms-accent/10 border border-pms-accent/20 rounded-3xl space-y-4"
          >
            <div className="flex items-center gap-2 text-pms-text">
              <Key size={16} className="text-pms-accent animate-pulse" />
              <p className="font-display text-base font-bold">Credenciales Generadas</p>
            </div>
            
            <div className="space-y-2 text-xs font-body text-pms-text-muted">
              <div className="flex justify-between border-b border-pms-border pb-2">
                <span className="font-bold">Usuario (Email):</span>
                <span className="font-mono bg-pms-surface-high px-2 py-0.5 rounded border border-pms-border text-pms-text">{credentials.email}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-bold">Contraseña Temporal:</span>
                <span className="font-mono bg-pms-surface-high px-2 py-0.5 rounded border border-pms-border font-bold text-pms-accent">{credentials.tempPass}</span>
              </div>
            </div>

            <Button
              onClick={copyToClipboard}
              className="w-full h-12 bg-pms-accent text-pms-accent-foreground hover:opacity-90 rounded-xl text-xs font-body font-semibold flex items-center justify-center gap-2 border-none"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '¡Copiado!' : 'Copiar Credenciales para WhatsApp'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};