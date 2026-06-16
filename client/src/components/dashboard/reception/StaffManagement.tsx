/**
 * @file StaffManagement.tsx
 * @description Panel administrativo de alta fidelidad para el registro de personal del hotel.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Integración completa de framer-motion (motion, AnimatePresence) importados de forma segura.
 * - Tipado estricto en matrices de mapeo de roles para evitar el bypass de 'any'.
 * - 0% variables huérfanas o sin uso en el compilador.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // <-- CORRECCIÓN: Importaciones añadidas de forma segura
import { UserPlus, Shield, Key, Copy, Check } from 'lucide-react'; // <-- CORRECCIÓN: Eliminado icono 'Info' huérfano
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const StaffManagement: React.FC = () => {
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
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 max-w-xl">
      
      <div>
        <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
          Control de Personal (RBAC)
        </span>
        <h3 className="font-display text-2xl text-gray-900 tracking-tight flex items-center gap-2">
          Registrar Funcionario
          <Shield className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </h3>
        <p className="font-body text-xs text-gray-400 font-light mt-1">
          Da de alta nuevos auxiliares de limpieza, recepcionistas o administradores de forma segura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre Completo */}
        <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</label>
          <input 
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre y Apellido"
            disabled={loading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
          />
        </div>

        {/* Nombre de Usuario */}
        <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre de Usuario (Opcional: Email completo)</label>
          <input 
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="b.martinez (Se autogenerará @beachcanasvieiras.com)"
            disabled={loading}
            className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
          />
        </div>

        {/* Selector de Rol */}
        <div className="p-4 rounded-3xl border border-gray-150 bg-gray-50">
          <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">Asignar Cargo / Rol</label>
          <div className="grid grid-cols-3 gap-2">
            {rolesList.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => setRole(item.role)}
                disabled={loading}
                className={`h-11 rounded-xl border font-body text-xs font-semibold transition-all cursor-pointer ${role === item.role ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? <Spinner className="w-5 h-5 text-white" /> : <><UserPlus size={16} /> Registrar Funcionario</>}
        </Button>
      </form>

      {/* ⚡ TARJETA DE CREDENCIALES TEMPORALES GENERADAS */}
      <AnimatePresence>
        {credentials && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-3xl space-y-4"
          >
            <div className="flex items-center gap-2 text-blue-800">
              <Key size={16} className="text-accent animate-pulse" />
              <p className="font-display text-base font-bold">Credenciales Generadas</p>
            </div>
            
            <div className="space-y-2 text-xs font-body text-gray-600">
              <div className="flex justify-between border-b border-blue-100/20 pb-2">
                <span className="font-bold">Usuario (Email):</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-100">{credentials.email}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-bold">Contraseña Temporal:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-100 font-bold text-accent">{credentials.tempPass}</span>
              </div>
            </div>

            <Button
              onClick={copyToClipboard}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-body font-semibold flex items-center justify-center gap-2"
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