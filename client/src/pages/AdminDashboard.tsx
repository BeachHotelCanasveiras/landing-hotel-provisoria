/**
 * @file AdminDashboard.tsx
 * @description Orquestador Maestro del Panel de Control (PMS & Portales).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Interceptor de Onboarding: Bloqueo perimetral reactivo con refresco en caliente de sesión.
 * - Saneamiento de ESLint v9: Cero aserciones implícitas o explícitas de tipo 'any'.
 * - Smart Identity Manifesto: Reemplazado window.location.reload() por rehidratación silenciosa mediante refreshUser().
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

// Sincronización e importación de componentes de inventario y onboarding
import { RoomManagement } from '@/components/dashboard/reception/RoomManagement';
import { OnboardingForm } from '@/components/dashboard/reception/OnboardingForm';

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
  room_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  rooms?: { name: string };
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

export default function AdminDashboard() {
  const { t } = useTranslation(['dashboard', 'housekeeping']);
  const [, setLocation] = useLocation();
  const { user, role, signOut, refreshUser, loading: authLoading } = useAuth(); // Consumo del refreshUser
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
      roomName: b.rooms?.name || `Habitación ${b.room_id}`,
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
      .filter((b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'pending')
      .map((b) => ({
        id: b.id,
        room_id: b.room_id,
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

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupabaseBooking['status'] }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (err: Error) => toast.error(`Error: ${err.message}`)
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
    
    staff: <StaffManagement />
  };

  useEffect(() => {
    if (!authLoading && !user) setLocation('/login');
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><Spinner className="w-8 h-8 text-accent animate-spin" /></div>;
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
      <div className="flex h-screen bg-gray-50 overflow-hidden font-body selection:bg-accent/30">
        <PMSSidebar currentView={currentView} onNavigate={setCurrentView} onSignOut={signOut} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
                {currentView === 'overview' ? `Olá, ${user.user_metadata?.full_name?.split(' ')[0] || 'User'}` : 'Gestão do Hotel'}
              </h1>
              <p className="font-body text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Beach Core PMS • <span className="text-accent">{userRole}</span>
              </p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-gray-100 shadow-sm cursor-pointer hover:border-accent transition-colors">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-gray-900 text-white font-bold">{userInitial}</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
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
                    <Spinner className="w-8 h-8 text-accent mb-4 animate-spin" />
                    <p className="font-body text-[10px] font-bold uppercase tracking-widest">Sincronizando</p>
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-brand text-base font-bold shadow-sm">B</div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">{userRole}</span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="w-9 h-9 border border-gray-100 shadow-xs">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="bg-gray-950 text-white font-bold">{userInitial}</AvatarFallback>
          </Avatar>
          <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sair"><LogOut size={20} /></button>
        </div>
      </header>
      <main className="flex-1 container px-6 py-12 max-w-5xl mx-auto">
        <h2 className="font-display text-4xl text-gray-900 mb-8 tracking-tight">Bienvenido, {user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
        {VIEWS[currentView] || VIEWS.overview}
      </main>
    </div>
  );
}