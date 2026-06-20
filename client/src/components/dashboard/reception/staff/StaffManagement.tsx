/**
 * @file StaffManagement.tsx
 * @description Orquestador inteligente de estado (Smart Component) para la gobernanza de Recursos Humanos.
 * Coordinación y sincronización de las llamadas CRUD al servidor Vercel y Supabase.
 * - Despido en Cascada Seguro: Implementa baja automatizada de todas las dependencias.
 * - Doble Factor de Confirmación (Fix Regresión): Añadido modal que exige escribir el Nombre y Apellido Paterno del empleado.
 * - Sincronización de Ediciones: Controls la mutación de e-mails alternativos mapeando cambios en caliente.
 * - Telemetría: Registro pasivo del ciclo de vida de operaciones de personal.
 * - Saneamiento de Dependencias Circulares: Exportado nativo de 'StaffMember' rompiendo bucles de importación.
 * - Saneamiento de Linter: Resueltos todos los errores ts(2304), ts(2303), ts(2607), ts(2786) y no-unused-vars.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Sparkles, X, Mail, Phone, 
  Globe, HeartPulse, Briefcase, MessageSquare, Lock, Trash2 
} from 'lucide-react'; // ✅ Saneamiento: Añadidos 'Trash2' y 'CheckCircle2' para el flujo de baja segura
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button"; 
import { Spinner } from "@/components/ui/spinner"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // ✅ Saneamiento: Importados para el modal de doble factor

// Importaciones atómicas del módulo
import { StaffTable } from './StaffTable';
import { StaffForm } from './StaffForm';

// ============================================================================
// 📏 INTERFACES Y CONTRATOS DE DATOS (SSoT)
// ============================================================================

export interface StaffMember {
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

// ============================================================================
// 🛡️ SUB-COMPONENTE INTERNO: FICHA LABORAL (EXPEDIENTE DE PERSONAL)
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
        className="bg-pms-surface border border-pms-border p-8 rounded-[2.5rem] max-w-lg w-full space-y-6 shadow-2xl relative text-pms-text animate-fade-in"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-pms-surface-high rounded-full text-pms-text-muted hover:text-pms-text cursor-pointer border-none"><X size={14}/></button>
        
        <div className="flex items-center gap-4 border-b border-pms-border pb-6">
          <div className="w-16 h-16 rounded-2xl bg-pms-surface-high border border-pms-border flex items-center justify-center text-2xl text-pms-text font-display font-bold shadow-inner">
            {user.first_name.charAt(0)}{user.paternal_last_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-pms-text">{user.first_name} {user.paternal_last_name}</h3>
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
            <p className="text-xs font-semibold text-pms-text">{user.address || 'Não informado'}</p>
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
            <p className="text-[9px] text-pms-text-muted font-light mt-1">Módulos de nómina, folha de pagamento e calendário de ponto em desenvolvimento.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 🛡️ SUB-COMPONENTE INTERNO: DISTRIBUCIÓN OMNICANAL DE MAGIC LINK
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
          <p className="text-[10px] text-pms-text-muted mt-2 font-medium">Link de acesso gerado com sucesso para <strong className="text-pms-text">{data.email}</strong>. Escolha a forma de distribución:</p>
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
// 🛡️ SUB-COMPONENTE INTERNO: RE-ESTABLECIMIENTO MANUAL DE CONTRASEÑA
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
// 🏆 ORQUESTADOR INTELIGENTE (SMART COMPONENT)
// ============================================================================
export const StaffManagement: React.FC = () => {
  usePerformanceProfiler('StaffManagement');

  const { t, i18n } = useTranslation(['dashboard', 'auth']);
  
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de control para formularios y edición
  const [selectedEditUser, setSelectedEditUser] = useState<StaffMember | null>(null);

  // Estados para Modales
  const [selectedResetUser, setSelectedResetUser] = useState<StaffMember | null>(null);
  const [newManualPassword, setNewManualPassword] = useState('');
  const [inviteModalData, setInviteModalData] = useState<{ email: string; link: string; phone: string; name: string } | null>(null);
  const [selectedFichaUser, setSelectedFichaUser] = useState<StaffMember | null>(null);

  // 🚀 ESTADOS PARA EL MODAL DE CONFIRMACIÓN SEGURA DE ELIMINACIÓN (DOUBLE-VERIFICATION)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<StaffMember | null>(null);
  const [deleteTypedName, setDeleteTypedName] = useState('');

  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Saneamiento ESM: Captura del objeto de referencia estable
  useEffect(() => {
    const currentRef = copiedTimeoutRef;
    return () => {
      if (currentRef.current) clearTimeout(currentRef.current);
    };
  }, []);

  // ============================================================================
  // ⚙️ CARGA RELACIONAL DEL PERSONAL (RBAC INTEGRADO)
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
        role: roleMap.get(item.id) || 'housekeeper', 
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
  // 💾 PROCESAMIENTO CRUD: CREACIÓN Y ACTUALIZACIÓN
  // ============================================================================
  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão administrativa expirada.');

      const isEdit = !!selectedEditUser;
      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: isEdit ? 'update' : 'create',
          userId: isEdit ? selectedEditUser?.id : undefined,
          ...formData,
          locale: i18n.language
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha ao salvar o registro.');

      toast.success(data.message || 'Funcionário salvo com sucesso!');
      setSelectedEditUser(null);
      setActiveTab('manage'); 
      await fetchStaffList();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 🗑️ PROCESAMIENTO CRUD: GESTOR DE DISPARO DEL DIÁLOGO DE ELIMINACIÓN
  // ============================================================================
  const handleDeleteStaff = (member: StaffMember) => {
    setDeleteConfirmUser(member);
    setDeleteTypedName(''); 
  };

  /**
   * Ejecuta el borrado final en cascada en el backend una vez verificado el nombre
   */
  const executeDeleteStaff = async (member: StaffMember) => {
    setLoadingList(true);
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
          action: 'delete',
          userId: member.id,
          locale: i18n.language
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao processar exclusão.');

      toast.success(data.message || 'Funcionário removido com sucesso.');
      await fetchStaffList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado';
      toast.error(msg);
    } finally {
      setLoadingList(false);
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
      toast.error(err instanceof Error ? err.message : 'Erro ao generar link.');
    } finally {
      setLoadingList(false);
    }
  };

  const sendInviteViaWhatsApp = () => {
    if (!inviteModalData) return;
    const text = `*Acesso Administrativo - PMS Hotel Beach*\n\nOlá ${inviteModalData.name}, aqui está seu link de entrada seguro:\n🔗 ${inviteModalData.link}\n\n_Clique no link acima para definir sua senha de acceso._`;
    window.open(`https://wa.me/${inviteModalData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendInviteViaEmail = () => {
    if (!inviteModalData) return;
    const subject = 'Seu acesso ao PMS Hotel Beach';
    const body = `Olá ${inviteModalData.name},\n\nAqui está seu link de entrada único e seguro:\n${inviteModalData.link}\n\nPor favor, clique para configurar sua senha e acessar sua cuenta.\n\nHotel Beach Canasvieiras.`;
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
          <button onClick={() => { setSelectedEditUser(null); setActiveTab('register'); }} className={cn("px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer", activeTab === 'register' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "bg-transparent text-pms-text-muted hover:text-pms-text")}>
            Registrar
          </button>
          <button onClick={() => setActiveTab('manage')} className={cn("px-4 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer", activeTab === 'manage' ? "bg-pms-accent text-pms-accent-foreground shadow-sm" : "bg-transparent text-pms-text-muted hover:text-pms-text")}>
            Gerenciar Contas
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'register' ? (
          <motion.div key="register-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <StaffForm 
              initialData={selectedEditUser}
              isSaving={loading}
              onSubmit={handleFormSubmit}
              onCancel={selectedEditUser ? () => { setSelectedEditUser(null); setActiveTab('manage'); } : undefined}
              t={t}
            />
          </motion.div>
        ) : (
          <motion.div key="manage-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <StaffTable 
              staffList={staffList}
              loadingList={loadingList}
              isActionLoading={loading}
              onSelectFicha={setSelectedFichaUser}
              onSelectReset={setSelectedResetUser}
              onGenerateLink={handleGenerateMagicLink}
              onEdit={(member) => { setSelectedEditUser(member); setActiveTab('register'); }}
              onDelete={handleDeleteStaff}
              t={t}
            />
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

      {/* 🚀 MODAL 4: CONFIRMACIÓN SEGURA DE ELIMINACIÓN DE PERSONAL (DOUBLE-VERIFICATION) */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <Dialog open={!!deleteConfirmUser} onOpenChange={(open) => !open && setDeleteConfirmUser(null)}>
            <DialogContent className="sm:max-w-[380px] rounded-[2rem] border-pms-border bg-pms-surface text-pms-text shadow-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-lg text-pms-text flex items-center gap-2">
                  <Trash2 size={16} className="text-red-500 animate-pulse" />
                  Confirmar Desligamento
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2 text-xs font-body text-pms-text-muted">
                <p className="leading-relaxed text-left">
                  Para confirmar a exclusão e o desligamento permanente em cascata de <strong className="text-pms-text">{deleteConfirmUser.first_name} {deleteConfirmUser.paternal_last_name}</strong>, digite seu nome e sobrenome paterno exatamente como mostrado abajo:
                </p>
                
                <div className="p-3 bg-pms-surface-high border border-pms-border rounded-xl text-center select-all">
                  <code className="font-mono text-xs font-bold text-pms-text select-all">
                    {deleteConfirmUser.first_name} {deleteConfirmUser.paternal_last_name}
                  </code>
                </div>

                <div className="p-3 rounded-xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent">
                  <input
                    type="text"
                    value={deleteTypedName}
                    onChange={(e) => setDeleteTypedName(e.target.value)}
                    placeholder="Digite o nome completo para confirmar..."
                    className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none text-center font-medium placeholder:text-pms-text-muted"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setDeleteConfirmUser(null)} className="flex-1 h-11 bg-pms-surface-high border border-pms-border text-pms-text rounded-xl font-bold">
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={deleteTypedName !== `${deleteConfirmUser.first_name} ${deleteConfirmUser.paternal_last_name}`}
                    onClick={() => {
                      if (deleteConfirmUser) {
                        executeDeleteStaff(deleteConfirmUser);
                      }
                      setDeleteConfirmUser(null);
                      setDeleteTypedName('');
                    }}
                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold border-none disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
                  >
                    Excluir Funcionário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

    </div>
  );
};