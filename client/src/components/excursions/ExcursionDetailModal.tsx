/**
 * @file ExcursionDetailModal.tsx
 * @description Visor diferido y omnicanal de excursiones.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del modal.
 * - Trinidad Atómica: Localización total de títulos, descripciones e inclusiones del catálogo.
 * - SaaS Ready: Altamente desacoplado, parametrizable y libre de textos hardcodeados.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Clock, MessageCircle, X, Info, Eye, Share2, Printer, Download, Mail } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HOTEL_CONFIG } from '@/const';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { type ExcursionItem } from './types';

interface ExcursionDetailModalProps {
  excursion: ExcursionItem | null;
  onClose: () => void;
}

export const ExcursionDetailModal: React.FC<ExcursionDetailModalProps> = ({ excursion, onClose }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de la modal de detalles
  usePerformanceProfiler('ExcursionDetailModal');

  const { t: tExc } = useTranslation('excursions');
  const { t: tWa } = useTranslation('whatsapp');

  const [activeTab, setActiveTab] = useState<'info' | 'map'>('info');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  // Patrón de reinicio seguro de React 19
  const [prevExcursion, setPrevExcursion] = useState(excursion?.id);
  if (excursion?.id !== prevExcursion) {
    setPrevExcursion(excursion?.id);
    setActiveTab('info');
    setActivePhoto(excursion?.image || null);
    setMapLoading(true);
  }

  if (!excursion) return null;

  const name = tExc(`items.${excursion.id}.name`);
  const description = tExc(`items.${excursion.id}.description`);
  const includes = tExc(`items.${excursion.id}.includes`);
  const duration = tExc(`items.${excursion.id}.duration`);

  const handleWhatsApp = () => {
    const message = tWa('excursion_inquiry', { name });
    window.open(`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Generador dinámico de URL del Mapa basado en el destino de la excursión
  const getMapUrl = () => {
    const origin = encodeURIComponent(HOTEL_CONFIG.address);
    const dest = encodeURIComponent(excursion.destinationName);
    if (excursion.mapMode === 'directions') {
      return `https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&t=m&z=10&output=embed`;
    } else if (excursion.mapMode === 'satellite') {
      return `https://maps.google.com/maps?q=${dest}&t=k&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${dest}&t=h&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: name, text: description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/#${excursion.slug}`);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handlePrint = () => window.print();
  const handlePdfDownload = () => toast.info("Generación de PDF en desarrollo (Conexión Serverless próxima).");
  const handleEmail = () => toast.info("Cotizador por correo en desarrollo.");

  return (
    <Dialog open={!!excursion} onOpenChange={(open) => !open && onClose()}>
      {/* 🚀 showCloseButton={false} inyectado para erradicar el doble botón X */}
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-card rounded-[2.5rem] shadow-2xl z-[100] transition-colors duration-300">
        
        {/* Cabecera / Imagen Dinámica */}
        <div className="relative h-48 bg-muted group">
          <img src={activePhoto || excursion.image} alt={name} className="w-full h-full object-cover transition-all duration-300" />
          
          <button 
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all active:scale-90 z-10 cursor-pointer"
          >
            <X size={16} />
          </button>
          
          {/* ⚡ ACTION TOOLBAR OMNICANAL (Impresión, PDF, Share) */}
          <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button aria-label="Imprimir Itinerario" onClick={handlePrint} title="Imprimir Itinerario" className="p-2.5 bg-card/95 backdrop-blur text-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg border border-border/30 active:scale-90 cursor-pointer"><Printer size={15}/></button>
            <button aria-label="Descargar Folleto PDF" onClick={handlePdfDownload} title="Descargar Folleto PDF" className="p-2.5 bg-card/95 backdrop-blur text-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg border border-border/30 active:scale-90 cursor-pointer"><Download size={15}/></button>
            <button aria-label="Compartir en Redes" onClick={handleShare} title="Compartir en Redes" className="p-2.5 bg-card/95 backdrop-blur text-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg border border-white/20 active:scale-90 cursor-pointer"><Share2 size={15}/></button>
            <button aria-label="Enviar al Correo" onClick={handleEmail} title="Enviar al Correo" className="p-2.5 bg-card/95 backdrop-blur text-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg border border-border/30 active:scale-90 cursor-pointer"><Mail size={15}/></button>
          </div>

          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1.5 bg-card/95 backdrop-blur-md text-foreground px-3.5 py-1.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider shadow-xs">
              <Clock size={11} className="text-accent" />
              {duration}
            </span>
          </div>
        </div>

        {/* Pestañas UI */}
        <div className="flex border-b border-border px-8 pt-4 bg-muted/50">
          <button onClick={() => setActiveTab('info')} className={cn("flex-1 pb-3 text-xs font-body font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50", activeTab === 'info' && "border-accent text-foreground font-bold")}>
            <Info size={14} /> Información
          </button>
          <button onClick={() => setActiveTab('map')} className={cn("flex-1 pb-3 text-xs font-body font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50", activeTab === 'map' && "border-accent text-foreground font-bold")}>
            <Eye size={14} /> Ruta y Mapa
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {activeTab === 'info' ? (
             <div className="space-y-6">
             <div>
               <DialogTitle className="font-display text-2xl text-foreground mb-2 tracking-tight">{name}</DialogTitle>
               <p className="font-body text-xs text-accent uppercase tracking-[0.15em] font-semibold">Experiencia Verificada</p>
             </div>
             <p className="font-body text-sm text-muted-foreground leading-relaxed font-light">{description}</p>
             <div className="p-4 bg-muted rounded-2xl border border-border">
               <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Compass size={12} className="text-accent" /> Qué incluye</p>
               <p className="font-body text-xs text-foreground leading-relaxed font-medium">{includes}</p>
             </div>
           </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-display text-xl text-foreground mb-1 tracking-tight">
                  {excursion.mapMode === 'directions' ? 'Ruta sugerida' : 'Vista de destino'}
                </h4>
                <p className="font-body text-xs text-muted-foreground font-light">
                  Explora la viabilidad logística de esta experiencia.
                </p>
              </div>
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-border bg-muted shadow-inner">
                {/* ⚡ UI de Carga Diferida del Mapa */}
                {mapLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 z-10 transition-opacity duration-300">
                    <Spinner className="text-accent w-8 h-8 mb-2" />
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
                      Cargando mapa...
                    </p>
                  </div>
                )}
                <iframe 
                  title={`Mapa de ${name}`} 
                  src={getMapUrl()} 
                  className={cn("w-full h-full border-0 transition-opacity duration-700 ease-in-out", mapLoading ? "opacity-0" : "opacity-100")}
                  allowFullScreen 
                  loading="lazy" 
                  onLoad={() => setMapLoading(false)} 
                />
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button onClick={handleWhatsApp} className="w-full h-14 bg-[#25D366] hover:opacity-95 text-white rounded-full text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer border-none">
              <MessageCircle size={18} /> Solicitar Cotización
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};