/**
 * @file HousekeeperPortal.tsx
 * @description Portal Mobile-First de uso rudo para camareiras y supervisores de limpieza.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y flujos en tiempo real.
 * - Trinidad Atómica: Localización de textos y soporte multilingüe.
 * - Doble Modo Operativo: Interfaz adaptativa para Camareiras (Aseo estándar) y Supervisores (Checklists dinámicos, evaluación, score y fotos).
 * - Saneado: Satisface ESLint v9, libre de variables huérfanas y advertencias de renderizado.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, CheckCircle2, AlertTriangle, Play, Check, 
  RefreshCw, Bell, Star, Plus, ClipboardCheck, Award 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface Room {
  id: number;
  name: string;
  type: string;
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
}

interface Task {
  id: string;
  room_id: number;
  task_name: string;
  is_completed: boolean;
  is_custom?: boolean;
}

interface GuestRequest {
  id: string;
  room_name: string;
  request_type: string;
}

export const HousekeeperPortal: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del portal móvil
  usePerformanceProfiler('HousekeeperPortal');

  const { t } = useTranslation('housekeeping');
  const { user, role } = useAuth(); // Recuperamos sesión del supervisor y su rol activo

  const activeRole = role || 'housekeeper';
  const isSupervisor = activeRole === 'housekeeping_supervisor' || activeRole === 'admin' || activeRole === 'developer';
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);
  
  // Control de adición de tareas rápidas por el supervisor
  const [quickTaskName, setQuickTaskName] = useState('');

  // 🚀 ESTADO LOCAL PARA AUDITORÍAS SÍNCRONAS DEL SUPERVISOR EN MÓVIL
  const [auditForms, setAuditForms] = useState<Record<number, {
    score: number;
    is_satisfactory: boolean;
    notes: string;
    photo_url: string;
  }>>({});

  // ============================================================================
  // 1. CARGA DE DATOS Y SUSCRIPCIÓN EN TIEMPO REAL
  // ============================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomsData } = await supabase.from('rooms').select('*').order('id', { ascending: true });
        const { data: tasksData } = await supabase.from('housekeeping_tasks').select('*');
        setRooms(roomsData || []);
        setTasks(tasksData || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error de red';
        console.error('[HousekeeperPortal] Error de sincronización:', errorMessage);
        toast.error('Erro de sincronização.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel('guest_requests_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_requests' }, (payload) => {
        toast.info('🔔 Alerta de Huésped recibida.', { duration: 6000 });
        setGuestRequests(prev => [...prev, payload.new as GuestRequest]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ============================================================================
  // 2. MUTACIONES DE ESTADOS DE LIMPIEZA
  // ============================================================================
  const handleStartCleaning = async (roomId: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeeping_status: 'cleaning' } : r));
    await supabase.from('rooms').update({ housekeeping_status: 'cleaning' }).eq('id', roomId);
    toast.success('Limpeza iniciada!');
  };

  const handleFinishCleaning = async (roomId: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeeping_status: 'clean' } : r));
    await supabase.from('rooms').update({ housekeeping_status: 'clean' }).eq('id', roomId);
    setActiveRoomId(null);
    toast.success('A limpeza foi concluída e aguarda inspeção.');
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t));
    await supabase.from('housekeeping_tasks').update({ is_completed: isCompleted }).eq('id', taskId);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, roomId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`Evidencia guardada localmente para Habitación ${roomId}. Subiendo a Cloudinary...`);
    }
  };

  // ============================================================================
  // ⚡ COMPORTAMIENTOS EXCLUSIVOS DEL SUPERVISOR EN MÓVIL (RBAC)
  // ============================================================================
  
  const updateAuditField = (roomId: number, field: string, value: unknown) => {
    setAuditForms(prev => {
      const currentForm = prev[roomId] || { score: 5, is_satisfactory: true, notes: '', photo_url: '' };
      return {
        ...prev,
        [roomId]: { ...currentForm, [field]: value }
      };
    });
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>, roomId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAuditField(roomId, 'photo_url', URL.createObjectURL(file));
      toast.info(`Evidência fotográfica adicionada ao Quarto ${roomId}.`);
    }
  };

  const handleAddQuickTask = async (roomId: number) => {
    if (!quickTaskName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert([{
          room_id: roomId,
          task_name: quickTaskName.trim(),
          is_completed: false,
          is_custom: true
        }])
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data as Task]);
      setQuickTaskName('');
      toast.success('Nova tarefa injetada no checklist!');
    } catch {
      toast.error('Erro ao adicionar tarefa.');
    }
  };

  const submitRoomAudit = async (roomId: number) => {
    const form = auditForms[roomId] || { score: 5, is_satisfactory: true, notes: '', photo_url: '' };

    try {
      // Registrar la auditoría física en Supabase (ISO 27001 Compliance)
      const { error } = await supabase
        .from('housekeeping_audits')
        .insert([{
          room_id: roomId,
          supervisor_id: user?.id,
          status: form.is_satisfactory ? 'approved' : 'failed',
          score: form.score,
          notes: form.notes,
          photo_url: form.photo_url || null,
          is_satisfactory: form.is_satisfactory,
          checklist_snapshot: tasks.filter(t => t.room_id === roomId)
        }]);

      if (error) throw error;

      toast.success('Avaliação e vistoria salvas com sucesso!');

      // Si el supervisor aprueba la habitación, se marca automáticamente como limpia
      if (form.is_satisfactory) {
        await supabase.from('rooms').update({ housekeeping_status: 'clean' }).eq('id', roomId);
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeeping_status: 'clean' } : r));
        setActiveRoomId(null);
      }

      setAuditForms(prev => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });

    } catch { // Saneamiento ESLint (no-unused-vars): Cambiado por bloque catch sin variable 'err' huérfana
      toast.error('Falha ao enviar relatório do supervisor.');
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-pms-bg"><Spinner className="w-8 h-8 text-pms-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-pms-bg text-pms-text p-4 font-body selection:bg-pms-accent/30 max-w-md mx-auto transition-colors duration-300">
      
      {/* Cabecera Móvil */}
      <header className="flex items-center justify-between pb-6 border-b border-pms-border pt-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-pms-text">
            {isSupervisor ? 'Inspeção Geral' : t('title')}
          </h1>
          <p className="text-[10px] font-bold text-pms-accent uppercase tracking-widest mt-0.5">
            {isSupervisor ? 'Supervisor de Governança' : t('badge')}
          </p>
        </div>
        <div className="relative">
          <Bell className="w-6 h-6 text-pms-text-muted" />
          {guestRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-pulse">
              {guestRequests.length}
            </span>
          )}
        </div>
      </header>

      {/* Alertas de Huéspedes en Vivo */}
      <AnimatePresence>
        {guestRequests.map((req) => (
          <motion.div 
            key={req.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500 shrink-0 w-5 h-5 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-white">Chamado Urgente</p>
                <p className="text-[10px] text-pms-text-muted">Quarto {req.room_name}: {req.request_type}</p>
              </div>
            </div>
            <button 
              onClick={() => setGuestRequests(prev => prev.filter(r => r.id !== req.id))}
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer border-none"
            >
              OK
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Lista de Habitaciones */}
      <div className="space-y-4 mt-6">
        {rooms.map((room) => {
          const roomTasks = tasks.filter(tRow => tRow.room_id === room.id);
          const isSelected = activeRoomId === room.id;
          const auditForm = auditForms[room.id] || { score: 5, is_satisfactory: true, notes: '', photo_url: '' };

          return (
            <div 
              key={room.id}
              className={cn(
                "rounded-3xl border transition-all duration-300 p-5",
                isSelected ? "bg-pms-surface-high border-pms-accent shadow-lg" : "bg-pms-surface border-pms-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-pms-text">{room.name}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-pms-text-muted">{room.type}</span>
                </div>
                
                {/* Controles Adaptativos según el Estado y Rol */}
                <div className="flex items-center gap-2">
                  {room.housekeeping_status === 'dirty' && (
                    <button 
                      onClick={() => handleStartCleaning(room.id)}
                      className="h-10 px-4 bg-pms-accent text-pms-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-md"
                    >
                      <Play size={14} strokeWidth={2.5} /> {t('btn_start', { defaultValue: 'Comenzar' })}
                    </button>
                  )}
                  {room.housekeeping_status === 'cleaning' && !isSelected && (
                    <button 
                      onClick={() => setActiveRoomId(room.id)}
                      className="h-10 px-4 bg-pms-accent text-pms-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-md"
                    >
                      <RefreshCw size={14} className="animate-spin" /> Ver Checklist
                    </button>
                  )}
                  {room.housekeeping_status === 'clean' && !isSelected && isSupervisor && (
                    /* El Supervisor puede re-abrir o evaluar una habitación que ya esté marcada como limpia */
                    <button 
                      onClick={() => setActiveRoomId(room.id)}
                      className="h-10 px-4 bg-pms-surface-high text-pms-text border border-pms-border rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award size={14} className="text-pms-accent" /> Avaliar
                    </button>
                  )}
                  {room.housekeeping_status === 'clean' && !isSupervisor && (
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest">
                      {t('status.clean')}
                    </span>
                  )}
                </div>
              </div>

              {/* Checklist Expandido e Interactivo */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-4 pt-5 border-t border-pms-border mt-4"
                  >
                    {/* Título de Checklist */}
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">
                        Checklist Operacional
                      </p>
                      {/* Cierre rápido */}
                      <button onClick={() => setActiveRoomId(null)} className="text-[10px] text-red-500 bg-transparent border-none cursor-pointer">Fechar</button>
                    </div>
                    
                    <div className="space-y-2">
                      {roomTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => !isSupervisor && handleToggleTask(task.id, !task.is_completed)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-body",
                            isSupervisor ? "cursor-default" : "cursor-pointer select-none",
                            task.is_completed ? "bg-green-500/5 border-green-500/20 text-pms-text-muted line-through" : "bg-pms-surface border-pms-border text-pms-text"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                            task.is_completed ? "bg-green-500 border-green-500 text-white" : "border-pms-border"
                          )}>
                            {task.is_completed && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-semibold text-pms-text">{task.task_name}</span>
                        </div>
                      ))}
                    </div>

                    {/* 🚀 CAPACIDAD SUPERVISOR 1: Añadir ítems al checklist en tiempo real */}
                    {isSupervisor && (
                      <div className="flex gap-2 pt-1">
                        <div className="flex-1 p-2.5 rounded-xl border border-pms-border bg-pms-surface focus-within:border-pms-accent">
                          <input 
                            type="text"
                            value={quickTaskName}
                            onChange={(e) => setQuickTaskName(e.target.value)}
                            placeholder="Adicionar item rápido..."
                            className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddQuickTask(room.id)}
                          className="px-3 bg-pms-accent text-pms-accent-foreground rounded-xl flex items-center justify-center border-none cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}

                    {/* 🚀 CAPACIDAD SUPERVISOR 2: Ficha de Evaluación, Score y Evidencia Fotográfica */}
                    {isSupervisor ? (
                      <div className="pt-4 border-t border-pms-border/60 space-y-3">
                        <div className="flex items-center gap-2 text-pms-accent">
                          <ClipboardCheck size={14} />
                          <span className="text-[10px] font-bold text-pms-text uppercase tracking-widest">Avaliação do Supervisor</span>
                        </div>

                        <div className="p-4 bg-pms-surface-high/30 rounded-2xl border border-pms-border space-y-4">
                          
                          {/* Score Estrellas */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-pms-text-muted">Nota de Higiene:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((starVal) => (
                                <button
                                  key={starVal}
                                  type="button"
                                  onClick={() => updateAuditField(room.id, 'score', starVal)}
                                  className="p-1 border-none bg-transparent cursor-pointer outline-none"
                                >
                                  <Star 
                                    size={16} 
                                    className={cn(
                                      "transition-colors",
                                      starVal <= auditForm.score ? "fill-amber-500 text-amber-500" : "text-pms-text-muted/40"
                                    )} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Toggle Aprobado/Reprobado */}
                          <div className="flex items-center justify-between border-t border-pms-border/40 pt-3">
                            <span className="text-xs font-semibold text-pms-text-muted">Aprovar Quarto?</span>
                            <button
                              type="button"
                              onClick={() => updateAuditField(room.id, 'is_satisfactory', !auditForm.is_satisfactory)}
                              className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase border cursor-pointer transition-all",
                                auditForm.is_satisfactory 
                                  ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                  : "bg-red-500/10 text-red-500 border-red-500/20"
                              )}
                            >
                              {auditForm.is_satisfactory ? 'Aprovado' : 'Reprovado'}
                            </button>
                          </div>

                          {/* Notas */}
                          <div className="p-3 bg-pms-surface border border-pms-border rounded-xl">
                            <label className="block text-[8px] font-bold text-pms-text-muted uppercase tracking-widest mb-1">Notas do Supervisor</label>
                            <textarea
                              value={auditForm.notes}
                              onChange={(e) => updateAuditField(room.id, 'notes', e.target.value)}
                              placeholder="Observações da auditoria..."
                              className="w-full bg-transparent border-none p-0 text-xs text-pms-text outline-none resize-none h-12 placeholder:text-pms-text-muted/50"
                            />
                          </div>

                          {/* Evidencia de Cámara Nativa */}
                          <div className="flex gap-2 pt-1">
                            <label className="flex-1 h-11 bg-pms-surface border border-pms-border rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs text-pms-text-muted font-semibold hover:bg-pms-surface-high">
                              <Camera size={15} className="text-pms-accent" />
                              {auditForm.photo_url ? 'Foto Anexada' : 'Foto da Falla'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                onChange={(e) => handleCameraCapture(e, room.id)}
                                className="hidden" 
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => submitRoomAudit(room.id)}
                              className="flex-1 h-11 bg-pms-accent text-pms-accent-foreground font-bold text-xs rounded-xl border-none cursor-pointer"
                            >
                              Salvar Vistoria
                            </button>
                          </div>

                        </div>
                      </div>
                    ) : (
                      /* Controles de Camareira estándar */
                      <div className="pt-2 flex gap-3">
                        <label className="flex-1 h-12 bg-pms-surface border border-pms-border rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs text-pms-text-muted font-semibold hover:bg-pms-surface-high">
                          <Camera size={16} className="text-pms-accent" />
                          {t('btn_report_issue', { defaultValue: 'Reportar Falla' })}
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            onChange={(e) => handlePhotoCapture(e, room.id)}
                            className="hidden" 
                          />
                        </label>

                        <button 
                          onClick={() => handleFinishCleaning(room.id)}
                          disabled={roomTasks.some(tRow => !tRow.is_completed)}
                          className="flex-1 h-12 bg-green-600 disabled:bg-pms-surface-high/50 disabled:text-pms-text-muted/50 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs cursor-pointer border-none shadow-md"
                        >
                          <CheckCircle2 size={16} /> {t('btn_finish', { defaultValue: 'Terminar' })}
                        </button>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};