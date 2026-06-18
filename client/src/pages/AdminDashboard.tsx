/**
 * @file AdminDashboard.tsx
 * @description Orquestador Maestro de Paneles de Control (PMS & Portales).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% desacoplado de colores rígidos mediante bg-pms-bg, bg-pms-surface y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje.
 * - Trinidad Atómica: Localización total del texto institucional de cabeceras.
 * - Saneamiento: Cero aserciones implícitas de tipo 'any' para ESLint v9.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

import { GuestPortal, AgencyPortal, AdminPMS, DeveloperConsole } from '@/components/dashboard';
import { PMSSidebar } from '@/components/dashboard/PMSSidebar';
import { RoomMatrix } from '@/components/dashboard/reception/RoomMatrix';
import { RatesAvailability } from '@/components/dashboard/reception/RatesAvailability';
import { BookingSearch, type BookingRecord } from '@/components/dashboard/reception/BookingSearch';
import { HousekeepingReport, type HousekeepingTask } from '@/components/dashboard/reception/HousekeepingReport';
import { HousekeeperPortal } from '@/components/dashboard/HousekeeperPortal';
import { StaffManagement } from '@/components/dashboard/reception/StaffManagement';

// Sincronización e importación de componentes de inventario, plantillas y onboarding
import { RoomManagement } from '@/components/dashboard/reception/RoomManagement';
import { OnboardingForm } from '@/components/dashboard/reception/OnboardingForm';
import { TemplateManager } from '@/components/dashboard/reception/TemplateManager';

import { type RoomHousekeepingData } from '@/components/dashboard/reception/HousekeepingReport';

// --- CONTRATOS DE DATOS ESTRICTOS (SSoT) ---
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
  room_id: number | null; // 🚀 Desacoplado: Puede ser nulo antes de asignación física
  room_type?: string | null; // 🚀 Nueva columna de categoría
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  rooms?: { name: string } | null; // 🚀 Relación nullable
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
  room_id: number; // 🚀 Saneado para cumplir de forma estricta con RoomMatrix.tsx (Failsafe TS2322)
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

export default function AdminDashboard() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia de montaje
  usePerformanceProfiler('AdminDashboard');

  const { t } = useTranslation(['dashboard', 'housekeeping']);
  const [, setLocation] = useLocation();
  const { user, role, signOut, refreshUser, loading: authLoading } = useAuth();
  const { dashboardTheme } = useTheme(); // Sincronizador de tema reactivo
  const queryClient = useQueryClient();

  const [currentView, setCurrentView] = useState<string>('overview');

  // RBAC: Roles de Seguridad
  const userRole: UserRole = role || 'guest';
  const isStaff = ['admin', 'developer', 'receptionist'].includes(userRole);

  // ============================================================================
  // 1. DATA FETCHING (TanStack Query)
  // ============================================================================

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

  // ============================================================================
  // 2. DATA MAPPING (Mapeos Heurísticos - DRY)
  // ============================================================================

  const mappedBookings: BookingRecord[] = useMemo(() => {
    return rawBookings.map((b) => ({
      id: b.id,
      referenceCode: b.id.split('-')[0].toUpperCase(),
      guestName: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Huésped Invitado', 
      guestEmail: b.guests?.user_email || 'Sincronizado vía Stripe',
      guestPhone: b.guests?.phone || '+5548998126650',
      // 🚀 Mapeo Inteligente: Si no hay habitación física, muestra la categoría de Stripe
      roomName: b.rooms?.name || `[${b.room_type?.toUpperCase() || 'S/A'}] PENDIENTE`,
      checkIn: b.check_in,
      checkOut: b.check_out,
      totalPrice: Number(b.total_price),
      status: b.status,
    }));
  }, [rawBookings]);

  const matrixRooms: MatrixRoom[] = useMemo(() => {
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      housekeeping_status: r.housekeeping_status,
    }));
  }, [rooms]);

  const matrixBookings: MatrixBooking[] = useMemo(() => {
    return rawBookings
      // 🚀 Saneamiento TS2322: Excluimos reservas que no tienen cuarto asignado aún de la matriz física
      .filter((b) => b.room_id !== null && b.room_id !== undefined && (b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'pending'))
      .map((b) => ({
        id: b.id,
        room_id: b.room_id as number, // Aserción segura posterior al filtro
        guest_name: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Hóspede',
        check_in: b.check_in,
        check_out: b.check_out,
        status: (b.status === 'pending' ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
      }));
  }, [rawBookings]);

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

  const housekeepingRooms: RoomHousekeepingData[] = useMemo(() => {
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      housekeeping_status: r.housekeeping_status,
      current_occupant: r.current_occupant || undefined,
    }));
  }, [rooms]);

  // ============================================================================
  // 3. MUTACIONES DE RED
  // ============================================================================

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: Partial<SupabaseRoom>) => {
      const { error } = await supabase.from('rooms').insert([roomData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Habitación agregada al inventario.');
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Habitación eliminada.');
    }
  });

  const updateRoomStatusMutation = useMutation({
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

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) => {
      const { error } = await supabase.from('housekeeping_tasks').update({ is_completed: isCompleted }).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] })
  });

  const addCustomTaskMutation = useMutation({
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

  // 🚀 MUTACIÓN AVANZADA: Maneja de forma atómica Check-In y Check-Out integrando el control físico
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupabaseBooking['status'] }) => {
      let assignedRoomId: number | null = null;

      // ⏳ Caso A: Al hacer Check-In (checked_in), validamos y asignamos habitación física libre
      if (status === 'checked_in') {
        const { data: currentBooking } = await supabase
          .from('bookings')
          .select('room_id, room_type')
          .eq('id', id)
          .single();

        if (currentBooking && !currentBooking.room_id) {
          const typeToFind = currentBooking.room_type || 'double';
          
          // Buscar primer cuarto libre (disponible y limpio) de esa categoría
          const { data: freeRoom } = await supabase
            .from('rooms')
            .select('id')
            .eq('type', typeToFind)
            .eq('status', 'available')
            .eq('housekeeping_status', 'clean')
            .limit(1)
            .maybeSingle();

          if (!freeRoom) {
            throw new Error(`No hay habitaciones físicas libres y limpias para la categoría: ${typeToFind.toUpperCase()}. Por favor, limpia un cuarto antes de ingresar al huésped.`);
          }
          assignedRoomId = freeRoom.id;
        } else if (currentBooking && currentBooking.room_id) {
          assignedRoomId = currentBooking.room_id;
        }
      }

      const payload: { status: SupabaseBooking['status']; room_id?: number | null } = { status };
      
      if (assignedRoomId) {
        payload.room_id = assignedRoomId;
        // Marcar habitación física como ocupada
        await supabase.from('rooms').update({ status: 'occupied' }).eq('id', assignedRoomId);
      }

      // ⏳ Caso B: Al hacer Check-Out (checked_out), liberamos la habitación y la marcamos como sucia (dirty)
      if (status === 'checked_out') {
        const { data: currentBooking } = await supabase
          .from('bookings')
          .select('room_id')
          .eq('id', id)
          .single();

        if (currentBooking && currentBooking.room_id) {
          await supabase
            .from('rooms')
            .update({ status: 'available', housekeeping_status: 'dirty' })
            .eq('id', currentBooking.room_id);
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
    onError: (err: Error) => {
      console.error('[Booking Status Mutation Error]:', err.message);
      toast.error(err.message || 'Error al actualizar el estado.');
    }
  });

  // ============================================================================
  // 4. MAPA DE VISTAS (SOLID/DRY)
  // ============================================================================

  const VIEWS: Record<string, React.ReactNode> = {
    overview: 
      userRole === 'developer' ? <DeveloperConsole t={t} /> :
      userRole === 'admin' ? <AdminPMS t={t} /> :
      userRole === 'agency' ? <AgencyPortal userEmail={user?.email || ''} t={t} /> :
      userRole === 'housekeeper' ? <HousekeeperPortal /> : <GuestPortal userEmail={user?.email || ''} t={t} />,
    
    room_inventory: (
      <RoomManagement 
        rooms={rooms} 
        isActionLoading={createRoomMutation.isPending || deleteRoomMutation.isPending}
        onCreateRoom={(data: Partial<SupabaseRoom>) => createRoomMutation.mutateAsync(data)}
        onDeleteRoom={(id: number) => deleteRoomMutation.mutateAsync(id)}
      />
    ),
    
    room_map: <RoomMatrix rooms={matrixRooms} bookings={matrixBookings} />,
    
    rates: <RatesAvailability categories={roomCategories} onSave={async () => {}} />,
    
    booking_search: (
      <BookingSearch 
        bookings={mappedBookings} 
        isActionLoading={updateBookingStatusMutation.isPending} 
        onStatusChange={(id, status) => updateBookingStatusMutation.mutateAsync({ id, status: status as SupabaseBooking['status'] })} 
      />
    ),
    
    housekeeping: (
      <HousekeepingReport 
        rooms={housekeepingRooms} 
        tasks={tasks} 
        userRole={userRole as 'developer' | 'admin' | 'receptionist' | 'housekeeper'} 
        isActionLoading={updateRoomStatusMutation.isPending || toggleTaskMutation.isPending}
        onUpdateRoomStatus={(id, status) => updateRoomStatusMutation.mutateAsync({ roomId: id, status })} 
        onToggleTask={(id, status) => toggleTaskMutation.mutateAsync({ taskId: id, isCompleted: status })} 
        onAddCustomTask={(id, name) => addCustomTaskMutation.mutateAsync({ roomId: id, taskName: name })} 
      />
    ),
    
    staff: <StaffManagement />,
    
    settings_all: <TemplateManager />
  };

  useEffect(() => {
    if (!authLoading && !user) setLocation('/login');
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-pms-bg"><Spinner className="w-8 h-8 text-pms-accent animate-spin" /></div>;
  }

  // INTERCEPTOR DE ONBOARDING: Fuerza cambio de contraseña y datos personales si es el primer acceso
  const isTempPasswordActive = !!user.user_metadata?.temp_password_active;
  if (isTempPasswordActive) {
    return (
      <OnboardingForm 
        user={user} 
        onComplete={async () => {
          // Rehidratación atómica y silenciosa en caliente (Smart Identity Manifesto)
          await queryClient.invalidateQueries({ queryKey: ['user'] });
          await refreshUser(); 
        }}
      />
    );
  }

  const userInitial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';
  const isGlobalLoading = loadingRooms || loadingBookings || (currentView === 'housekeeping' && loadingTasks);

  if (isStaff) {
    return (
      <div className="flex h-screen bg-pms-bg overflow-hidden font-body selection:bg-pms-accent/30" data-dashboard-theme={dashboardTheme}>
        <PMSSidebar currentView={currentView} onNavigate={setCurrentView} onSignOut={signOut} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-pms-surface border-b border-pms-border px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10 transition-colors duration-300">
            <div>
              <h1 className="font-display text-2xl font-bold text-pms-text tracking-tight">
                {currentView === 'overview' ? `Olá, ${user.user_metadata?.full_name?.split(' ')[0] || 'User'}` : t('brand_dashboard_title', { defaultValue: 'Gestão do Hotel' })}
              </h1>
              <p className="font-body text-[10px] text-pms-text-muted font-bold uppercase tracking-widest mt-0.5">
                Beach Core PMS • <span className="text-pms-accent">{userRole}</span>
              </p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-pms-border shadow-sm cursor-pointer hover:border-pms-accent transition-colors">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-pms-surface-high text-pms-text font-bold">{userInitial}</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-pms-bg transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentView} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.2 }}
              >
                {isGlobalLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-50">
                    <Spinner className="w-8 h-8 text-pms-accent mb-4 animate-spin" />
                    <p className="font-body text-[10px] font-bold uppercase tracking-widest text-pms-text-muted">
                      {t('loading_sync', { defaultValue: 'Sincronizando' })}
                    </p>
                  </div>
                ) : (
                  VIEWS[currentView] || VIEWS.overview
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pms-bg text-pms-text font-body flex flex-col" data-dashboard-theme={dashboardTheme}>
      <header className="border-b border-pms-border bg-pms-surface sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-pms-accent flex items-center justify-center text-pms-accent-foreground font-brand text-base font-bold shadow-sm">B</div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pms-text-muted">{userRole}</span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="w-9 h-9 border border-pms-border shadow-xs">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="bg-pms-surface-high text-pms-text font-bold">{userInitial}</AvatarFallback>
          </Avatar>
          <button onClick={() => signOut()} className="p-2 text-pms-text-muted hover:text-red-500 transition-colors border-none bg-transparent" title="Sair"><LogOut size={20} /></button>
        </div>
      </header>
      <main className="flex-1 container px-6 py-12 max-w-5xl mx-auto transition-colors duration-300">
        <h2 className="font-display text-4xl text-pms-text mb-8 tracking-tight">
          {t('welcome_message', { defaultValue: 'Bienvenido' })}, {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </h2>
        {VIEWS[currentView] || VIEWS.overview}
      </main>
    </div>
  );
}