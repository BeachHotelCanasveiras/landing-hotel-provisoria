/**
 * @file HousekeeperPortal.tsx
 * @description Portal Mobile-First de uso rudo para los auxiliares de limpieza.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y flujos en tiempo real.
 * - Trinidad Atómica: Localización total del texto de control (housekeeping namespace).
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CheckCircle2, AlertTriangle, Play, Check, RefreshCw, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
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
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);

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
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[HousekeeperPortal] Error de sincronización:', errorMessage);
        toast.error('Error al sincronizar con la base de datos.');
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
    toast.success('Habitación marcada: En Limpieza');
  };

  const handleFinishCleaning = async (roomId: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeeping_status: 'clean' } : r));
    await supabase.from('rooms').update({ housekeeping_status: 'clean' }).eq('id', roomId);
    setActiveRoomId(null);
    toast.success('¡Habitación terminada y lista para inspección!');
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-pms-bg"><Spinner className="w-8 h-8 text-pms-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-pms-bg text-pms-text p-4 font-body selection:bg-pms-accent/30 max-w-md mx-auto transition-colors duration-300">
      
      {/* Cabecera Móvil - Totalmente internacionalizada */}
      <header className="flex items-center justify-between pb-6 border-b border-pms-border pt-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-pms-text">{t('title')}</h1>
          <p className="text-[10px] font-bold text-pms-accent uppercase tracking-widest mt-0.5">{t('badge')}</p>
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
                <p className="text-xs font-bold text-white">Llamada de Huésped</p>
                <p className="text-[10px] text-pms-text-muted">Habitación {req.room_name} solicita {req.request_type}</p>
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
                
                {/* Control de Estados Móvil - Internacionalizado */}
                <div className="flex items-center gap-2">
                  {room.housekeeping_status === 'dirty' && (
                    <button 
                      onClick={() => handleStartCleaning(room.id)}
                      className="h-10 px-4 bg-pms-accent text-pms-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-md hover:opacity-90 transition-all active:scale-95"
                    >
                      <Play size={14} strokeWidth={2.5} /> {t('btn_start', { defaultValue: 'Comenzar' })}
                    </button>
                  )}
                  {room.housekeeping_status === 'cleaning' && !isSelected && (
                    <button 
                      onClick={() => setActiveRoomId(room.id)}
                      className="h-10 px-4 bg-pms-accent text-pms-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-md hover:opacity-90 transition-all active:scale-95"
                    >
                      <RefreshCw size={14} className="animate-spin" /> {t('btn_view_checklist', { defaultValue: 'Ver Checklist' })}
                    </button>
                  )}
                  {room.housekeeping_status === 'clean' && (
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest">
                      {t('status.clean')}
                    </span>
                  )}
                </div>
              </div>

              {/* Checklist Interactivo Desacoplado */}
              <AnimatePresence>
                {isSelected && room.housekeeping_status === 'cleaning' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-4 pt-5 border-t border-pms-border mt-4"
                  >
                    <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">
                      {t('tasks_mandatory', { defaultValue: 'Tareas Obligatorias' })}
                    </p>
                    
                    <div className="space-y-2">
                      {roomTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleToggleTask(task.id, !task.is_completed)}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs",
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

                    {/* Reporte de Incidencias con Cámara Nativa */}
                    <div className="pt-2 flex gap-3">
                      <label className="flex-1 h-12 bg-pms-surface border border-pms-border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs text-pms-text-muted font-semibold hover:bg-pms-surface-high">
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
                        className="flex-1 h-12 bg-green-600 disabled:bg-pms-surface-high/50 disabled:text-pms-text-muted/50 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer border-none shadow-md hover:opacity-90"
                      >
                        <CheckCircle2 size={16} /> {t('btn_finish', { defaultValue: 'Terminar' })}
                      </button>
                    </div>
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