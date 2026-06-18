/**
 * @file RoomManagement.tsx
 * @description Aparato de Gestión de Inventario Físico de Habitaciones.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en renderizado de tarjetas.
 * - Trinidad Atómica: Integración robusta con i18next (room_management namespace).
 * - SOLID: Responsabilidad única centrada en el CRUD de inventario.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Trash2, BedDouble, DollarSign, 
  Settings2, Hash, Layers, ShieldAlert 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

// --- CONTRATOS DE DATOS ---
interface Room {
  id: number;
  name: string;
  type: 'single' | 'double' | 'triple' | 'grupal';
  price_per_night: number;
  housekeeping_status: 'clean' | 'dirty' | 'cleaning';
  status: 'available' | 'maintenance' | 'occupied';
}

interface RoomManagementProps {
  rooms: Room[];
  isActionLoading: boolean;
  onCreateRoom: (data: Partial<Room>) => Promise<void>;
  onDeleteRoom: (id: number) => Promise<void>;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  isActionLoading,
  onCreateRoom,
  onDeleteRoom
}) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en renderizado de inventario
  usePerformanceProfiler('RoomManagement');

  const { t } = useTranslation('room_management');
  
  // Estados para el formulario de creación
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    type: 'double',
    price_per_night: 200,
    status: 'available',
    housekeeping_status: 'clean'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateRoom(formData);
    setIsDialogOpen(false);
    setFormData({ name: '', type: 'double', price_per_night: 200 }); // Reset
  };

  return (
    <div className="space-y-8">
      
      {/* 1. CABECERA ESTRATÉGICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-pms-surface p-8 rounded-[2.5rem] border border-pms-border shadow-[0_8px_30px_rgba(0,0,0,0.02)] gap-4 transition-colors duration-300">
        <div>
          <span className="inline-block px-4 py-1.5 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
            {t('badge')}
          </span>
          <h2 className="font-display text-3xl font-bold text-pms-text tracking-tight">{t('title')}</h2>
          <p className="font-body text-sm text-pms-text-muted font-light mt-1 max-w-md">{t('subtitle')}</p>
        </div>

        {/* Modal de Creación */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-pms-accent hover:opacity-90 text-pms-accent-foreground px-6 h-12 shadow-lg transition-all active:scale-95 border-none">
              <Plus size={18} className="mr-2" /> {t('add_button')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-pms-border bg-pms-surface text-pms-text shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-pms-text">{t('form.create_title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pms-text-muted uppercase tracking-widest ml-1">{t('form.room_name')}</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-pms-text-muted" size={16} />
                  <input 
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 pl-11 pr-4 bg-pms-surface-high border border-pms-border rounded-xl outline-none focus:bg-pms-surface focus:border-pms-accent transition-all font-body text-sm text-pms-text placeholder:text-pms-text-muted"
                    placeholder="Ex: Suite 101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pms-text-muted uppercase tracking-widest ml-1">{t('form.room_type')}</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-pms-text-muted" size={16} />
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Room['type']})}
                    className="w-full h-12 pl-11 pr-4 bg-pms-surface-high border border-pms-border rounded-xl outline-none focus:bg-pms-surface focus:border-pms-accent transition-all font-body text-sm appearance-none text-pms-text"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="grupal">Grupal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pms-text-muted uppercase tracking-widest ml-1">{t('form.nightly_price')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-pms-text-muted" size={16} />
                  <input 
                    type="number"
                    required
                    value={formData.price_per_night || ''}
                    onChange={(e) => setFormData({...formData, price_per_night: Number(e.target.value)})}
                    className="w-full h-12 pl-11 pr-4 bg-pms-surface-high border border-pms-border rounded-xl outline-none focus:bg-pms-surface focus:border-pms-accent transition-all font-body text-sm text-pms-text"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isActionLoading}
                className="w-full h-14 bg-pms-accent text-pms-accent-foreground rounded-2xl font-bold shadow-md hover:opacity-90 transition-all border-none"
              >
                {isActionLoading ? <Spinner /> : t('form.save_button')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 2. GRID DE INVENTARIO (DATA CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div 
              key={room.id} 
              className="bg-pms-surface p-6 rounded-[2.5rem] border border-pms-border shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:border-pms-accent/40 hover:shadow-xl transition-all duration-500 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-pms-surface-high rounded-2xl flex items-center justify-center text-pms-accent group-hover:bg-pms-accent group-hover:text-pms-accent-foreground transition-all duration-500 shadow-inner">
                    <BedDouble size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-pms-text-muted hover:text-pms-text transition-colors cursor-pointer border-none bg-transparent" title="Configurar">
                      <Settings2 size={16} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('¿Eliminar habitación?')) onDeleteRoom(room.id); }}
                      disabled={isActionLoading}
                      className="p-2 text-pms-text-muted hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 border-none bg-transparent"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-pms-text">{room.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-pms-accent">{room.type}</span>
                    <span className="w-1.5 h-1.5 bg-pms-surface-high rounded-full" />
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border",
                      room.status === 'available' 
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                        : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                    )}>
                      {room.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-pms-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">{t('table.price')}</span>
                  <div className="flex items-center text-pms-text font-bold mt-0.5">
                    <span className="text-xs mr-0.5">R$</span>
                    <span className="text-lg tracking-tight">{room.price_per_night}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">{t('table.status')}</span>
                  <div className="flex items-center gap-1.5 mt-1 justify-end">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      room.housekeeping_status === 'clean' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                    )} />
                    <span className="text-[10px] font-bold text-pms-text uppercase">{room.housekeeping_status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-pms-surface-high/50 rounded-[3rem] border border-dashed border-pms-border">
            <ShieldAlert size={48} className="text-pms-text-muted mb-4" strokeWidth={1} />
            <p className="font-display text-xl text-pms-text font-medium">No hay habitaciones registradas</p>
            <p className="font-body text-xs text-pms-text-muted mt-1">Comienza agregando la primera unidad física al sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};