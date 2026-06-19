/**
 * @file StaffTable.tsx
 * @description Presentador atómico (Dumb Component) para el listado de personal en el PMS.
 * Optimizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% acoplado a la paleta pms-surface, border-pms-border y text-pms-text.
 * - Rendimiento: Renderizado condicional asistido por AnimatePresence para transiciones fluidas.
 * - A11y & Responsivo: Scroll horizontal suave con badges de alto contraste multitono.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Send, ShieldAlert, Edit2, Trash2, Globe } from 'lucide-react'; // ✅ Saneamiento: 'Globe' inyectado en las importaciones
import { Spinner } from "@/components/ui/spinner";
import { cn } from '@/lib/utils';
import { type StaffMember } from './index'; // Se resolverá a través del barril

interface StaffTableProps {
  /** Listado de funcionarios cruzado con sus roles */
  staffList: StaffMember[];
  /** Estado de carga de la sincronización de datos */
  loadingList: boolean;
  /** Estado de carga de transacciones activas de red (CRUD) */
  isActionLoading: boolean;
  /** Callback para abrir el expediente del funcionario (Ficha de Personal) */
  onSelectFicha: (member: StaffMember) => void;
  /** Callback para abrir el modal de reset manual de contraseña */
  onSelectReset: (member: StaffMember) => void;
  /** Callback para generar el Magic Link de primer acceso */
  onGenerateLink: (member: StaffMember) => void;
  /** Callback para iniciar la edición de un funcionario */
  onEdit: (member: StaffMember) => void;
  /** Callback para eliminar de forma administrativa un funcionario */
  onDelete: (member: StaffMember) => void;
  /** Función de traducción del componente padre */
  t: (key: string, options?: Record<string, string | number>) => string;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
  loadingList,
  isActionLoading,
  onSelectFicha,
  onSelectReset,
  onGenerateLink,
  onEdit,
  onDelete,
  t,
}) => {
  if (loadingList) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-pms-text-muted bg-pms-surface rounded-[2rem] border border-pms-border">
        <Spinner className="w-8 h-8 text-pms-accent mb-3 animate-spin" />
        <span className="text-[10px] font-body font-bold uppercase tracking-widest">
          Sincronizando Banco de Dados...
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-pms-border bg-pms-surface transition-colors duration-300">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-pms-surface-high/50 border-b border-pms-border text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest">
            <th className="p-4 text-left">{t('table.columns.name', { defaultValue: 'Funcionario / Email' })}</th>
            <th className="p-4 text-center">{t('table.columns.role', { defaultValue: 'Cargo / Rol' })}</th>
            <th className="p-4 text-center">{t('table.columns.contact', { defaultValue: 'Contato' })}</th>
            <th className="p-4 text-center">{t('table.columns.residence', { defaultValue: 'Residencia' })}</th>
            <th className="p-4 text-center">{t('table.columns.actions', { defaultValue: 'Acciones de Soporte' })}</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-pms-border text-xs font-body">
          <AnimatePresence mode="popLayout">
            {staffList.length > 0 ? (
              staffList.map((member) => (
                <motion.tr
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-pms-surface-high/30 transition-colors"
                >
                  {/* Nombre Clickable para Ficha de Personal */}
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => onSelectFicha(member)}
                      className="font-semibold text-pms-accent hover:underline text-left border-none bg-transparent outline-none cursor-pointer block p-0"
                      title="Ver Ficha de Personal Completa"
                    >
                      {member.first_name} {member.paternal_last_name}
                    </button>
                    <p className="text-[10px] text-pms-text-muted mt-0.5">{member.email}</p>
                  </td>

                  {/* Cargo / Rol de Seguridad (RBAC) */}
                  <td className="p-4 text-center">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider border",
                      member.role === 'admin' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-pms-accent/10 text-pms-accent border-pms-accent/20'
                    )}>
                      {member.role}
                    </span>
                  </td>

                  {/* Teléfono */}
                  <td className="p-4 text-center text-pms-text">
                    <div className="flex items-center justify-center gap-1.5">
                      <Phone size={11} className="text-pms-text-muted" />
                      <span>{member.phone || 'S/T'}</span>
                    </div>
                  </td>

                  {/* Procedencia */}
                  <td className="p-4 text-center text-pms-text-muted">
                    <div className="flex items-center justify-center gap-1.5">
                      <Globe size={11} />
                      <span>{member.address || 'S/A'}</span>
                    </div>
                  </td>

                  {/* Acciones de Soporte CRUD Completo */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Editar Ficha */}
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => onEdit(member)}
                        className="p-1.5 hover:bg-pms-surface-high border border-pms-border text-pms-text-muted hover:text-pms-text rounded-lg transition-all active:scale-95 disabled:opacity-30 cursor-pointer bg-transparent"
                        title="Editar Datos"
                      >
                        <Edit2 size={12} />
                      </button>

                      {/* Dar de Baja (Eliminar) */}
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => onDelete(member)}
                        className="p-1.5 hover:bg-red-500/10 border border-pms-border text-pms-text-muted hover:text-red-500 rounded-lg transition-all active:scale-95 disabled:opacity-30 cursor-pointer bg-transparent"
                        title="Excluir do Sistema"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="w-px h-4 bg-pms-border mx-1" />

                      {/* Reset Password */}
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => onSelectReset(member)}
                        className="px-3 py-1.5 bg-pms-surface-high hover:bg-pms-surface border border-pms-border text-pms-text-muted hover:text-pms-text text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
                        title="Forçar Nova Senha"
                      >
                        <Lock size={10} className="inline mr-1" /> Reset
                      </button>

                      {/* Magic Link */}
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => onGenerateLink(member)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-pms-accent/10 hover:bg-pms-accent/20 text-pms-accent border border-pms-accent/20 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
                        title="Enviar Link de Acesso"
                      >
                        <Send size={10} /> Link
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-pms-text-muted font-body text-xs font-light">
                  <ShieldAlert className="w-8 h-8 text-pms-accent mx-auto mb-3" strokeWidth={1.5} />
                  {t('table.no_records', { defaultValue: 'Nenhum funcionário cadastrado no sistema.' })}
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};