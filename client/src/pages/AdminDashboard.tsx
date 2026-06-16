/**
 * @file AdminDashboard.tsx
 * @description Orquestador Maestro del Panel de Control (PMS & Portales).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Layout Híbrido: Sidebar inmersiva para Staff, Top-Nav para Clientes.
 * - Saneamiento de tipado estricto TS (100% libre de aserciones 'any' o variables huérfanas).
 * - Saneamiento de react-hooks/rules-of-hooks: Cero retornos tempranos.
 * - Integración del Portal de Limpieza y el Administrador de Personal de Élite (StaffManagement).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

import { GuestPortal, AgencyPortal, AdminPMS, DeveloperConsole } from '@/components/dashboard';
import { PMSSidebar } from '@/components/dashboard/PMSSidebar';
import { RoomMatrix } from '@/components/dashboard/reception/RoomMatrix';
import { RatesAvailability } from '@/components/dashboard/reception/RatesAvailability';
import { BookingSearch, type BookingRecord } from '@/components/dashboard/reception/BookingSearch';
import { HousekeepingReport, type HousekeepingTask } from '@/components/dashboard/reception/HousekeepingReport';
import { HousekeeperPortal } from '@/components/dashboard/HousekeeperPortal';
import { StaffManagement } from '@/components/dashboard/reception/StaffManagement'; // <-- IMPORTACIÓN DEL PORTAL DE PERSONAL

// Importación contractual de tipos específicos de los sub-paneles para evitar casteos inseguros
import { type RoomHousekeepingData } from '@/components/dashboard/reception/HousekeepingReport';

// ----------------------------------------------------------------------------
// Interfaces Locales Estructuradas (Duck Typing - Resuelve TS2459)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Interfaces Internas Estrictas de Supabase
// ----------------------------------------------------------------------------
interface SupabaseRoom {
  id: number;
  name: string;
  type: 'single' | 'double' | 'triple' | 'grupal';
  price_per_night: number;
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
  current_occupant?: string;
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

export default function AdminDashboard() {
  const { t } = useTranslation('dashboard');
  const [, setLocation] = useLocation();
  const { user, role, signOut, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [profileOpen, setProfileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>('overview');

  const currentRoleString = String(role);
  
  // Saneamiento de Roles (isStaff ahora es exclusivo de personal administrativo de escritorio)
  const isStaff = ['admin', 'developer', 'receptionist'].includes(currentRoleString);

  // ============================================================================
  // 1. DATA FETCHING (TanStack Query) - Declarados SIEMPRE en el mismo orden
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
    enabled: (isStaff || currentRoleString === 'housekeeper') && !!user,
  });

  // ============================================================================
  // 2. DATA MAPPING (Mapeos seguros)
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

  // Conversión de tipos limpia para RoomMatrix sin usar 'any'
  const matrixRooms: MatrixRoom[] = useMemo(() => {
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      housekeeping_status: r.housekeeping_status,
    }));
  }, [rooms]);

  // Mapeo seguro de reservas activas para el calendario de RoomMatrix
  const matrixBookings: MatrixBooking[] = useMemo(() => {
    return rawBookings
      .filter((b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'pending')
      .map((b) => {
        const guestName = b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Huésped';
        return {
          id: b.id,
          room_id: b.room_id,
          guest_name: guestName,
          check_in: b.check_in,
          check_out: b.check_out,
          status: (b.status === 'pending' ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
        };
      });
  }, [rawBookings]);

  const roomCategories: RatesCategory[] = useMemo(() => {
    const cats: Record<string, { id: string; name: string; total_inventory: number; base_price_brl: number }> = {};
    rooms.forEach(r => {
      if (!cats[r.type]) {
        cats[r.type] = { id: r.type, name: r.type.toUpperCase(), total_inventory: 0, base_price_brl: 0 };
      }
      cats[r.type].total_inventory += 1;
      cats[r.type].base_price_brl = Number(r.price_per_night) || 200; 
    });
    return Object.values(cats);
  }, [rooms]);

  // Conversión limpia para Housekeeping (Principio de Responsabilidad Única)
  const housekeepingRooms: RoomHousekeepingData[] = useMemo(() => {
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      housekeeping_status: r.housekeeping_status,
      current_occupant: r.current_occupant,
    }));
  }, [rooms]);

  // ============================================================================
  // 3. MUTACIONES DE RED
  // ============================================================================

  const updateRoomStatusMutation = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number, status: string }) => {
      const { error } = await supabase.from('rooms').update({ housekeeping_status: status }).eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] });
      toast.success('Estado de limpieza actualizado.');
    },
    onError: () => toast.error('Error al actualizar la habitación.')
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) => {
      const { error } = await supabase.from('housekeeping_tasks').update({ is_completed: isCompleted }).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] }),
    onError: () => toast.error('Error al actualizar la tarea.')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] });
      toast.success('Tarea de mantenimiento añadida.');
    },
    onError: () => toast.error('Error al inyectar la tarea.')
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Estado de la reserva actualizado.');
    },
    onError: () => toast.error('Error al actualizar reserva.')
  });

  // ============================================================================
  // 4. CONTROLADORES DE SESIÓN, REDIRECCIÓN PROTEGIDA Y RENDER
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  const isGlobalLoading = loadingRooms || loadingBookings || loadingTasks;
  const userInitial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';

  const renderContent = () => {
    if (isGlobalLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] opacity-50">
          <Spinner className="w-10 h-10 text-accent mb-4" />
          <p className="font-body text-xs uppercase tracking-widest text-gray-500 font-bold">Sincronizando Sistema</p>
        </div>
      );
    }

    switch (currentView) {
      case 'room_map':
        return (
          <RoomMatrix 
            rooms={matrixRooms} 
            bookings={matrixBookings} 
            onManualAllocate={(id, date) => toast.info(`Asignando manual en Hab ${id} para ${date}`)} 
          />
        );
      case 'rates':
        return (
          <RatesAvailability 
            categories={roomCategories} 
            onSave={async () => { await new Promise(r => setTimeout(r, 1000)); }} 
          />
        );
      case 'booking_search':
        return (
          <BookingSearch 
            bookings={mappedBookings} 
            isActionLoading={updateBookingStatusMutation.isPending} 
            onStatusChange={(id, status) => updateBookingStatusMutation.mutateAsync({ bookingId: id, status })} 
          />
        );
      case 'housekeeping':
        return (
          <HousekeepingReport 
            rooms={housekeepingRooms} 
            tasks={tasks} 
            userRole={currentRoleString as 'developer' | 'admin' | 'receptionist' | 'housekeeper'} 
            isActionLoading={updateRoomStatusMutation.isPending || toggleTaskMutation.isPending} 
            onUpdateRoomStatus={(id, status) => updateRoomStatusMutation.mutateAsync({ roomId: id, status })} 
            onToggleTask={(id, status) => toggleTaskMutation.mutateAsync({ taskId: id, isCompleted: status })} 
            onAddCustomTask={(id, name) => addCustomTaskMutation.mutateAsync({ roomId: id, taskName: name })} 
          />
        );
      case 'settings_staff': // <-- VISTA ENRUTADA PARA EL GESTOR DE PERSONAL
      case 'staff':
        return <StaffManagement />;
      case 'overview':
      default:
        if (currentRoleString === 'developer') return <DeveloperConsole t={t} />;
        if (currentRoleString === 'admin') return <AdminPMS t={t} />;
        if (currentRoleString === 'agency') return <AgencyPortal userEmail={user.email || ''} t={t} />;
        if (currentRoleString === 'housekeeper') return <HousekeeperPortal />;
        return <GuestPortal userEmail={user.email || ''} t={t} />;
    }
  };

  // ============================================================================
  // 5. RENDERIZADO HÍBRIDO (Layout Inmersivo vs Portal)
  // ============================================================================

  if (isStaff) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-body selection:bg-accent/30">
        <PMSSidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          onSignOut={handleLogout} 
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
                {currentView === 'overview' ? `Hola, ${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}` : t(`views.${currentRoleString}.title`) || 'Panel Operativo'}
              </h1>
              <p className="font-body text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Beach Core PMS • Rol: <span className="text-accent">{currentRoleString}</span>
              </p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-gray-100 shadow-sm cursor-pointer hover:border-accent transition-colors">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-gray-900 text-white font-body font-bold text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  // PORTAL SIMPLE (Aplica para Hóspedes, Agencias y el nuevo Portal de Limpieza 'housekeeper')
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body selection:bg-accent/30 flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-brand text-base font-bold shadow-xs">
            B
          </div>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            {currentRoleString === 'agency' ? t('views.agency.title') : currentRoleString === 'housekeeper' ? t('housekeeping:title', { defaultValue: 'Portal de Limpieza' }) : t('views.guest.title')}
          </span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-all active:scale-95"
            aria-label="Menú de perfil"
          >
            <Avatar className="w-9 h-9 border border-gray-100 shadow-sm cursor-pointer">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-gray-950 text-white font-body font-bold text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl p-2 shadow-xl z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400 font-light">Autenticado como:</p>
                  <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[9px] font-bold uppercase tracking-wider mt-2 border border-gray-100">
                    {currentRoleString}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 mt-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  {t('logout_button')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <main className="flex-1 container px-6 py-12 max-w-5xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em] mb-2">
            Beach Hotel Canasvieiras
          </p>
          <h2 className="font-display text-4xl text-gray-900 tracking-tight">
            {t('welcome_message')} {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </h2>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}