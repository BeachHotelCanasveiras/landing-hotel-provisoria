/**
 * @file ContactSection.tsx
 * @description Sección de Formulario de Contacto (Cierre del Embudo).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del formulario de contacto.
 * - Refactorizado: Cumple con la regla react-hooks/immutability de React 19.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Mail, User, MessageSquare } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Button } from '@/components/ui/button';
import { ContactTranslationSchema } from '@/locales/schemas/contact.schema';
import { cn } from '@/lib/utils';

export default function ContactSection() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del formulario
  usePerformanceProfiler('ContactSection');

  const { t, i18n } = useTranslation('contact');

  // ============================================================================
  // CONTRATO DE INTERFAZ (ZOD) - ISO 27001
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'contact') || {};
      ContactTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[ContactSection] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Esquema dinámico de validación reactiva en el formulario
  const formSchema = z.object({
    name: z.string().min(1, { message: t('validation_name_required') }),
    email: z.string().email({ message: t('validation_email_invalid') }).min(1, { message: t('validation_email_required') }),
    message: z.string().min(1, { message: t('validation_message_required') }),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  /**
   * Procesa la sumisión del formulario de forma segura.
   */
  const onSubmit = (data: FormData) => {
    const subject = `Consulta web de ${data.name}`;
    const body = `${data.message}\n\n---\nEnviado por: ${data.name} (${data.email})`;
    
    const mailtoUrl = `mailto:reservas@beachcanasvieiras.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast.success(t('toast_success'));
    // CORRECCIÓN (react-hooks/immutability): Evita mutar window.location de forma directa
    window.open(mailtoUrl, '_self');
    reset();
  };

  return (
    <section id="contact-form" className="py-24 bg-muted/50 border-t border-border transition-colors duration-300">
      <div className="container px-4 sm:px-6 max-w-2xl mx-auto">
        
        {/* Cabecera */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-1.5 bg-muted text-foreground rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-border">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-5 tracking-tight">
            {t('title')}
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto text-base leading-relaxed font-light">
            {t('subtitle')}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-border">
          
          {/* Campo: Nombre */}
          <div className="space-y-2">
            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <User size={12} className="text-muted-foreground" />
              {t('name_label')}
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder={t('name_placeholder')}
              className={cn(
                "w-full h-12 px-4 rounded-2xl bg-muted border border-border font-body text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all",
                errors.name && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-body">{errors.name.message}</p>
            )}
          </div>

          {/* Campo: Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} className="text-muted-foreground" />
              {t('email_label')}
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder={t('email_placeholder')}
              className={cn(
                "w-full h-12 px-4 rounded-2xl bg-muted border border-border font-body text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all",
                errors.email && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-body">{errors.email.message}</p>
            )}
          </div>

          {/* Campo: Mensaje */}
          <div className="space-y-2">
            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={12} className="text-muted-foreground" />
              {t('message_label')}
            </label>
            <textarea
              rows={4}
              {...register('message')}
              placeholder={t('message_placeholder')}
              className={cn(
                "w-full p-4 rounded-2xl bg-muted border border-border font-body text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none focus:bg-card focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all",
                errors.message && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
            />
            {errors.message && (
              <p className="text-xs text-red-500 font-body">{errors.message.message}</p>
            )}
          </div>

          {/* Botón de Envío */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-body font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {t('submit_button')}
          </Button>

        </form>
      </div>
    </section>
  );
}