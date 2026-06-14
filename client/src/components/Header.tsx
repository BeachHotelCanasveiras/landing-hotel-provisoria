/**
 * @file Header.tsx
 * @description Componente de navegación principal estilo "Píldora Flotante" (Floating Pill).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Se integra el nuevo enlace activo de "Excursiones" en móviles y escritorios.
 * - Doble canal de conversión (CTA dinámico de autenticación y selector de idioma).
 * - Selector de idioma flotante interactivo por Hover/Click de alta fidelidad.
 * - Textos traducidos dinámicamente y libres de hardcoding.
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Logo } from '@/components/Logo';
import { StorageService } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import BookingDialog from './BookingDialog';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { t, i18n } = useTranslation('nav');
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

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

  // Cerrar el menú al hacer clic fuera
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
          
          {/* Columna 1: Logotipo */}
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

          {/* Columna 2: Menú de Navegación Unificado (Outfit Sans-Serif Limpio) */}
          <div className="hidden lg:flex col-span-6 justify-center items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white font-body text-[11px] uppercase tracking-[0.12em] font-semibold transition-all duration-300 ease-in-out hover:-translate-y-[1px] transform relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-400 ease-out" />
              </a>
            ))}
          </div>

          {/* Columna 3: Idioma + CTA */}
          <div className="col-span-6 lg:col-span-4 flex justify-end items-center gap-3 sm:gap-5">
            
            {/* Selector de Idioma Desktop - Desplegable por Hover */}
            <div 
              className="relative hidden lg:block"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              <button
                className="p-2.5 text-gray-400 hover:text-white rounded-full bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer"
                aria-label="Change language"
              >
                <Globe size={15} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex flex-col gap-1 shadow-2xl z-50 min-w-[140px]"
                  >
                    {[
                      { code: 'es-ES', label: t('lang_es') },
                      { code: 'en-US', label: t('lang_en') },
                      { code: 'pt-BR', label: t('lang_pt') }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-3 py-2 text-left rounded-xl text-[11px] font-body font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          i18n.language === lang.code 
                            ? 'bg-accent text-accent-foreground font-bold' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selector de Idioma Móvil */}
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
                    className="absolute right-0 mt-3 bg-black/95 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-xl z-50 min-w-[140px]"
                  >
                    {[
                      { code: 'es-ES', label: t('lang_es') },
                      { code: 'en-US', label: t('lang_en') },
                      { code: 'pt-BR', label: t('lang_pt') }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-3 py-2.5 text-left rounded-xl text-[10px] font-body font-bold uppercase tracking-wider transition-colors ${
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

            {/* Botón de Acceso Dinámico Estilizado */}
            <button
              onClick={() => setLocation(user ? '/admin' : '/login')}
              disabled={loading}
              className="px-6 py-2.5 bg-white text-gray-950 border border-transparent hover:bg-transparent hover:text-white hover:border-accent font-body text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {loading ? '...' : (user ? t('dashboard') : t('join_or_signin'))}
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
                      className="text-gray-300 hover:text-white font-body text-xl font-medium py-3 border-b border-white/10 transition-colors text-center"
                    >
                      {item.label}
                    </motion.a>
                  ))}

                  <motion.button
                    variants={itemVariants}
                    custom={navItems.length}
                    onClick={() => {
                      setIsOpen(false);
                      setLocation(user ? '/admin' : '/login');
                    }}
                    disabled={loading}
                    className="mt-4 px-6 py-4 bg-white text-gray-950 border border-transparent hover:bg-transparent hover:text-white hover:border-accent font-body text-xs uppercase tracking-[0.15em] font-bold rounded-2xl shadow-sm active:scale-95 transition-all text-center w-full"
                  >
                    {loading ? '...' : (user ? t('dashboard') : t('join_or_signin'))}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </header>

      {/* Portal de Reservas Global (Disponible de fondo si es invocado por otras secciones) */}
      <BookingDialog 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        roomName="Suite Standard" // Default
        roomType="standard"
      />
    </>
  );
}