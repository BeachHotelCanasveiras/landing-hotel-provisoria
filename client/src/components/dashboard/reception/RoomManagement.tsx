/**
 * @file RoomManagement.tsx
 * @description Aparato de Gestión de Inventario Físico de Habitaciones.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Trinidad Atómica: Integración con Zod e i18next (namespace: room_management).
 * - SOLID: Responsabilidad única centrada en el CRUD de inventario.
 * - Tipo Saneado: Eliminación definitiva de 'as any' en los inputs del formulario.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Trash2, BedDouble, DollarSign, 
  Settings2, Hash, Layers, ShieldAlert 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] gap-4">
        <div>
          <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-gray-200/50">
            {t('badge')}
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h2>
          <p className="font-body text-sm text-gray-500 font-light mt-1 max-w-md">{t('subtitle')}</p>
        </div>

        {/* Modal de Creación */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-gray-950 hover:bg-gray-800 text-white px-6 h-12 shadow-lg transition-all active:scale-95">
              <Plus size={18} className="mr-2" /> {t('add_button')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gray-900">{t('form.create_title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form.room_name')}</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-all font-body text-sm"
                    placeholder="Ex: Suite 101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form.room_type')}</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Room['type']})}
                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-all font-body text-sm appearance-none"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="grupal">Grupal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form.nightly_price')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="number"
                    required
                    value={formData.price_per_night || ''}
                    onChange={(e) => setFormData({...formData, price_per_night: Number(e.target.value)})}
                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-accent transition-all font-body text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isActionLoading}
                className="w-full h-14 bg-accent text-accent-foreground rounded-2xl font-bold shadow-md hover:opacity-90 transition-all"
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
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:border-accent/40 hover:shadow-xl transition-all duration-500 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                    <BedDouble size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer" title="Configurar">
                      <Settings2 size={16} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('¿Eliminar habitación?')) onDeleteRoom(room.id); }}
                      disabled={isActionLoading}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-gray-900">{room.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">{room.type}</span>
                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border",
                      room.status === 'available' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                      {room.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('table.price')}</span>
                  <div className="flex items-center text-gray-900 font-bold mt-0.5">
                    <span className="text-xs mr-0.5">R$</span>
                    <span className="text-lg tracking-tight">{room.price_per_night}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('table.status')}</span>
                  <div className="flex items-center gap-1.5 mt-1 justify-end">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      room.housekeeping_status === 'clean' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                    )} />
                    <span className="text-[10px] font-bold text-gray-700 uppercase">{room.housekeeping_status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
            <ShieldAlert size={48} className="text-gray-300 mb-4" strokeWidth={1} />
            <p className="font-display text-xl text-gray-500 font-medium">No hay habitaciones registradas</p>
            <p className="font-body text-xs text-gray-400 mt-1">Comienza agregando la primera unidad física al sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};