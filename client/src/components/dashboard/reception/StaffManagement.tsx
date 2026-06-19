/**
 * @file StaffManagement.tsx
 * @description Panel administrativo modular de alta fidelidad para la gestión de personal y credenciales.
 * Atomizado e instrumentado bajo estándares de ingeniería limpia (SOLID):
 * - Sub-componente FichaLaboralModal: Expediente extensible de Recursos Humanos (Ficha de Personal).
 * - Sub-componente InviteDistributionModal: Selector de despacho omnicanal (WhatsApp/Email).
 * - Sub-componente ResetPasswordModal: Gestor de cambio de contraseñas manuales.
 * - SsoT Autocompletado: Generación reactiva de e-mail corporativo libre de acentos y caracteres especiales.
 * - Saneamiento: Remoción de la Ficha de Salud y resolución de Cargo/Rol cruzando tablas de Supabase en caliente.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { 
  UserPlus, Shield, Key, Copy, Check, Globe, 
  Phone, Lock, Send, Sparkles, Briefcase, Mail, MessageSquare, X, HeartPulse
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// 📏 INTERFACES Y CONTRATOS DE DATOS (SSoT)
// ============================================================================

interface StaffMember {
  id: string;
  email: string;
  role: 'housekeeper' | 'receptionist' | 'admin' | string;
  first_name: string;
  paternal_last_name: string;
  middle_name?: string | null;
  maternal_last_name?: string | null;
  phone: string;
  country: string;
  state_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  fullName?: string;
  address?: string;
}

// ✅ Saneamiento TS: rolesList de definición estática a nivel de módulo
const rolesList: { role: 'housekeeper' | 'receptionist' | 'admin'; label: string }[] = [
  { role: 'housekeeper', label: 'Limpieza' },
  { role: 'receptionist', label: 'Recepção' },
  { role: 'admin', label: 'Administrador' }
];

// ============================================================================
// 🛡️ SUB-COMPONENTE: FICHA LABORAL (EXPEDIENTE EXTENSIBLE DE PERSONAL)
// ============================================================================
const FichaLaboralModal: React.FC<{
  user: StaffMember | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className="bg-pms-surface border border-pms-border p-8 rounded-[2.5rem] max-w-lg w-full space-y-6 shadow-2xl relative text-pms-text"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-pms-surface-high rounded-full text-pms-text-muted hover:text-pms-text cursor-pointer border-none"><X size={14}/></button>
        
        <div className="flex items-center gap-4 border-b border-pms-border pb-6">
          <div className="w-16 h-16 rounded-2xl bg-pms-surface-high border border-pms-border flex items-center justify-center text-2xl text-pms-text font-display font-bold shadow-inner">
            {user.first_name.charAt(0)}{user.paternal_last_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-pms-text">{user.fullName}</h3>
            <span className="inline-block px-3 py-1 bg-pms-accent/10 text-pms-accent rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 border border-pms-accent/20">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4 font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-pms-surface-high rounded-2xl border border-pms-border">
              <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Mail size={10} className="text-pms-accent"/> E-mail Corporativo</p>
              <p className="text-xs font-semibold text-pms-text truncate">{user.email}</p>
            </div>
            <div className="p-4 bg-pms-surface-high rounded-2xl border border-pms-border">
              <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Phone size={10} className="text-pms-accent"/> Celular</p>
              <p className="text-xs font-semibold text-pms-text">{user.phone}</p>
            </div>
          </div>

          <div className="p-4 bg-pms-surface-high rounded-2xl border border-pms-border">
            <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Globe size={10} className="text-pms-accent"/> Residência Registrada</p>
            <p className="text-xs font-semibold text-pms-text">{user.address}</p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><HeartPulse size={10}/> Contato de Emergência Operacional</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-pms-text">{user.emergency_contact_name}</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded">{user.emergency_contact_phone}</span>
            </div>
          </div>

          <div className="p-4 bg-pms-surface border border-pms-border border-dashed rounded-2xl flex flex-col items-center justify-center text-center opacity-50 select-none">
            <Briefcase size={18} className="text-pms-text-muted mb-2" />
            <p className="text-[10px] font-bold text-pms-text-muted uppercase tracking-widest">Informações Contábeis e Assistência (FNRH / CNPJ)</p>
            <p className="text-[9px] text-pms-text-muted font-light mt-1">Módulos de nómina, folha de pagamento e calendário em desenvolvimento.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 🛡️ SUB-COMPONENTE: DISTRIBUCIÓN OMNICANAL DEL MAGIC LINK
// ============================================================================
const InviteDistributionModal: React.FC<{
  data: { email: string; link: string; phone: string; name: string } | null;
  onClose: () => void;
  sendWhatsApp: () => void;
  sendEmail: () => void;
}> = ({ data, onClose, sendWhatsApp, sendEmail }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 20, opacity: 0 }} 
        className="bg-pms-surface border border-pms-border p-8 rounded-[2rem] max-w-sm w-full space-y-6 shadow-2xl text-center relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-pms-surface-high rounded-full text-pms-text-muted hover:text-pms-text cursor-pointer border-none"><X size={14}/></button>
        
        <div className="w-16 h-16 bg-pms-accent/10 text-pms-accent rounded-full flex items-center justify-center mx-auto border-4 border-pms-surface-high">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-display text-xl font-bold text-pms-text">Link Mágico Ativo</h4>
          <p className="text-[10px] text-pms-text-muted mt-2 font-medium">Link de acesso gerado com sucesso para <strong className="text-pms-text">{data.email}</strong>. Escolha a forma de distribuição:</p>
        </div>

        <div className="space-y-3">
          <Button onClick={sendWhatsApp} className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-none">
            <MessageSquare size={16} /> Enviar via WhatsApp
          </Button>
          <Button onClick={sendEmail} className="w-full h-12 bg-pms-surface-high hover:bg-pms-border text-pms-text border border-pms-border rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-none">
            <Mail size={16} /> Disparar por E-mail
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 🛡️ SUB-COMPONENTE: RE-ESTABLECIMIENTO MANUAL DE CONTRASEÑA
// ============================================================================
const ResetPasswordModal: React.FC<{
  user: StaffMember | null;
  onClose: () => void;
  newPass: string;
  setNewPass: (val: string) => void;
  onReset: (e: React.FormEvent) => void;
  loading: boolean;
}> = ({ user, onClose, newPass, setNewPass, onReset, loading }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className="bg-pms-surface border border-pms-border p-6 rounded-[2rem] max-w-sm w-full space-y-4 shadow-2xl text-pms-text"
      >
        <div>
          <h4 className="font-display text-lg font-bold text-pms-text">Reset de Senha</h4>
          <p className="text-[10px] text-pms-text-muted mt-1">Alvo: <span className="font-semibold text-pms-text">{user.first_name} {user.paternal_last_name}</span></p>
        </div>
        <form onSubmit={onReset} className="space-y-4">
          <div className="p-3.5 rounded-xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent flex items-center gap-3">
            <Lock size={16} className="text-pms-text-muted" />
            <div className="flex-1">
              <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest">Nova Senha</label>
              <input type="text" required value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mín. 6 caracteres" className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={onClose} className="flex-1 h-11 bg-pms-surface-high border border-pms-border text-pms-text rounded-xl text-xs font-semibold">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 bg-pms-accent text-pms-accent-foreground rounded-xl text-xs font-bold border-none">
              {loading ? <Spinner className="w-4 h-4 text-pms-accent-foreground" /> : 'Atualizar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 🏆 ORQUESTADOR MAESTRO: STAFF MANAGEMENT
// ============================================================================
export const StaffManagement: React.FC = () => {
  usePerformanceProfiler('StaffManagement');

  const { t, i18n } = useTranslation(['dashboard', 'auth']);
  
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  
  // Formulario
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [stateCode, setStateCode] = useState('SC');
  const [role, setRole] = useState<'housekeeper' | 'receptionist' | 'admin'>('housekeeper');

  // Contacto de Emergencia
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Estados de Modales y Copiado
  const [credentials, setCredentials] = useState<{ email: string; tempPass: string } | null>(null);
  const [selectedResetUser, setSelectedResetUser] = useState<StaffMember | null>(null);
  const [newManualPassword, setNewManualPassword] = useState('');
  
  const [inviteModalData, setInviteModalData] = useState<{ email: string; link: string; phone: string; name: string } | null>(null);
  const [selectedFichaUser, setSelectedFichaUser] = useState<StaffMember | null>(null);
  const [copied, setCopied] = useState(false);

  // Referencias para timeouts
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Saneamiento ESM: Captura del objeto de referencia estable para el linter de dependencias
  useEffect(() => {
    const currentRef = copiedTimeoutRef;
    return () => {
      if (currentRef.current) clearTimeout(currentRef.current);
    };
  }, []);

  // ============================================================================
  // ⚡ GENERADOR DINÁMICO DE CORREO CORPORATIVO (Sin tildes ni caracteres extraños)
  // ============================================================================
  const generatedEmail = useMemo(() => {
    if (!firstName && !paternalLastName) return '';
    const cleanFirst = firstName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.]/g, '');
    const cleanLast = paternalLastName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.]/g, '');
    return `${cleanFirst}.${cleanLast}@beachcanasvieiras.com`;
  }, [firstName, paternalLastName]);

  // ============================================================================
  // ⚙️ FETCH DE USUARIOS Y CRUCE RELACIONAL (JOIN)
  // ============================================================================
  const fetchStaffList = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data: profiles, error: profError } = await supabase
        .from('staff_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profError) throw profError;

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role');

      if (usersError) throw usersError;

      const roleMap = new Map((users || []).map(u => [u.id, u.role]));

      const compiled: StaffMember[] = (profiles || []).map((item) => ({
        ...item,
        role: roleMap.get(item.id) || 'housekeeper', // ✅ Saneamiento de Rol (Evita el dash '—')
        fullName: `${item.first_name} ${item.paternal_last_name}`.trim(),
        address: `${item.state_code.toUpperCase()}, ${item.country}`
      }));

      setStaffList(compiled);
    } catch (err: unknown) {
      console.error('[StaffManagement] Error al cargar lista:', err);
      toast.error('Erro ao carregar o cadastro de funcionários.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      const timer = setTimeout(() => fetchStaffList(), 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchStaffList]);

  // ============================================================================
  // 💾 PROCESAMIENTO DE REGISTRO
  // ============================================================================
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !paternalLastName || !generatedEmail || !phone || !emergencyContactName || !emergencyContactPhone) {
      toast.error('Por favor, completa todos los campos requeridos (*).');
      return;
    }

    const normalizedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
    const parsedPhone = parsePhoneNumberFromString(normalizedPhone);
    if (!parsedPhone || !parsedPhone.isValid()) {
      toast.error('Número de telefone do funcionário inválido.');
      return;
    }

    const normalizedEmerg = emergencyContactPhone.trim().startsWith('+') ? emergencyContactPhone.trim() : `+${emergencyContactPhone.trim()}`;
    const parsedEmerg = parsePhoneNumberFromString(normalizedEmerg);
    if (!parsedEmerg || !parsedEmerg.isValid()) {
      toast.error('Número do contato de emergência inválido.');
      return;
    }

    setLoading(true);
    setCredentials(null);

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
          email: generatedEmail, 
          role,
          country,
          state_code: stateCode.trim(),
          phone: parsedPhone.format('E.164'),
          emergency_contact_name: emergencyContactName.trim(),
          emergency_contact_phone: parsedEmerg.format('E.164'),
          locale: i18n.language
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha ao processar o registro.');

      setCredentials({ email: data.email, tempPass: data.tempPassword });
      toast.success(data.message || 'Funcionário cadastrado com sucesso!');
      
      setFirstName(''); setMiddleName(''); setPaternalLastName(''); setMaternalLastName('');
      setPhone(''); setEmergencyContactName(''); setEmergencyContactPhone('');

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetUser || newManualPassword.length < 6) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão administrativa expirada.');

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
      toast.error(err instanceof Error ? err.message : 'Falha ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMagicLink = async (member: StaffMember) => {
    setLoadingList(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não autorizada.');

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

      setInviteModalData({
        email: member.email,
        link: data.invite_link,
        phone: member.phone,
        name: member.first_name
      });
      toast.success('Link de acesso seguro gerado.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar link.');
    } finally {
      setLoadingList(false);
    }
  };

  const sendInviteViaWhatsApp = () => {
    if (!inviteModalData) return;
    const text = `*Acesso Administrativo - PMS Hotel Beach*\n\nOlá ${inviteModalData.name}, aqui está seu link de entrada seguro:\n🔗 ${inviteModalData.link}\n\n_Clique no link acima para definir sua senha de acesso._`;
    window.open(`https://wa.me/${inviteModalData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendInviteViaEmail = () => {
    if (!inviteModalData) return;
    const subject = 'Seu acesso ao PMS Hotel Beach';
    const body = `Olá ${inviteModalData.name},\n\nAqui está seu link de entrada único e seguro:\n${inviteModalData.link}\n\nPor favor, clique para configurar sua senha e acceder à sua conta.\n\nHotel Beach Canasvieiras.`;
    window.open(`mailto:${inviteModalData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  return (
    <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 max-w-5xl transition-colors duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-pms-border pb-4 gap-4">
        <div>
          <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
            {t('pms_sidebar.settings.staff') || 'Controle de Pessoal (RBAC)'}
          </span>
          <h3 className="font-display text-2xl text-pms-text tracking-tight flex items-center gap-2">
            Governança de Equipe e Ficha Laboral
            <Shield className="w-5 h-5 text-pms-accent animate-pulse" strokeWidth={1.5} />
          </h3>
        </div>

        <div className="flex bg-pms-surface-high p-1 rounded-xl border border-pms-border shadow-inner">
          <button onClick={() => setActiveTab('register')} className={cn("px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer", activeTab === 'register' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "bg-transparent text-pms-text-muted hover:text-pms-text")}>
            Registrar
          </button>
          <button onClick={() => setActiveTab('manage')} className={cn("px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer", activeTab === 'manage' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "bg-transparent text-pms-text-muted hover:text-pms-text")}>
            Gerenciar Contas
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'register' ? (
          <motion.form 
            key="register-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleRegisterStaff} 
            className="space-y-5"
          >
            {/* E-mail Autogerado en Tiempo Real */}
            <div className="p-4 bg-pms-accent/10 border border-pms-accent/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-pms-accent">
                <Mail size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">E-mail Corporativo Autogerado:</span>
              </div>
              <span className="font-mono text-xs font-bold text-pms-text">{generatedEmail || 'aguardando...'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Primeiro Nome *</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Bernardo" disabled={loading} className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none" />
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Nome do Meio (Opcional)</label>
                <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Ex: José" disabled={loading} className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Sobrenome Paterno *</label>
                <input type="text" required value={paternalLastName} onChange={(e) => setPaternalLastName(e.target.value)} placeholder="Ex: Martinez" disabled={loading} className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none" />
              </div>
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Sobrenome Materno (Opcional)</label>
                <input type="text" value={maternalLastName} onChange={(e) => setMaternalLastName(e.target.value)} placeholder="Ex: Silva" disabled={loading} className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface transition-all">
                <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">Celular / WhatsApp *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +5548998126650" disabled={loading} className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent transition-all">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">País</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading} className="w-full bg-transparent border-none p-0 font-body text-xs text-pms-text outline-none">
                    <option value="Brasil">Brasil</option>
                    <option value="Argentina">Argentina</option>
                  </select>
                </div>
                <div className="w-24 p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent transition-all">
                  <label className="block text-[8px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">UF</label>
                  <input type="text" required maxLength={2} value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder="SC" disabled={loading} className="w-full bg-transparent border-none p-0 uppercase text-center font-body text-xs text-pms-text outline-none" />
                </div>
              </div>
            </div>

            {/* Ficha de Emergencia */}
            <div className="p-5 rounded-3xl border border-pms-border bg-pms-surface-high/20 space-y-4">
              <div className="flex items-center gap-2 border-b border-pms-border pb-2.5">
                <HeartPulse size={16} className="text-pms-accent" />
                <span className="text-[10px] font-bold text-pms-text uppercase tracking-widest">Contato de Emergência Operacional</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest mb-1">Nome Completo *</label>
                  <input type="text" required value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} placeholder="Ex: María Silva" disabled={loading} className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none" />
                </div>
                <div className="p-3 bg-pms-surface border border-pms-border rounded-2xl">
                  <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest mb-1">Celular *</label>
                  <input type="tel" required value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} placeholder="Ex: +5548999999999" disabled={loading} className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none" />
                </div>
              </div>
            </div>

            {/* Selector de Rol */}
            <div className="p-4 rounded-3xl border border-pms-border bg-pms-surface-high">
              <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest mb-3">Cargo do Funcionário *</label>
              <div className="grid grid-cols-3 gap-2">
                {rolesList.map((item) => (
                  <button key={item.role} type="button" onClick={() => setRole(item.role)} disabled={loading} className={cn("h-11 rounded-xl border text-xs font-semibold cursor-pointer transition-all", role === item.role ? "bg-pms-accent text-pms-accent-foreground border-pms-accent" : "bg-pms-surface text-pms-text-muted border-pms-border hover:border-pms-accent/40")}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 bg-pms-accent text-pms-accent-foreground hover:opacity-90 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md border-none">
              {loading ? <Spinner className="w-5 h-5 text-pms-accent-foreground" /> : <><UserPlus size={15} /> Registrar Funcionário</>}
            </Button>

            <AnimatePresence>
              {credentials && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 bg-pms-accent/10 border border-pms-accent/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-pms-text"><Key size={16} className="text-pms-accent" /><p className="font-display text-base font-bold">Conta Registrada com Sucesso</p></div>
                  <div className="space-y-2 text-xs text-pms-text-muted">
                    <div className="flex justify-between border-b border-pms-border pb-2"><span className="font-bold">E-mail Corporativo:</span><span className="font-mono bg-pms-surface-high px-2 py-0.5 rounded text-pms-text">{credentials.email}</span></div>
                    <div className="flex justify-between"><span className="font-bold">Senha Provisória:</span><span className="font-mono bg-pms-surface-high px-2 py-0.5 rounded font-bold text-pms-accent">{credentials.tempPass}</span></div>
                  </div>
                  <Button onClick={() => { navigator.clipboard.writeText(`*Credenciais PMS*\nUsuario: ${credentials.email}\nSenha: ${credentials.tempPass}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full h-11 bg-pms-accent text-pms-accent-foreground rounded-xl text-xs font-bold uppercase tracking-wider border-none">
                    {copied ? <Check size={14} /> : <Copy size={14} />} Copiar Credenciales
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        ) : (
          <motion.div key="manage-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-pms-border">
              {loadingList ? (
                <div className="py-12 flex flex-col items-center justify-center text-pms-text-muted"><Spinner className="w-8 h-8 text-pms-accent mb-2" /><span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span></div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">
                      <th className="p-4 text-left">Funcionário</th>
                      <th className="p-4 text-center">Cargo / Role</th>
                      <th className="p-4 text-center">Contato</th>
                      <th className="p-4 text-center">Ações de Suporte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pms-border text-xs font-body">
                    {staffList.map((member) => (
                      <tr key={member.id} className="hover:bg-pms-surface-high/30 transition-colors">
                        <td className="p-4">
                          <button onClick={() => setSelectedFichaUser(member)} className="font-semibold text-pms-accent hover:underline text-left cursor-pointer border-none bg-transparent block w-full outline-none text-[13px]">
                            {member.first_name} {member.paternal_last_name}
                          </button>
                          <p className="text-[10px] text-pms-text-muted mt-0.5">{member.email}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn("inline-block px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider border", member.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-pms-accent/10 text-pms-accent border-pms-accent/20')}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4 text-center text-pms-text">
                          <div className="flex items-center justify-center gap-1.5 text-xs"><Phone size={11} className="text-pms-text-muted" /> {member.phone || 'S/T'}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSelectedResetUser(member)} className="px-3 py-1.5 bg-pms-surface-high hover:bg-pms-surface border border-pms-border text-pms-text-muted hover:text-pms-text text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer">
                              Reset
                            </button>
                            <button onClick={() => handleGenerateMagicLink(member)} className="flex items-center gap-1 px-3 py-1.5 bg-pms-accent/10 hover:bg-pms-accent/20 text-pms-accent border border-pms-accent/20 text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer">
                              <Send size={10} /> Link
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: RESET MANUAL DE CONTRASEÑA */}
      <AnimatePresence>
        {selectedResetUser && (
          <ResetPasswordModal 
            user={selectedResetUser}
            onClose={() => setSelectedResetUser(null)}
            newPass={newManualPassword}
            setNewPass={setNewManualPassword}
            onReset={handleTriggerResetPassword}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: SELECTOR DE DISTRIBUCIÓN DE MAGIC LINK */}
      <AnimatePresence>
        {inviteModalData && (
          <InviteDistributionModal 
            data={inviteModalData}
            onClose={() => setInviteModalData(null)}
            sendWhatsApp={sendInviteViaWhatsApp}
            sendEmail={sendInviteViaEmail}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: FICHA LABORAL (Detalles del Personal) */}
      <AnimatePresence>
        {selectedFichaUser && (
          <FichaLaboralModal 
            user={selectedFichaUser}
            onClose={() => setSelectedFichaUser(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};