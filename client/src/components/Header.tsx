/**
 * @file Header.tsx
 * @description Componente de navegación principal estilo "Píldora Flotante" (Floating Pill).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Se integra el nuevo enlace activo de "Excursiones" en móviles y escritorios.
 * - Doble canal de conversión (CTA Reservar lanza modal, CTA Contáctanos desplaza a formulario).
 * - Selector de idioma flotante visible en móviles (UX accesible de alta fidelidad).
 * - Textos traducidos dinámicamente y libres de hardcoding.
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Globe, PhoneCall } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { StorageService } from '@/lib/storage';
import BookingDialog from './BookingDialog';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { t, i18n } = useTranslation('nav');
  const langMenuRef = useRef<HTMLDivElement>(null);

  /**
   * Manejador para el cambio de idioma.
   * Cambia el estado de i18n, actualiza el tag HTML y guarda en Cookie.
   */
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    StorageService.setCookie('beach_hotel_lang', lang);
    setIsOpen(false);
    setIsLangOpen(false);
  };

  // Cerrar el mini-menú de idiomas al hacer clic fuera (Elegancia de Interacción)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Rutas de navegación consumiendo traducciones dinámicas.
   */
  const navItems = [
    { label: t('home'), href: '#home' },
    { label: t('rooms'), href: '#rooms' },
    { label: t('gallery'), href: '#gallery' },
    { label: t('attractions'), href: '#attractions' },
    { label: t('excursions'), href: '#excursions' },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const menuVariants: Variants = {
    closed: { 
      opacity: 0, 
      y: -10,
      scale: 0.98,
      pointerEvents: 'none',
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
    },
    open: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      pointerEvents: 'auto',
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, y: -10 },
    open: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.05, duration: 0.4 } 
    }),
  };

  return (
    <>
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="relative pointer-events-auto w-full max-w-5xl bg-black/85 backdrop-blur-lg border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-full pl-5 pr-4 py-3 grid grid-cols-12 items-center transition-all duration-500">
          
          {/* Columna 1: Logotipo (Desktop: col-span-3, Mobile: col-span-6) */}
          <div className="col-span-6 lg:col-span-2 flex justify-start items-center">
            <motion.a
              href="#home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center shrink-0"
            >
              <Logo 
                variant="logo-main" 
                theme="light" 
                className="h-6.5 md:h-[30px] origin-left" 
              />
            </motion.a>
          </div>

          {/* Columna 2: Menú de Navegación Unificado (Solo Desktop: col-span-6 - espaciado equilibrado para 5 pestañas) */}
          <div className="hidden lg:flex col-span-6 justify-center items-center gap-5 xl:gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white font-display text-[13px] xl:text-[14px] font-medium tracking-wide transition-all duration-300 ease-in-out hover:-translate-y-[1.5px] transform relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-400 ease-out" />
              </a>
            ))}
          </div>

          {/* Columna 3: Idioma + CTA (Desktop: col-span-4, Mobile: col-span-6) */}
          <div className="col-span-6 lg:col-span-4 flex justify-end items-center gap-2 sm:gap-3">
            
            {/* Selector de Idioma Desktop - Códigos Regionales */}
            <div className="hidden lg:flex items-center gap-2 border-r border-white/20 pr-4 mr-1">
              <Globe size={14} className="text-gray-400" />
              {[
                { code: 'es-ES', label: 'es' },
                { code: 'en-US', label: 'en' },
                { code: 'pt-BR', label: 'pt' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`text-[10px] font-body font-bold uppercase tracking-widest transition-colors ${
                    i18n.language === lang.code ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Selector de Idioma Flotante en Móviles (UX Peak) */}
            <div className="relative lg:hidden" ref={langMenuRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 text-white rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                aria-label="Cambiar idioma"
              >
                <Globe size={16} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 bg-black/95 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-xl z-50 min-w-[100px]"
                  >
                    {[
                      { code: 'es-ES', label: 'ESP' },
                      { code: 'en-US', label: 'ENG' },
                      { code: 'pt-BR', label: 'POR' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-3 py-2 text-left rounded-xl text-xs font-body font-semibold uppercase tracking-wider transition-colors ${
                          i18n.language === lang.code ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón Contáctanos (Desktop) */}
            <a
              href="#contact-form"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 border border-white/20 text-white hover:border-accent hover:text-accent rounded-full font-body text-xs font-semibold transition-all duration-300"
            >
              <PhoneCall size={12} />
              {t('contact_us')}
            </a>

            {/* Botón Reservar (Desktop & Mobile) */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-4 sm:px-5 py-2 bg-white text-gray-950 hover:bg-gray-100 rounded-full font-body text-xs font-semibold transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              {t('book_now')}
            </button>

            {/* Mobile Hamburguer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white rounded-full hover:bg-white/10 transition-colors active:scale-95"
              aria-label="Alternar menú"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Menú Móvil Desplegable */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute top-[calc(100%+16px)] left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto"
              >
                <div className="py-6 px-6 flex flex-col gap-4">
                  {navItems.map((item, i) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      custom={i}
                      variants={itemVariants}
                      onClick={() => setIsOpen(false)}
                      className="text-gray-300 hover:text-white font-display text-2xl font-medium py-3 border-b border-white/10 transition-colors text-center"
                    >
                      {item.label}
                    </motion.a>
                  ))}

                  <motion.a
                    variants={itemVariants}
                    custom={navItems.length}
                    href="#contact-form"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 text-gray-300 hover:text-white font-display text-2xl font-medium py-3 border-b border-white/10 transition-colors text-center"
                  >
                    <PhoneCall size={18} />
                    {t('contact_us')}
                  </motion.a>

                  <motion.button
                    variants={itemVariants}
                    custom={navItems.length + 1}
                    onClick={() => {
                      setIsOpen(false);
                      setIsBookingOpen(true);
                    }}
                    className="mt-4 px-4 py-4 bg-white text-gray-950 rounded-2xl font-body font-medium text-center text-base shadow-sm active:scale-95 transition-all"
                  >
                    {t('book_now')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </header>

      {/* Portal de Reservas Global del Botón del Header */}
      <BookingDialog 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        roomName="Suite Standard" // Default
        roomType="standard"
      />
    </>
  );
}