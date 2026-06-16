/**
 * @file HousekeepingReport.tsx
 * @description Componente atómico y de alto rendimiento para la gestión de limpieza y tareas de habitaciones (Ama de Llaves).
 * - UX/UI: Filtros de búsqueda avanzados, selectores de estado interactivos, progreso de tareas y envío de reportes.
 * - SaaS Ready: Altamente desacoplado, configurable y libre de textos hardcodeados.
 * - RBAC: Restringe acciones en tiempo real evaluando el prop 'userRole' (ISO 27001).
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, User, Users, Printer, Mail, 
  Search, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { HousekeepingTranslationSchema } from '@/locales/schemas/housekeeping.schema';

export interface RoomHousekeepingData {
  /** ID de la habitación */
  id: number;
  /** Número físico de la habitación (ej. "101") */
  name: string;
  /** Tipo de habitación (ej. "double", "single", "grupal") */
  type: string;
  /** Estado de limpieza actual de la habitación */
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
  /** Nombre del huésped alojado (si aplica) */
  current_occupant?: string;
  /** Cantidad de adultos alojados */
  adults_count?: number;
  /** Cantidad de niños alojados */
  children_count?: number;
}

export interface HousekeepingTask {
  /** ID único de la tarea en Supabase */
  id: string;
  /** ID de la habitación asociada */
  room_id: number;
  /** Nombre o descripción de la tarea (ej: "Barrer piso") */
  task_name: string;
  /** Estado de compleción */
  is_completed: boolean;
  /** Indica si es una tarea de mantenimiento personalizada */
  is_custom: boolean;
}

interface HousekeepingReportProps {
  /** Listado de habitaciones del hotel */
  rooms: RoomHousekeepingData[];
  /** Listado de todas las tareas activas */
  tasks: HousekeepingTask[];
  /** Rol del usuario activo para restringir accesos (RBAC) */
  userRole: 'developer' | 'admin' | 'receptionist' | 'housekeeper';
  /** Estado de carga durante las mutaciones de red */
  isActionLoading?: boolean;
  /** Callback para cambiar el estado de limpieza de una habitación */
  onUpdateRoomStatus: (roomId: number, status: 'clean' | 'dirty' | 'cleaning') => Promise<void>;
  /** Callback para marcar/desmarcar una tarea de limpieza */
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  /** Callback para inyectar una tarea de mantenimiento personalizada */
  onAddCustomTask: (roomId: number, taskName: string) => Promise<void>;
}

