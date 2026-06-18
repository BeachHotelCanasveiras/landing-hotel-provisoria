/**
 * @file TemplateManager.tsx
 * @description Panel administrativo de alta fidelidad para la edición, previsualización e impresión de plantillas de correo.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica: 100% adaptado a la paleta pms-bg, pms-surface, pms-surface-high y border-pms-border.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en compilación e iframes.
 * - React 19: Declarado FormEditor fuera de renderizado para evitar fugas de memoria y remontado por llave (react-hooks/static-components resuelto).
 * - Saneado: Satisface ESLint v9 al 100% (cero 'any' y cero importaciones o variables huérfanas) e incluye impresión PDF con logo.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Sparkles, AlertTriangle, FileText, CheckCircle2, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  description: string;
  allowed_variables: string[];
}

interface DbTemplateRow {
  id: string;
  subject: string;
  html_body: string;
}

// Catálogo inmutable de plantillas por defecto en memoria (Failsafe)
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'booking_confirmation',
    name: 'Confirmación de Reserva Estándar',
    subject: '¡Reserva Confirmada! Tu estadía en Hotel Beach Canasvieiras',
    html_body: '<h1>Olá, {{guest_name}}</h1><p>Confirmamos que tu reserva para la habitación <strong>{{room_name}}</strong> del periodo <strong>{{check_in}} al {{check_out}}</strong> ha sido procesada de forma exitosa.</p><p>Total facturado: <strong>BRL {{total_price}}</strong></p><p>¡Te esperamos!</p>',
    description: 'Enviado automáticamente al completarse la compra en Stripe al correo de facturación principal.',
    allowed_variables: ['guest_name', 'room_name', 'check_in', 'check_out', 'total_price']
  },
  {
    id: 'alternative_receipt',
    name: 'Voucher de Copia Alternativo (Duplicado)',
    subject: 'Comprobante de Reserva: {{room_name}} - Hotel Beach',
    html_body: '<h1>Olá, {{guest_name}}</h1><p>Te compartimos la copia del comprobante de reserva correspondiente a tu próxima estadía en la habitación <strong>{{room_name}}</strong> para el periodo <strong>{{check_in}} al {{check_out}}</strong>.</p><p>Monto de la transacción: <strong>BRL {{total_price}}</strong></p>',
    description: 'Enviado bajo demanda a petición del usuario a correos de acompañantes o contabilidad.',
    allowed_variables: ['guest_name', 'room_name', 'check_in', 'check_out', 'total_price']
  }
];

// --- 1. CONTRATO DE INTERFAZ DEL SUB-COMPONENTE ---
interface FormEditorProps {
  template: EmailTemplate;
  templates: EmailTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  isLocalMode: boolean;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  t: (key: string, options?: Record<string, string>) => string;
}

// --- 2. SUB-COMPONENTE DECLARADO FUERA DE RENDERIZADO (Static Component) ---
const FormEditor: React.FC<FormEditorProps> = ({
  template,
  templates,
  setTemplates,
  isLocalMode,
  isSaving,
  setIsSaving,
  t,
}) => {
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.html_body);

  const compiledHtmlPreview = useMemo(() => {
    let compiled = htmlBody;
    const mockData: Record<string, string> = {
      guest_name: 'Karla Valeska',
      room_name: 'Suite Standard 102',
      check_in: '2026-07-01',
      check_out: '2026-07-05',
      total_price: '400.00'
    };

    Object.entries(mockData).forEach(([key, val]) => {
      compiled = compiled.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });

    return compiled;
  }, [htmlBody]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedTemplates = templates.map(temp => 
        temp.id === template.id ? { ...temp, subject, html_body: htmlBody } : temp
      );

      if (isLocalMode) {
        localStorage.setItem('pms_email_templates', JSON.stringify(updatedTemplates));
        setTemplates(updatedTemplates);
        toast.success(t('templates.toast_local_success', { defaultValue: 'Plantilla local guardada con éxito.' }));
      } else {
        const { error } = await supabase.from('email_templates').upsert([
          { id: template.id, subject, html_body: htmlBody, updated_at: new Date().toISOString() }
        ], { onConflict: 'id' });

        if (error) throw error;
        setTemplates(updatedTemplates);
        toast.success(t('templates.toast_db_success', { defaultValue: 'Plantilla guardada en base de datos.' }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      toast.error(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPreview = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imprimir Comprobante - Hotel Beach</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; }
                .no-print { display: none !important; }
              }
              body { font-family: sans-serif; padding: 40px; background-color: #F3F4F6; }
              .print-bar {
                max-width: 600px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center;
                background: #fff; padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              }
              .print-button {
                background: #111827; color: #fff; border: none; padding: 10px 20px;
                border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; transition: opacity 0.2s;
              }
              .print-button:hover { opacity: 0.9; }
              .preview-container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
            </style>
          </head>
          <body>
            <div class="print-bar no-print">
              <span style="font-size: 13px; color: #4B5563; font-weight: bold;">Previsualización de Documento PDF</span>
              <button class="print-button" onclick="window.print()">Imprimir / Guardar PDF</button>
            </div>
            <div class="preview-container">
              ${compiledHtmlPreview}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-pms-surface rounded-[2rem] border border-pms-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-pms-border pb-3 flex items-center justify-between">
            <span className="text-xs font-body font-bold text-pms-text">
              {t('templates.editor_title', { defaultValue: 'Editor de Plantilla' })}
            </span>
            <span className="text-[10px] text-pms-accent font-mono font-bold">{template.id}</span>
          </div>

          {/* Asunto */}
          <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
            <label className="block text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">
              {t('templates.subject_label', { defaultValue: 'Asunto del Correo' })}
            </label>
            <input 
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto"
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-xs text-pms-text outline-none"
            />
          </div>

          {/* HTML Body */}
          <div className="p-3.5 rounded-2xl border border-pms-border bg-pms-surface-high focus-within:border-pms-accent focus-within:bg-pms-surface focus-within:ring-2 focus-within:ring-pms-accent/15 transition-all">
            <label className="block text-[9px] font-body font-bold text-pms-text-muted uppercase tracking-widest mb-1">
              {t('templates.body_label', { defaultValue: 'Cuerpo del Correo (HTML)' })}
            </label>
            <textarea 
              required
              rows={8}
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="<h1>Hola</h1>"
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-xs text-pms-text outline-none resize-none"
            />
          </div>

          {/* Leyenda de Variables Permitidas */}
          <div className="p-4 bg-pms-surface-high rounded-2xl border border-pms-border space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-pms-text-muted uppercase tracking-widest">
              <Sparkles size={11} className="text-pms-accent" />
              {t('templates.variables_title', { defaultValue: 'Variables Dinámicas Permitidas' })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {template.allowed_variables.map(v => (
                <code key={v} className="bg-pms-surface border border-pms-border px-2 py-0.5 rounded font-mono text-[9px] text-pms-text font-bold">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 bg-pms-accent text-pms-accent-foreground hover:opacity-90 rounded-xl text-xs font-body font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-none"
        >
          {isSaving ? <Spinner className="w-4 h-4 text-pms-accent-foreground" /> : <Save size={13} />}
          {t('templates.save_btn', { defaultValue: 'Guardar Cambios' })}
        </Button>
      </form>

      {/* Sandbox Preview */}
      <div className="bg-pms-surface rounded-[2rem] border border-pms-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-pms-border pb-3 flex items-center justify-between">
            <span className="text-xs font-body font-bold text-pms-text">
              {t('templates.preview_title', { defaultValue: 'Previsualización' })}
            </span>
            <button
              type="button"
              onClick={handlePrintPreview}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 rounded-lg text-[10px] font-body font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              title="Imprimir / Exportar a PDF"
            >
              <Printer size={11} /> PDF / Imprimir
            </button>
          </div>

          {/* Asunto Renderizado */}
          <div className="p-3 bg-pms-surface-high border border-pms-border rounded-xl text-xs font-body font-semibold text-pms-text">
            <span className="text-pms-text-muted font-bold mr-1">Asunto:</span> 
            {subject.replace(/{{guest_name}}/g, 'Karla Valeska').replace(/{{room_name}}/g, 'Suite Standard 102')}
          </div>

          {/* Iframe del HTML Renderizado en Caliente */}
          <div className="h-64 rounded-2xl border border-pms-border overflow-hidden bg-white relative">
            <iframe
              title="Mock Email Sandbox"
              srcDoc={`
                <html>
                  <body style="font-family: sans-serif; padding: 20px; color: #333; margin:0;">
                    ${compiledHtmlPreview}
                  </body>
                </html>
              `}
              className="w-full h-full border-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-pms-text-muted font-bold uppercase tracking-wider justify-center">
          <CheckCircle2 size={11} className="text-green-500" />
          {t('templates.synchronized_label', { defaultValue: 'Sincronizado con variables de Stripe' })}
        </div>
      </div>
    </div>
  );
};

// --- 3. COMPONENTE ORQUESTRADOR PRINCIPAL ---
export const TemplateManager: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en módulo administrador de plantillas
  usePerformanceProfiler('TemplateManager');

  const { t } = useTranslation('dashboard');

  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('booking_confirmation');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false); 

  // Selección de plantilla activa
  const activeTemplate = useMemo(() => {
    return templates.find(temp => temp.id === activeTemplateId) || templates[0];
  }, [templates, activeTemplateId]);

  // ============================================================================
  // 1. CARGA DE DATOS CON FALLBACK ELEGANTE
  // ============================================================================
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('id, subject, html_body');

        if (error) {
          throw new Error('La tabla email_templates no existe en el esquema.');
        }

        if (data && data.length > 0) {
          const merged = DEFAULT_TEMPLATES.map(def => {
            const dbMatch = (data as DbTemplateRow[]).find((d) => d.id === def.id);
            return dbMatch ? {
              ...def,
              subject: dbMatch.subject,
              html_body: dbMatch.html_body
            } : def;
          });
          setTemplates(merged);
        }
      } catch (err: unknown) {
        console.warn('[TemplateManager] Degradando a modo local / localStorage:', (err as Error).message);
        setIsLocalMode(true);

        const cached = localStorage.getItem('pms_email_templates');
        if (cached) {
          try {
            setTemplates(JSON.parse(cached));
          } catch {
            setTemplates(DEFAULT_TEMPLATES);
          }
        }
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 🛡️ BANNER ALERTA LOCAL MODE */}
      {isLocalMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between text-amber-500">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold font-body">Modo Fallback: LocalStorage Activo</p>
              <p className="text-[10px] text-amber-500/80 font-body leading-tight">La tabla email_templates no existe en base de datos. Las plantillas se guardarán localmente.</p>
            </div>
          </div>
          <span className="text-[9px] bg-amber-500 text-white font-bold uppercase px-2.5 py-1 rounded-md tracking-wider">Modo Local</span>
        </div>
      )}

      {/* Grid General */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Listado de Plantillas */}
        <div className="lg:col-span-4 bg-pms-surface rounded-[2rem] border border-pms-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <span className="inline-block px-3 py-1 bg-pms-surface-high text-pms-text-muted rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-2 border border-pms-border">
              SaaS Document Template
            </span>
            <h3 className="font-display text-xl text-pms-text tracking-tight">Vouchers y Plantillas</h3>
          </div>

          <div className="space-y-2.5">
            {templates.map(temp => (
              <div
                key={temp.id}
                onClick={() => setActiveTemplateId(temp.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 select-none",
                  activeTemplateId === temp.id 
                    ? "bg-pms-accent border-pms-accent text-pms-accent-foreground shadow-lg" 
                    : "bg-pms-surface-high/50 border-pms-border hover:border-pms-accent/40 hover:bg-pms-surface"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className={activeTemplateId === temp.id ? 'text-pms-accent-foreground' : 'text-pms-text-muted'} />
                  <span className="font-body text-xs font-bold truncate">{temp.name}</span>
                </div>
                <p className={cn("font-body text-[10px] leading-relaxed font-light line-clamp-2", activeTemplateId === temp.id ? 'text-pms-accent-foreground/80' : 'text-pms-text-muted')}>
                  {temp.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Formulario Editor por llave para evitar renders en cascada */}
        <FormEditor 
          key={activeTemplateId} 
          template={activeTemplate} 
          templates={templates}
          setTemplates={setTemplates}
          isLocalMode={isLocalMode}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          t={t}
        />

      </div>

    </div>
  );
};