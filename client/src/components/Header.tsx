/**
 * @file Header.tsx
 * @description Orquestador principal de la cabecera estilo "Píldora Flotante" (Floating Pill).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-popover, border-border, bg-muted y text-foreground de la landing.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje e inicialización de cabecera.
 * - Smart Scroll: Ocultamiento automático al bajar, aparición de inmediato al subir.
 * - Saneamiento ESLint: Actualización de idioma delegada a un useEffect reactivo.
 * - Saneamiento TS: Eliminación de estados redundantes encapsulados en sub-componentes.
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { Logo } from '@/components/Logo';
import { StorageService } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import BookingDialog from './BookingDialog';

// Importaciones atómicas de sub-componentes (Aparato E.1 y E.2)
import { LanguageSelector } from './header/LanguageSelector';
import { UserProfileMenu } from './header/UserProfileMenu';

export default function Header() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de cabecera
  usePerformanceProfiler('Header');

  const [isOpen, setIsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Estados para el comportamiento Smart Header (Ocultarse al scroll)
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const { t, i18n } = useTranslation('nav');
  const [, setLocation] = useLocation();
  const { user, loading, signOut } = useAuth();

  /**
   * Saneamiento de ESLint (react-hooks/immutability):
   * La mutación del DOM global se realiza de forma reactiva y segura dentro del ciclo de vida.
   */
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  /**
   * Smart Scroll: Detecta la dirección de desplazamiento de forma no bloqueante.
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        // En la cabecera del sitio se mantiene siempre visible
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Desplazamiento hacia abajo: ocultar
        setIsVisible(false);
      } else {
        // Desplazamiento hacia arriba: mostrar
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    StorageService.setCookie('beach_hotel_lang', lang);
    setIsOpen(false);
  };

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

  // Animaciones de ocultamiento/aparición inteligente de la cabecera
  const headerVariants: Variants = {
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    },
    hidden: { 
      y: -110, 
      opacity: 0, 
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
    }
  };

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
      <motion.header 
        variants={headerVariants}
        animate={isVisible ? 'visible' : 'hidden'}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <nav className="relative pointer-events-auto w-full max-w-5xl bg-card/85 backdrop-blur-lg border border-border shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-full pl-5 pr-4 py-3 grid grid-cols-12 items-center transition-all duration-500">
          
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

          {/* Columna 2: Menú de Navegación Unificado (Estilo Minimalista) */}
          <div className="hidden lg:flex col-span-6 justify-center items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground font-body text-[11px] uppercase tracking-[0.08em] font-light transition-all duration-300 ease-in-out hover:-translate-y-[1px] transform relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-400 ease-out" />
              </a>
            ))}
          </div>

          {/* Columna 3: Idioma + Perfil/Ingreso */}
          <div className="col-span-6 lg:col-span-4 flex justify-end items-center gap-3 sm:gap-4">
            
            {/* Selector de Idioma Desktop Atómico (Aparato E.1) */}
            <LanguageSelector onLanguageChange={handleLanguageChange} />

            {/* Canal de Conversión Dinámico (Aparato E.2 / CTA Fino) */}
            {user ? (
              <UserProfileMenu 
                user={user} 
                onSignOut={signOut} 
                onNavigate={setLocation} 
                t={t} 
              />
            ) : (
              <button
                onClick={() => setLocation('/login')}
                disabled={loading}
                className="px-5 py-2.5 bg-transparent text-foreground border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground font-body text-[10px] uppercase tracking-[0.1em] font-semibold rounded-full transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                {loading ? '...' : t('join_or_signin')}
              </button>
            )}

            {/* Mobile Hamburguer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground rounded-full hover:bg-muted transition-colors active:scale-95 border-none bg-transparent"
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
                className="absolute top-[calc(100%+16px)] left-0 w-full bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden pointer-events-auto"
              >
                <div className="py-6 px-6 flex flex-col gap-4">
                  {navItems.map((item, i) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      custom={i}
                      variants={itemVariants}
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground hover:text-foreground font-body text-lg font-light py-3 border-b border-border/50 transition-colors text-center"
                    >
                      {item.label}
                    </motion.a>
                  ))}

                  {!user && (
                    <motion.button
                      variants={itemVariants}
                      custom={navItems.length}
                      onClick={() => {
                        setIsOpen(false);
                        setLocation('/login');
                      }}
                      disabled={loading}
                      className="mt-4 px-6 py-4 bg-transparent text-foreground border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground font-body text-[10px] uppercase tracking-[0.1em] font-semibold rounded-2xl shadow-sm active:scale-95 transition-all text-center w-full"
                    >
                      {loading ? '...' : t('join_or_signin')}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </motion.header>

      {/* Portal de Reservas Global */}
      <BookingDialog 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        roomName="Suite Standard"
        roomType="standard"
      />
    </>
  );
}