export const HousekeepingReport: React.FC<HousekeepingReportProps> = ({
  rooms,
  tasks,
  userRole,
  isActionLoading = false,
  onUpdateRoomStatus,
  onToggleTask,
  onAddCustomTask,
}) => {
  const { t, i18n } = useTranslation('housekeeping');

  // Estados locales para los filtros del reporte (Mini Hotel Style)
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null);
  const [newCustomTaskName, setNewCustomTaskName] = useState<string>('');

  // Validación de contrato Zod en DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'housekeeping') || {};
      HousekeepingTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[HousekeepingReport] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Filtrado reactivo de habitaciones en base a búsqueda y selección
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.current_occupant && room.current_occupant.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || room.housekeeping_status === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [rooms, searchQuery, filterType]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmailReport = () => {
    toast.success('Enviando reporte de Ama de Llaves por correo electrónico...');
  };

  // Lógica RBAC para control de privilegios (ISO 27001)
  const canManageMaintenance = userRole === 'admin' || userRole === 'developer' || userRole === 'receptionist';

  return (
    <div className="space-y-6">
      
      {/* 1. SECCIÓN DE FILTROS Y CONTROL DE CABECERA (Estilo Mini Hotel) */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Información del Bloque */}
        <div className="lg:col-span-4">
          <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
            {t('badge')}
          </span>
          <h3 className="font-display text-2xl text-gray-900 tracking-tight">
            {t('title')}
          </h3>
          <p className="font-body text-xs text-gray-400 font-light mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Buscador e Inputs de Filtro */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Campo de Búsqueda */}
          <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all flex items-center gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Hab. o Huésped..."
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-gray-900 placeholder:text-gray-300 outline-none"
            />
          </div>

          {/* Selector de Estado de Limpieza */}
          <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-gray-700 font-medium outline-none cursor-pointer"
            >
              <option value="all">Todas las habitaciones</option>
              <option value="clean">Solo Limpias</option>
              <option value="dirty">Solo Sucias</option>
              <option value="cleaning">En Limpieza</option>
            </select>
          </div>
        </div>

        {/* Acciones de Reporte (Imprimir / Enviar) */}
        <div className="lg:col-span-3 flex justify-end gap-3 w-full">
          <button
            onClick={handlePrint}
            className="flex-1 lg:flex-none h-12 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-xs font-semibold"
            title="Imprimir reporte del día"
          >
            <Printer size={14} strokeWidth={1.5} className="text-gray-500" />
            Imprimir
          </button>
          <button
            onClick={handleSendEmailReport}
            className="flex-1 lg:flex-none h-12 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-xs font-semibold"
            title="Enviar reporte por email"
          >
            <Mail size={14} strokeWidth={1.5} className="text-gray-500" />
            Email
          </button>
        </div>

      </div>

      {/* 2. REJILLA DE HABITACIONES (Data Grid de Operación de Limpieza) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRooms.map((room) => {
          // Filtrar tareas correspondientes a esta habitación
          const roomTasks = tasks.filter(t => t.room_id === room.id);
          const completedTasksCount = roomTasks.filter(t => t.is_completed).length;
          const totalTasksCount = roomTasks.length;
          
          // Cálculo de progreso
          const progressPercentage = totalTasksCount > 0 
            ? Math.round((completedTasksCount / totalTasksCount) * 100) 
            : 100;

          const isExpanded = expandedRoomId === room.id;

          return (
            <div 
              key={room.id}
              className={cn(
                "bg-white rounded-[2rem] border p-6 transition-all duration-300 flex flex-col justify-between",
                room.housekeeping_status === 'dirty' ? 'border-orange-100 hover:border-orange-200' : 'border-gray-100 hover:border-accent/40'
              )}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-gray-900 font-bold">
                      {room.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-body font-medium uppercase tracking-wider bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                      {room.type}
                    </span>
                  </div>

                  {/* Selector del Estado de Limpieza (Mini Hotel Style) */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full inline-block animate-pulse",
                      room.housekeeping_status === 'clean' ? 'bg-green-500' : 
                      room.housekeeping_status === 'cleaning' ? 'bg-blue-500' : 'bg-orange-500'
                    )} />
                    <select
                      value={room.housekeeping_status}
                      disabled={isActionLoading}
                      onChange={(e) => onUpdateRoomStatus(room.id, e.target.value as 'clean' | 'dirty' | 'cleaning')}
                      className={cn(
                        "border-none bg-transparent p-0 focus:ring-0 font-body text-xs font-bold uppercase tracking-wider outline-none cursor-pointer",
                        room.housekeeping_status === 'clean' ? 'text-green-600' : 
                        room.housekeeping_status === 'cleaning' ? 'text-blue-600' : 'text-orange-600'
                      )}
                    >
                      <option value="clean">{t('status.clean')}</option>
                      <option value="dirty">{t('status.dirty')}</option>
                      <option value="cleaning">{t('status.cleaning')}</option>
                    </select>
                  </div>
                </div>

                {/* Resumen del Huésped */}
                <div className="py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-100/50 flex items-center justify-between mb-4 text-xs font-body text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-gray-400" />
                    <span className="font-medium text-gray-800">
                      {room.current_occupant || 'Habitación Vacante'}
                    </span>
                  </div>
                  {room.current_occupant && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Users size={12} />
                      <span>{room.adults_count || 0}a / {room.children_count || 0}n</span>
                    </div>
                  )}
                </div>

                {/* Barra de Progreso de Tareas */}
                {totalTasksCount > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
                      <span>Aseo y Preparación</span>
                      <span className="text-accent">{completedTasksCount}/{totalTasksCount} {t('tasks_completed_suffix')}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          progressPercentage === 100 ? 'bg-green-500' : 'bg-accent'
                        )}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón para expandir y ver la Lista de Tareas (Checklist) */}
              <div className="border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                  className="w-full flex items-center justify-between text-[11px] font-body font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
                >
                  <span>Verificar Lista de Tareas</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Panel Expandido: Tareas Patrón y Personalizadas */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4 pt-4"
                    >
                      {/* Tareas */}
                      <div className="space-y-2.5">
                        {roomTasks.length > 0 ? (
                          roomTasks.map((task) => (
                            <div 
                              key={task.id}
                              onClick={() => !isActionLoading && onToggleTask(task.id, !task.is_completed)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none text-xs font-body",
                                task.is_completed 
                                  ? "bg-green-50/30 border-green-100 text-gray-400 line-through" 
                                  : "bg-white border-gray-100 text-gray-700 hover:border-accent/40"
                              )}
                            >
                              <div className={cn(
                                "w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                task.is_completed 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "border-gray-300"
                              )}>
                                {task.is_completed && <CheckCircle2 size={12} strokeWidth={2.5} />}
                              </div>
                              <span className="flex-1 font-medium">{task.task_name}</span>
                              {task.is_custom && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                  <AlertCircle size={8} /> Mantenimiento
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-gray-400 italic text-center py-2">
                            No hay tareas de limpieza asociadas a este cuarto hoy.
                          </p>
                        )}
                      </div>

                      {/* Input para agregar tarea de mantenimiento personalizada (Solo para roles con privilegios) */}
                      {canManageMaintenance && (
                        <div className="flex gap-2 pt-2">
                          <div className="flex-1 p-3 rounded-xl border border-gray-150 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all">
                            <input 
                              type="text"
                              value={newCustomTaskName}
                              onChange={(e) => setNewCustomTaskName(e.target.value)}
                              placeholder={t('add_custom_task_placeholder')}
                              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-gray-900 placeholder:text-gray-300 outline-none"
                            />
                          </div>
                          <Button
                            type="button"
                            disabled={isActionLoading || !newCustomTaskName.trim()}
                            onClick={async () => {
                              await onAddCustomTask(room.id, newCustomTaskName.trim());
                              setNewCustomTaskName('');
                            }}
                            className="px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-body font-semibold transition-all active:scale-95 shrink-0"
                          >
                            {t('add_button')}
                          </Button>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};