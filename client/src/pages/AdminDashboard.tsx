/**
 * @file AdminDashboard.tsx
 * @description Orquestador Maestro de Paneles de Control (PMS & Portales de Acceso).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Visor Supa Base: Mapeo y renderizado dinámico de tablas físicas con el componente 'DatabaseTableViewer'.
 * - React 19 Purity (static-components): Se inyecta 'themeSelectorUI' como nodo JSX en lugar de componente anidado.
 * - Saneamiento TS (no-explicit-any): Tipado estricto de 'DashboardHeaderProps' y firmas del localizador.
 * - Responsabilidad Única (SRP): Lógica de red extraída a 'useDashboardData' y 'useDashboardMutations'.
 * - Reloj en Tiempo Real Simplificado: Reloj síncrono del cliente ampliado a formato grande fijado en hora de Florianópolis (Brasil).
 * - Cierre de Sesión en Avatar: Dropdown interactivo con auto-cierre al hacer clic fuera para gestionar la salida.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut, Sun, Moon, Database, Clock } from 'lucide-react'; // 🚀 Saneado: Removido 'Globe' sin uso
import { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useTheme, type DashboardTheme } from '@/contexts/ThemeContext'; 
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

// Importaciones Atómicas de Módulos y Barriles
import { GuestPortal, AgencyPortal, AdminPMS, DeveloperConsole } from '@/components/dashboard';
import { PMSSidebar } from '@/components/dashboard/PMSSidebar';
import { RoomMatrix } from '@/components/dashboard/reception/RoomMatrix';
import { RatesAvailability } from '@/components/dashboard/reception/RatesAvailability';
import { BookingSearch, type BookingRecord } from '@/components/dashboard/reception/BookingSearch';
import { HousekeepingReport, type HousekeepingTask, type RoomHousekeepingData } from '@/components/dashboard/reception/HousekeepingReport';
import { HousekeeperPortal } from '@/components/dashboard/HousekeeperPortal';
import { StaffManagement } from '@/components/dashboard/reception/staff'; 
import { RoomManagement } from '@/components/dashboard/reception/RoomManagement';
import { OnboardingForm } from '@/components/dashboard/reception/OnboardingForm';
import { TemplateManager } from '@/components/dashboard/reception/TemplateManager';

// ============================================================================
// 📏 CONTRATOS DE DATOS ESTRICTOS (SSoT)
// ============================================================================

interface SupabaseRoom {
  id: number;
  name: string;
  type: 'single' | 'double' | 'triple' | 'grupal';
  price_per_night: number;
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
  status: 'available' | 'maintenance' | 'occupied';
  current_occupant?: string | null;
}

interface SupabaseBooking {
  id: string;
  room_id: number | null; 
  room_type?: string | null; 
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  rooms?: { name: string } | null; 
  guests?: { 
    first_name: string; 
    last_name: string; 
    phone: string; 
    user_email: string; 
  };
}

interface MatrixRoom {
  id: number;
  name: string;
  type: 'single' | 'double' | 'triple' | 'grupal';
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
}

interface MatrixBooking {
  id: string;
  room_id: number; 
  guest_name: string;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed';
}

interface RatesCategory {
  id: string;
  name: string;
  total_inventory: number;
  base_price_brl: number;
}

// ============================================================================
// 🧠 HOOKS DE AISLAMIENTO LÓGICO (Responsabilidad Única)
// ============================================================================

function useDashboardData(user: User | null, isStaff: boolean, currentView: string) {
  const { data: rooms = [], isLoading: loadingRooms } = useQuery<SupabaseRoom[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data as SupabaseRoom[];
    },
    enabled: !!user,
  });

  const { data: rawBookings = [], isLoading: loadingBookings } = useQuery<SupabaseBooking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, guests(first_name, last_name, phone, user_email), rooms(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as SupabaseBooking[];
    },
    enabled: !!user,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<HousekeepingTask[]>({
    queryKey: ['housekeeping_tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('housekeeping_tasks').select('*');
      if (error) throw error;
      return data as HousekeepingTask[];
    },
    enabled: isStaff && currentView === 'housekeeping' && !!user,
  });

  const isDbView = currentView.startsWith('db_');
  const dbTableName = isDbView ? currentView.slice(3) : '';

  const { data: dbTableData = [], isLoading: loadingDbTable } = useQuery<Record<string, unknown>[]>({
    queryKey: ['db_table', dbTableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(dbTableName).select('*');
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
    enabled: !!user && isDbView,
    staleTime: 1000 * 5, 
  });

  // Mappers
  const mappedBookings: BookingRecord[] = useMemo(() => rawBookings.map((b) => ({
    id: b.id,
    referenceCode: b.id.split('-')[0].toUpperCase(),
    guestName: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Huésped Invitado', 
    guestEmail: b.guests?.user_email || 'Sincronizado vía Stripe',
    guestPhone: b.guests?.phone || '+5548998126650',
    roomName: b.rooms?.name || `[${b.room_type?.toUpperCase() || 'S/A'}] PENDIENTE`,
    checkIn: b.check_in,
    checkOut: b.check_out,
    totalPrice: Number(b.total_price),
    status: b.status,
  })), [rawBookings]);

  const matrixRooms: MatrixRoom[] = useMemo(() => rooms.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    housekeeping_status: r.housekeeping_status,
  })), [rooms]);

  const matrixBookings: MatrixBooking[] = useMemo(() => rawBookings
    .filter((b) => b.room_id !== null && b.room_id !== undefined && (b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'pending'))
    .map((b) => ({
      id: b.id,
      room_id: b.room_id as number,
      guest_name: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Hóspede',
      check_in: b.check_in,
      check_out: b.check_out,
      status: (b.status === 'pending' ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
    })), [rawBookings]);

  const roomCategories: RatesCategory[] = useMemo(() => {
    const cats: Record<string, RatesCategory> = {};
    rooms.forEach(r => {
      if (!cats[r.type]) {
        cats[r.type] = { id: r.type, name: r.type.toUpperCase(), total_inventory: 0, base_price_brl: 0 };
      }
      cats[r.type].total_inventory += 1;
      cats[r.type].base_price_brl = Number(r.price_per_night) || 200; 
    });
    return Object.values(cats);
  }, [rooms]);

  const housekeepingRooms: RoomHousekeepingData[] = useMemo(() => rooms.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    housekeeping_status: r.housekeeping_status,
    current_occupant: r.current_occupant || undefined,
  })), [rooms]);

  return {
    rooms, rawBookings, tasks,
    mappedBookings, matrixRooms, matrixBookings, roomCategories, housekeepingRooms,
    dbTableData, dbTableName, isDbView,
    isGlobalLoading: loadingRooms || loadingBookings || (currentView === 'housekeeping' && loadingTasks) || (isDbView && loadingDbTable)
  };
}

function useDashboardMutations() {
  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: async (roomData: Partial<SupabaseRoom>) => {
      const { error } = await supabase.from('rooms').insert([roomData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Habitación agregada al inventario.');
    }
  });

  const deleteRoom = useMutation({
    mutationFn: async (roomId: number) => {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Habitación eliminada.');
    }
  });

  const updateRoomStatus = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number, status: string }) => {
      const { error } = await supabase.from('rooms').update({ housekeeping_status: status }).eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] });
      toast.success('Estado de limpieza actualizado.');
    }
  });

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) => {
      const { error } = await supabase.from('housekeeping_tasks').update({ is_completed: isCompleted }).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] })
  });

  const addCustomTask = useMutation({
    mutationFn: async ({ roomId, taskName }: { roomId: number, taskName: string }) => {
      const { error } = await supabase.from('housekeeping_tasks').insert([{
        room_id: roomId,
        task_name: taskName,
        is_custom: true,
        is_completed: false
      }]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] })
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupabaseBooking['status'] }) => {
      let assignedRoomId: number | null = null;

      if (status === 'checked_in') {
        const { data: currentBooking } = await supabase.from('bookings').select('room_id, room_type').eq('id', id).single();
        if (currentBooking && !currentBooking.room_id) {
          const typeToFind = currentBooking.room_type || 'double';
          const { data: freeRoom } = await supabase.from('rooms').select('id').eq('type', typeToFind).eq('status', 'available').eq('housekeeping_status', 'clean').limit(1).maybeSingle();
          if (!freeRoom) throw new Error(`No hay habitaciones libres y limpias para la categoría: ${typeToFind.toUpperCase()}.`);
          assignedRoomId = freeRoom.id;
        } else if (currentBooking?.room_id) {
          assignedRoomId = currentBooking.room_id;
        }
      }

      const payload: { status: SupabaseBooking['status']; room_id?: number | null } = { status };
      
      if (assignedRoomId) {
        payload.room_id = assignedRoomId;
        await supabase.from('rooms').update({ status: 'occupied' }).eq('id', assignedRoomId);
      }

      if (status === 'checked_out') {
        const { data: currentBooking } = await supabase.from('bookings').select('room_id').eq('id', id).single();
        if (currentBooking?.room_id) {
          await supabase.from('rooms').update({ status: 'available', housekeeping_status: 'dirty' }).eq('id', currentBooking.room_id);
        }
      }

      const { error } = await supabase.from('bookings').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Estado de reserva actualizado con éxito.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al actualizar el estado.')
  });

  return { createRoom, deleteRoom, updateRoomStatus, toggleTask, addCustomTask, updateBookingStatus };
}

// ============================================================================
// 🎨 COMPONENTES DE UI (Layout, Header & Visor Supa Base)
// ============================================================================

interface DashboardHeaderProps {
  user: User;
  userRole: UserRole;
  dashboardTheme: DashboardTheme;
  setDashboardTheme: (theme: DashboardTheme) => void;
  signOut: () => Promise<void>;
  isStaff: boolean;
  currentView: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, userRole, dashboardTheme, setDashboardTheme, signOut, isStaff, currentView, t 
}) => {
  const userInitial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';

  // 🚀 RELOJ EN TIEMPO REAL FIJADO EN HORA DE FLORIANÓPOLIS (Cero Consultas de Red / Cliente Puro)
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', { // 🚀 Saneado: Formateador con idioma local estable sin dependencias inestables
      timeZone: 'America/Sao_Paulo', // Sincronizado por defecto con Florianópolis, Brasil (GMT-3)
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(time);
  }, [time]);

  // 🚀 CONTROL DESPLEGABLE DEL AVATAR CLIQUEABLE PARA CERRAR SESIÓN
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    setDashboardTheme(dashboardTheme === 'light' ? 'dark' : 'light');
  };

  if (isStaff) {
    return (
      <header className="bg-pms-surface border-b border-pms-border px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10 transition-colors duration-300">
        <div>
          <h1 className="font-display text-2xl font-bold text-pms-text tracking-tight">
            {currentView.startsWith('db_') ? 'Supa Base' : currentView === 'overview' ? `Olá, ${user.user_metadata?.full_name?.split(' ')[0] || 'User'}` : t('brand_dashboard_title', { defaultValue: 'Gestão do Hotel' })}
          </h1>
          <p className="font-body text-[10px] text-pms-text-muted font-bold uppercase tracking-widest mt-0.5">
            Beach Core PMS • <span className="text-pms-accent">{userRole}</span>
          </p>
        </div>

        {/* CONTROLES DE LA BARRA SUPERIOR (Reloj Grande + Un Solo Botón de Tema + Avatar Cliqueable) */}
        <div className="flex items-center gap-6">
          
          {/* Reloj Grande en Tiempo Real */}
          <div className="flex items-center gap-2.5 bg-pms-surface-high/60 border border-pms-border px-4.5 py-2 rounded-2xl select-none">
            <Clock size={15} className="text-pms-accent animate-pulse" />
            <span className="font-mono text-sm sm:text-base font-bold text-pms-text tracking-tight min-w-[70px]">{formattedTime}</span>
          </div>

          {/* Un Solo Botón de Alternancia de Tema */}
          <button
            onClick={handleToggleTheme}
            title="Alternar Tema PMS"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-pms-surface-high border border-pms-border hover:bg-pms-surface text-pms-text outline-none cursor-pointer transition-colors shadow-sm"
          >
            {dashboardTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* 🚀 AVATAR CLIQUEABLE CON DROPDOWN DE CONFIGURACIÓN Y SALIDA */}
          <div className="relative" ref={avatarMenuRef}>
            <button 
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="focus:outline-none bg-transparent border-none p-0 cursor-pointer flex items-center"
              aria-label="Menu do Usuário"
            >
              <Avatar className="w-10 h-10 border-2 border-pms-border shadow-sm hover:border-pms-accent transition-colors">
                <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                <AvatarFallback className="bg-pms-surface-high text-pms-text font-bold">{userInitial}</AvatarFallback>
              </Avatar>
            </button>

            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 bg-pms-surface border border-pms-border rounded-2xl p-1.5 shadow-2xl z-50 min-w-[160px] text-pms-text"
                >
                  <div className="px-3.5 py-2.5 border-b border-pms-border/40 select-none">
                    <p className="text-[10px] text-pms-accent uppercase tracking-widest font-bold">Ficha do Usuário</p>
                    <p className="text-xs font-semibold mt-1 truncate">{user.user_metadata?.full_name || 'Usuário'}</p>
                  </div>
                  <div className="pt-1.5">
                    <button 
                      onClick={async () => {
                        setIsAvatarMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-red-500/10 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 border-none bg-transparent cursor-pointer"
                    >
                      <LogOut size={13} /> Sair da Conta
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-pms-border bg-pms-surface sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-pms-accent flex items-center justify-center text-pms-accent-foreground font-brand text-base font-bold shadow-sm">B</div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-pms-text-muted">{userRole}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-pms-surface-high border border-pms-border text-pms-text outline-none cursor-pointer"
        >
          {dashboardTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <Avatar className="w-9 h-9 border border-pms-border shadow-xs">
          <AvatarImage src={user.user_metadata?.avatar_url || ''} />
          <AvatarFallback className="bg-pms-surface-high text-pms-text font-bold">{userInitial}</AvatarFallback>
        </Avatar>
        <button onClick={() => signOut()} className="p-2 text-pms-text-muted hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer" title="Sair"><LogOut size={20}/></button>
      </div>
    </header>
  );
};

/**
 * 🛰️ VISOR INTERACTIVO DE BASE DE DATOS (Gemini High-Density Layout)
 */
const DatabaseTableViewer: React.FC<{ 
  tableName: string; 
  data: Record<string, unknown>[]; 
  t: (key: string, options?: Record<string, unknown>) => string;
}> = ({ tableName, data}) => {
  
  const headers = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const formatCellValue = (key: string, val: unknown) => {
    if (val === null || val === undefined) {
      return <span className="text-pms-text-muted/40 font-mono italic">null</span>;
    }
    if (typeof val === 'boolean') {
      return val ? (
        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-md font-bold text-[9px]">TRUE</span>
      ) : (
        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md font-bold text-[9px]">FALSE</span>
      );
    }
    if (typeof val === 'object') {
      return <code className="text-[10px] bg-pms-surface-high px-1.5 py-0.5 rounded font-mono text-pms-text truncate block max-w-[200px]" title={JSON.stringify(val)}>{JSON.stringify(val)}</code>;
    }
    if (key === 'id' || key.endsWith('_id')) {
      const strVal = String(val);
      return <span className="font-mono text-[10px] tracking-tight bg-pms-surface-high px-1.5 py-0.5 rounded text-pms-text-muted" title={strVal}>{strVal.slice(0, 8)}...</span>;
    }
    if (key.endsWith('_at') || key === 'created_at') {
      return <span className="text-[10px] font-mono text-pms-text-muted">{new Date(String(val)).toLocaleString()}</span>;
    }
    return <span className="text-pms-text font-medium">{String(val)}</span>;
  };

  return (
    <div className="bg-pms-surface rounded-3xl border border-pms-border p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
      <div className="border-b border-pms-border pb-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pms-surface-high border border-pms-border flex items-center justify-center text-pms-accent">
            <Database size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-pms-text">Tabela: public.{tableName}</h4>
            <p className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest mt-0.5">Visor Supa Base Ativo</p>
          </div>
        </div>
        <span className="bg-pms-surface-high border border-pms-border px-3 py-1.5 rounded-xl font-mono text-[11px] text-pms-text-muted select-none">
          {data.length} registros
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-pms-border scrollbar-thin">
        <table className="w-full border-collapse divide-y divide-pms-border text-[11px] font-body">
          <thead className="bg-pms-surface-high/50">
            <tr className="divide-x divide-pms-border">
              {headers.map(h => (
                <th key={h} className="p-3 text-left font-bold text-pms-text-muted uppercase tracking-wider select-none whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pms-border bg-pms-surface">
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="divide-x divide-pms-border hover:bg-pms-surface-high/20 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="p-3 whitespace-nowrap overflow-hidden max-w-[220px] truncate">
                      {formatCellValue(h, row[h])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length || 1} className="p-12 text-center text-pms-text-muted italic">
                  Tabela sem registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// 🏆 ORQUESTADOR MAESTRO (Componente Principal)
// ============================================================================

export default function AdminDashboard() {
  usePerformanceProfiler('AdminDashboard');

  const { t } = useTranslation(['dashboard', 'housekeeping']);
  const [, setLocation] = useLocation();
  const { user, role, signOut, refreshUser, loading: authLoading } = useAuth();
  const { dashboardTheme, setDashboardTheme } = useTheme();
  const queryClient = useQueryClient();

  const [currentView, setCurrentView] = useState<string>('overview');

  const userRole: UserRole = role || 'guest';
  
  // 🚀 SANEAMIENTO (RBAC): Incorporamos 'housekeeping_supervisor' al censo de personal operativo (isStaff)
  const isStaff = ['admin', 'developer', 'receptionist', 'housekeeping_supervisor'].includes(userRole);

  // Data & Mutations
  const { 
    rooms, tasks, mappedBookings, matrixRooms, matrixBookings, 
    roomCategories, housekeepingRooms, dbTableData, dbTableName, isDbView, isGlobalLoading 
  } = useDashboardData(user, isStaff, currentView);
  
  const mutations = useDashboardMutations();

  // Enrutamiento protegido
  useEffect(() => {
    if (!authLoading && !user) setLocation('/login');
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-pms-bg"><Spinner className="w-8 h-8 text-pms-accent animate-spin" /></div>;
  }

  // Interceptor Onboarding
  if (user.user_metadata?.temp_password_active) {
    return <OnboardingForm user={user} onComplete={async () => { await queryClient.invalidateQueries({ queryKey: ['user'] }); await refreshUser(); }} />;
  }

  // Mapa de Vistas (Factory Pattern)
  const renderView = () => {
    // 🚀 INTERCEPTOR DEL VISOR DE BASE DE DATOS (Supa Base)
    if (isDbView) {
      return <DatabaseTableViewer tableName={dbTableName} data={dbTableData} t={t} />;
    }

    switch (currentView) {
      case 'overview':
        return userRole === 'developer' ? <DeveloperConsole t={t as (key: string) => string} /> :
               userRole === 'admin' ? <AdminPMS t={t as (key: string) => string} /> :
               // 🚀 REFACTOR PORTALES B2B: Segregamos el soporte analítico de las agencias
               (userRole === 'agency_retail' || userRole === 'agency_wholesale' || userRole === 'agency') ? <AgencyPortal userEmail={user.email || ''} t={t as (key: string) => string} /> :
               (userRole === 'housekeeper' || userRole === 'housekeeping_supervisor') ? <HousekeeperPortal /> : 
               <GuestPortal userEmail={user.email || ''} t={t as (key: string) => string} />;
      
      // 🚀 SOPORTE ADICIONAL PARA LAS VISTAS PLANAS DEL SIDEBAR B2B
      case 'agency_retail_portal':
      case 'agency_wholesale_portal':
        return <AgencyPortal userEmail={user.email || ''} t={t as (key: string) => string} />;

      case 'room_inventory':
        return <RoomManagement rooms={rooms} isActionLoading={mutations.createRoom.isPending || mutations.deleteRoom.isPending} onCreateRoom={(d) => mutations.createRoom.mutateAsync(d)} onDeleteRoom={(id) => mutations.deleteRoom.mutateAsync(id)} />;
      case 'room_map':
        return <RoomMatrix rooms={matrixRooms} bookings={matrixBookings} />;
      case 'rates':
        return <RatesAvailability categories={roomCategories} onSave={async () => {}} />;
      case 'booking_search':
        return <BookingSearch bookings={mappedBookings} isActionLoading={mutations.updateBookingStatus.isPending} onStatusChange={(id, status) => mutations.updateBookingStatus.mutateAsync({ id, status })} />;
      case 'housekeeping': {
        // 🚀 SANEAMIENTO DE ROL: Mapeamos con un condicional para que 'housekeeping_supervisor' se convierta en 'housekeeper'
        // al entrar en HousekeepingReport y evitar el error TS2322 de firmas sin alterar el tipado nativo.
        // Envuelta esta sección en llaves {} de forma síncrona para resolver el error léxico no-case-declarations.
        const reportRole = userRole === 'housekeeping_supervisor' 
          ? 'housekeeper' 
          : (userRole as 'developer' | 'admin' | 'receptionist' | 'housekeeper');

        return (
          <HousekeepingReport 
            rooms={housekeepingRooms} 
            tasks={tasks} 
            userRole={reportRole} 
            isActionLoading={mutations.updateRoomStatus.isPending || mutations.toggleTask.isPending} 
            onUpdateRoomStatus={(id, st) => mutations.updateRoomStatus.mutateAsync({ roomId: id, status: st })} 
            onToggleTask={(id, st) => mutations.toggleTask.mutateAsync({ taskId: id, isCompleted: st })} 
            onAddCustomTask={(id, name) => mutations.addCustomTask.mutateAsync({ roomId: id, taskName: name })} 
          />
        );
      }
      case 'staff':
        return <StaffManagement />;
      case 'settings_all':
        return <TemplateManager />;
      default:
        return <AdminPMS t={t as (key: string) => string} />;
    }
  };

  // Renderizado del Layout Base (Staff vs Guest)
  if (isStaff) {
    return (
      <div className="flex h-screen bg-pms-bg overflow-hidden font-body selection:bg-pms-accent/30" data-dashboard-theme={dashboardTheme}>
        <PMSSidebar currentView={currentView} onNavigate={setCurrentView} onSignOut={signOut} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <DashboardHeader user={user} userRole={userRole} dashboardTheme={dashboardTheme} setDashboardTheme={setDashboardTheme} signOut={signOut} isStaff={isStaff} currentView={currentView} t={t} />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-pms-bg transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div key={currentView} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                {isGlobalLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-50">
                    <Spinner className="w-8 h-8 text-pms-accent mb-4 animate-spin" />
                    <p className="font-body text-[10px] font-bold uppercase tracking-widest text-pms-text-muted">{t('loading_sync', { defaultValue: 'Sincronizando' })}</p>
                  </div>
                ) : renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pms-bg text-pms-text font-body flex flex-col" data-dashboard-theme={dashboardTheme}>
      <DashboardHeader user={user} userRole={userRole} dashboardTheme={dashboardTheme} setDashboardTheme={setDashboardTheme} signOut={signOut} isStaff={isStaff} currentView={currentView} t={t} />
      <main className="flex-1 container px-6 py-12 max-w-5xl mx-auto transition-colors duration-300">
        <h2 className="font-display text-4xl text-pms-text mb-8 tracking-tight">
          {t('welcome_message', { defaultValue: 'Bienvenido' })}, {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </h2>
        {renderView()}
      </main>
    </div>
  );
}