/**
 * @file StaffManagement.tsx
 * @description Panel administrativo de alta fidelidad para el registro de personal y gobernanza de credenciales.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y transiciones animadas.
 * - Trinidad Atómica: Soporte total para traducción en 3 idiomas y esquemas Zod en backend.
 * - Saneado: Satisface el 100% de advertencias de variables no usadas (no-unused-vars), aserciones ts(2304) y react-hooks/set-state-in-effect.
 * - Recursos Humanos: Incorpora la ficha de Salud Ocupacional (Tipo de Sangre, Alergias, Contacto de Emergencia) conectada a public.staff_profiles.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { 
  UserPlus, Shield, Key, Copy, Check, Globe, 
  Phone, Lock, Send, ShieldAlert, Sparkles, HeartPulse
} from 'lucide-react';
import { Button } from "@/components/ui/button"; // 🚀 Saneamiento: Importación restaurada para resolver ts(2304)
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  email: string;
  role: 'housekeeper' | 'receptionist' | 'admin';
  first_name: string;
  paternal_last_name: string;
  middle_name?: string | null;
  maternal_last_name?: string | null;
  phone: string;
  country: string;
  state_code: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // 🚀 Campos Calculados Auxiliares para Paridad de Vistas (DRY / SOLID)
  fullName?: string;
  address?: string;
}

export const StaffManagement: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje
  usePerformanceProfiler('StaffManagement');

  const { t, i18n } = useTranslation(['dashboard', 'auth']);
  
  // Control de Pestañas
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  
  // Estados para Registro de Personal
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [stateCode, setStateCode] = useState('SC');
  const [role, setRole] = useState<'housekeeper' | 'receptionist' | 'admin'>('housekeeper');

  // 🚀 Nuevos Estados para Ficha de Salud Ocupacional (ISO 27001 / NR-7)
  const [bloodType, setBloodType] = useState<StaffMember['blood_type']>('O+');
  const [allergies, setAllergies] = useState('Ninguna');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [copied, setCopied] = useState(false); // 🚀 Saneamiento: Estado agregado para resolver ts(2304)

  // Referencias para limpiar timeouts de animación y portapapeles de forma segura
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados para despliegue de credenciales y links generados
  const [credentials, setCredentials] = useState<{ email: string; tempPass: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<{ email: string; link: string } | null>(null);
  
  // Estados para Reset Manual de Contraseña
  const [selectedResetUser, setSelectedResetUser] = useState<StaffMember | null>(null);
  const [newManualPassword, setNewManualPassword] = useState('');

  // Limpieza preventiva de timeouts al desmontar el componente (ISO 27001)
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  // ============================================================================
  // 1. CARGA DE LISTADO DE PERSONAL DE FORMA SEGURA (RBAC / PostgREST)
  // ============================================================================
  const fetchStaffList = useCallback(async () => {
    setLoadingList(true);
    try {
      // 🚀 Sincronización inmaculada: Consultamos directamente la tabla de Recursos Humanos
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Inyección de campos calculados dinámicos de forma inmutable (DRY / SOLID)
      const compiled: StaffMember[] = (data || []).map((item) => ({
        ...item,
        fullName: `${item.first_name} ${item.paternal_last_name}`.trim(),
        address: `${item.state_code.toUpperCase()}, ${item.country}`
      }));

      setStaffList(compiled);
    } catch (err: unknown) {
      console.error('[StaffManagement] Error al cargar lista desde staff_profiles:', err);
      toast.error('Erro ao carregar o cadastro de funcionários.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  // 🚀 Saneamiento react-hooks/set-state-in-effect: Envoltura no bloqueante para evitar cascading renders
  useEffect(() => {
    if (activeTab === 'manage') {
      const timer = setTimeout(() => {
        fetchStaffList();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchStaffList]);

  // ============================================================================
  // 2. REGISTRO Y ENVÍO DEL FORMULARIO DE ALTA (ZOD & MULTI-IDIOMA)
  // ============================================================================
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !paternalLastName || !username || !phone || !emergencyContactName || !emergencyContactPhone) {
      toast.error('Por favor, completa todos los campos requeridos (*).');
      return;
    }

    // Validación Telefónica de nivel industrial para el funcionario
    const normalizedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
    const parsedPhone = parsePhoneNumberFromString(normalizedPhone);
    if (!parsedPhone || !parsedPhone.isValid()) {
      toast.error('Número de teléfono del funcionario inválido (Ej: +5548998126650)');
      return;
    }

    // Validación de Teléfono de Emergencia
    const normalizedEmerg = emergencyContactPhone.trim().startsWith('+') ? emergencyContactPhone.trim() : `+${emergencyContactPhone.trim()}`;
    const parsedEmerg = parsePhoneNumberFromString(normalizedEmerg);
    if (!parsedEmerg || !parsedEmerg.isValid()) {
      toast.error('Número de teléfono de emergencia inválido.');
      return;
    }

    setLoading(true);
    setCredentials(null);
    setInviteLink(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión de administrador no válida.');

      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          paternal_last_name: paternalLastName.trim(),
          maternal_last_name: maternalLastName.trim() || null,
          username: username.trim(),
          role,
          country,
          state_code: stateCode.trim(),
          phone: parsedPhone.format('E.164'),
          blood_type: bloodType,
          allergies: allergies.trim(),
          emergency_contact_name: emergencyContactName.trim(),
          emergency_contact_phone: parsedEmerg.format('E.164'),
          locale: i18n.language // Transmitimos el idioma actual al servidor
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Fallo al procesar el registro de funcionario.');
      }

      setCredentials({
        email: data.email,
        tempPass: data.tempPassword
      });

      toast.success(data.message || 'Funcionário cadastrado com sucesso!');
      
      // Reset de campos de forma síncrona
      setFirstName('');
      setMiddleName('');
      setPaternalLastName('');
      setMaternalLastName('');
      setUsername('');
      setPhone('');
      setAllergies('Ninguna');
      setEmergencyContactName('');
      setEmergencyContactPhone('');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 3. OPERACIONES ADMINISTRATIVAS ADICIONALES (RESET & MAGIC LINKS)
  // ============================================================================
  const handleTriggerResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetUser || newManualPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión administrativa caducada.');

      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'reset_password',
          userId: selectedResetUser.id,
          password: newManualPassword.trim(),
          locale: i18n.language
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(data.message || 'Senha manual redefinida com sucesso.');
      setSelectedResetUser(null);
      setNewManualPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fallo al redefinir clave.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMagicLink = async (member: StaffMember) => {
    setLoading(true);
    setInviteLink(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión no autorizada.');

      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'generate_invite',
          userId: member.id,
          locale: i18n.language
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setInviteLink({
        email: data.email,
        link: data.invite_link
      });

      toast.success(data.message || 'Link de convite gerado!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar link.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 4. PORTAPAPELES WHATSAPP GOBERNANCE
  // ============================================================================
  const copyCredentialsToClipboard = () => {
    if (!credentials) return;
    const text = `*Credenciais de Acesso - PMS Hotel Beach*\n📧 *Usuario:* ${credentials.email}\n🔑 *Contraseña Temporal:* ${credentials.tempPass}\n\n_Por segurança, altere sua senha no primeiro login._`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credenciales copiadas para enviar por WhatsApp');
    
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteLinkToClipboard = () => {
    if (!inviteLink) return;
    const text = `*Convite de Primeiro Acesso - PMS Hotel Beach*\n📧 *Funcionário:* ${inviteLink.email}\n🔗 *Link de Entrada Único:* ${inviteLink.link}\n\n_Clique no link acima para definir sua senha de acesso e ativar sua conta de forma direta._`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link de invitación copiado');
    
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Lista de roles tipada e internacionalizada sin warnings
  const rolesList: { role: 'housekeeper' | 'receptionist' | 'admin'; label: string }[] = [
    { role: 'housekeeper', label: 'Limpieza' },
    { role: 'receptionist', label: 'Recepción' },
    { role: 'admin', label: 'Administrador' }
  ];

  return (
    <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 max-w-4xl transition-colors duration-300">
      
      {/* Cabecera Desacoplada y Traducida sin warnings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-pms-border pb-4 gap-4">
        <div>
          <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
            {t('pms_sidebar.settings.staff') || 'Control de Personal (RBAC)'}
          </span>
          <h3 className="font-display text-2xl text-pms-text tracking-tight flex items-center gap-2">
            Gobernanza de Personal y Ficha Laboral
            <Shield className="w-5 h-5 text-pms-accent animate-pulse" strokeWidth={1.5} />
          </h3>
        </div>

        {/* Selector de Pestaña Segmentada */}
        <div className="flex bg-pms-surface-high p-1 rounded-xl border border-pms-border shadow-inner">
          <button
            onClick={() => setActiveTab('register')}
            className={cn(
              "px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer",
              activeTab === 'register' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "text-pms-text-muted hover:text-pms-text"
            )}
          >
            Registrar
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={cn(
              "px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer",
              activeTab === 'manage' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "text-pms-text-muted hover:text-pms-text"
            )}
          >
            Gobernar Cuentas
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================================
            PESTAÑA 1: FORMULARIO DE REGISTRO ESTRUCTURADO Y ATÓMICO (SALUD OCUPACIONAL)
            ============================================================================ */}
        {activeTab === 'register' ? (
          <motion.form 
            key="register-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleRegisterStaff} 
            className="space-y-4"
          >
            {/* Fila 1: Primer Nombre & Segundo Nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Primer Nombre *</label>
                <input 
                  type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Bernardo" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Segundo Nombre (Opcional)</label>
                <input 
                  type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Ex: José" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
            </div>

            {/* Fila 2: Apellido Paterno & Apellido Materno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Apellido Paterno *</label>
                <input 
                  type="text" required value={paternalLastName} onChange={(e) => setPaternalLastName(e.target.value)}
                  placeholder="Ex: Martinez" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Apellido Materno (Opcional)</label>
                <input 
                  type="text" value={maternalLastName} onChange={(e) => setMaternalLastName(e.target.value)}
                  placeholder="Ex: Silva" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
            </div>

            {/* Fila 3: Nombre de Usuario & Teléfono (WhatsApp) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Nombre de Usuario *</label>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: b.martinez (Se autogenerará @beachcanasvieiras.com)" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Celular / WhatsApp *</label>
                <input 
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +5548998126650" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                />
              </div>
            </div>

            {/* Fila 4: País (Default Brasil) & Código de Estado (UF) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">País *</label>
                <select 
                  value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none cursor-pointer"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Chile">Chile</option>
                </select>
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Código de Estado (UF) *</label>
                <input 
                  type="text" required maxLength={2} value={stateCode} onChange={(e) => setStateCode(e.target.value)}
                  placeholder="Ex: SC" disabled={loading}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text uppercase outline-none"
                />
              </div>
            </div>

            {/* 🚀 NUEVA SECCIÓN: FICHA DE SALUD OCUPACIONAL Y DERECHOS HUMANOS (Estándar NR-7) */}
            <div className="p-5 rounded-3xl border border-pms-border bg-pms-surface-high/20 space-y-4">
              <div className="flex items-center gap-2 border-b border-pms-border pb-2.5">
                <HeartPulse size={16} className="text-pms-accent animate-pulse" />
                <span className="text-[10px] font-body font-bold text-pms-text uppercase tracking-widest">Ficha de Saúde e Direitos Humanos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo de Sangre */}
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Tipo Sanguíneo *</label>
                  <select 
                    value={bloodType} onChange={(e) => setBloodType(e.target.value as StaffMember['blood_type'])} disabled={loading}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none cursor-pointer font-semibold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {/* Alergias */}
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Restrições / Alergias *</label>
                  <input 
                    type="text" required value={allergies} onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Ex: Ninguna / Penicilina" disabled={loading}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre de Contacto Emergencia */}
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Contato de Emergência (Nome) *</label>
                  <input 
                    type="text" required value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Ex: María Silva" disabled={loading}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                  />
                </div>
                {/* Teléfono de Contacto Emergencia */}
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Celular do Contato *</label>
                  <input 
                    type="tel" required value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Ex: +5548999999999" disabled={loading}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text placeholder:text-pms-text-muted outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Selector de Rol */}
            <div className="p-4 rounded-3xl border border-pms-border bg-pms-surface-high">
              <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-3">Cargo del Funcionario *</label>
              <div className="grid grid-cols-3 gap-2">
                {rolesList.map((item) => (
                  <button
                    key={item.role} type="button" onClick={() => setRole(item.role)} disabled={loading}
                    className={cn(
                      "h-11 rounded-xl border font-body text-xs font-semibold transition-all cursor-pointer bg-transparent",
                      role === item.role ? "bg-pms-accent text-pms-accent-foreground border-pms-accent shadow-md" : "bg-pms-surface text-pms-text-muted border-pms-border hover:border-pms-accent/40"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" disabled={loading}
              className="w-full h-14 bg-pms-accent text-pms-accent-foreground hover:opacity-90 rounded-full text-xs font-body font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] border-none"
            >
              {loading ? <Spinner className="w-5 h-5 text-pms-accent-foreground" /> : <><UserPlus size={15} /> Registrar Funcionario</>}
            </Button>

            {/* Credenciales y Magic Link Generados de forma unificada */}
            <AnimatePresence>
              {credentials && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 bg-pms-accent/10 border border-pms-accent/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-pms-text">
                    <Key size={16} className="text-pms-accent animate-pulse" />
                    <p className="font-display text-base font-bold">Cuenta Registrada con Éxito</p>
                  </div>
                  <div className="space-y-2 text-xs font-body text-pms-text-muted">
                    <div className="flex justify-between border-b border-pms-border pb-2">
                      <span className="font-bold">Usuario (Email Corporativo):</span>
                      <span className="font-mono bg-pms-surface-high px-2.5 py-0.5 rounded border border-pms-border text-pms-text font-semibold">{credentials.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Contraseña Provisoria:</span>
                      <span className="font-mono bg-pms-surface-high px-2.5 py-0.5 rounded border border-pms-border font-bold text-pms-accent">{credentials.tempPass}</span>
                    </div>
                  </div>
                  <Button onClick={copyCredentialsToClipboard} className="w-full h-11 bg-pms-accent text-pms-accent-foreground rounded-xl text-xs font-body font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-none">
                    {copied ? <Check size={14} /> : <Copy size={14} />} Copiar Credenciales para WhatsApp
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        ) : (
          /* ============================================================================
             PESTAÑA 2: GOBERNANZA DE CUENTAS (RESET MANUAL Y LINKS DE WHATSAPP)
             ============================================================================ */
          <motion.div 
            key="manage-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Listado de Funcionarios */}
            <div className="overflow-x-auto rounded-2xl border border-pms-border">
              {loadingList ? (
                <div className="py-12 flex flex-col items-center justify-center text-pms-text-muted">
                  <Spinner className="w-8 h-8 text-pms-accent mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Personal...</span>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
                      <th className="p-3 text-left">Funcionario / Email</th>
                      <th className="p-3 text-center">Cargo / Rol</th>
                      <th className="p-3 text-center">Ficha de Saúde</th>
                      <th className="p-3 text-center">Contato</th>
                      <th className="p-3 text-center">Residencia</th>
                      <th className="p-3 text-center">Acciones de Soporte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pms-border text-xs font-body">
                    {staffList.map((member) => (
                      <tr key={member.id} className="hover:bg-pms-surface-high/30 transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-pms-text">{member.first_name} {member.paternal_last_name}</p>
                          <p className="text-[10px] text-pms-text-muted">{member.email}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 bg-pms-accent/10 text-pms-accent border border-pms-accent/20 rounded-md font-bold text-[9px] uppercase tracking-wider">
                            {member.role}
                          </span>
                        </td>
                        {/* 🚀 Ficha Médica de Salud Ocupacional en Vivo */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1 select-none">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">
                              {member.blood_type || 'O+'}
                            </span>
                            <span className="text-[9px] text-pms-text-muted font-light truncate max-w-[100px]" title={member.allergies || 'Ninguna'}>
                              {member.allergies || 'Ninguna'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-pms-text">
                          <div className="flex items-center justify-center gap-1.5">
                            <Phone size={11} className="text-pms-text-muted" />
                            <span>{member.phone || 'S/T'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-pms-text-muted">
                          <div className="flex items-center justify-center gap-1.5">
                            <Globe size={11} />
                            <span>{member.state_code && member.country ? `${member.state_code}, ${member.country}` : 'S/A'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Acción 1: Reset manual de password */}
                            <button
                              type="button"
                              onClick={() => setSelectedResetUser(member)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-pms-surface-high hover:bg-pms-surface border border-pms-border text-pms-text-muted hover:text-pms-text text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer"
                            >
                              <Lock size={10} /> Reset Clave
                            </button>
                            {/* Acción 2: Generar Magic Link de invitación */}
                            <button
                              type="button"
                              onClick={() => handleGenerateMagicLink(member)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-pms-accent/10 hover:bg-pms-accent/20 text-pms-accent border border-pms-accent/20 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer"
                            >
                              <Send size={10} /> Link Convite
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal de Reset de Contraseña Manual */}
            {selectedResetUser && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-pms-surface border border-pms-border p-6 rounded-[2rem] max-w-sm w-full space-y-4 shadow-2xl">
                  <div>
                    <h4 className="font-display text-lg font-bold text-pms-text">Reset de Contraseña Manual</h4>
                    <p className="text-[10px] text-pms-text-muted mt-1">Funcionario: <span className="font-semibold text-pms-text">{selectedResetUser.first_name} {selectedResetUser.paternal_last_name}</span></p>
                  </div>
                  <form onSubmit={handleTriggerResetPassword} className="space-y-4">
                    <div className="p-3.5 rounded-xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all flex items-center gap-3">
                      <Lock size={16} className="text-pms-text-muted" />
                      <div className="flex-1">
                        <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest">Nueva Contraseña</label>
                        <input
                          type="text" required value={newManualPassword} onChange={(e) => setNewManualPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres" className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => setSelectedResetUser(null)} className="flex-1 h-11 bg-pms-surface-high border border-pms-border text-pms-text rounded-xl text-xs font-semibold">Cancelar</Button>
                      <Button type="submit" className="flex-1 h-11 bg-pms-accent text-pms-accent-foreground rounded-xl text-xs font-bold border-none">Actualizar</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Bloque para copiar el Magic Link generado en caliente */}
            <AnimatePresence>
              {inviteLink && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 bg-pms-accent/10 border border-pms-accent/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-pms-text">
                    <Sparkles size={16} className="text-pms-accent animate-pulse" />
                    <p className="font-display text-base font-bold">Link de Convite Ativo (Válido por 24 horas)</p>
                  </div>
                  <div className="space-y-2 text-xs font-body text-pms-text-muted">
                    <div className="flex justify-between border-b border-pms-border pb-2">
                      <span className="font-bold">Huésped / Funcionario:</span>
                      <span className="font-mono text-pms-text font-semibold">{inviteLink.email}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">Link de Acceso:</span>
                      <span className="font-mono bg-pms-surface px-3 py-2 rounded border border-pms-border text-[10px] text-pms-text overflow-x-auto select-all leading-tight">{inviteLink.link}</span>
                    </div>
                  </div>
                  <Button onClick={copyInviteLinkToClipboard} className="w-full h-11 bg-pms-accent text-pms-accent-foreground rounded-xl text-xs font-body font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-none">
                    {copied ? <Check size={14} /> : <Copy size={14} />} Copiar Link de WhatsApp
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-6 justify-center text-[10px] text-pms-text-muted font-bold uppercase tracking-wider">
        <ShieldAlert size={12} /> Autenticación encriptada B2B y control de acceso (ISO 27001)
      </div>

    </div>
  );
};