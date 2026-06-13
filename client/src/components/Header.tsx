/**
 * @file Header.tsx
 * @description Componente de navegación principal estilo "Píldora Flotante" (Floating Pill).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA: 
 * - Textos desacoplados mediante i18next ('nav' namespace).
 * - Selector de idioma integrado con soporte para los estándares regionales es-ES, en-US y pt-BR.
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { StorageService } from '@/lib/storage';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation('nav');

  /**
   * Manejador para el cambio de idioma.
   * Cambia el estado de i18n, actualiza el tag HTML y guarda en Cookie.
   */
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    StorageService.setCookie('beach_hotel_lang', lang);
    setIsOpen(false);
  };

  /**
   * Rutas de navegación consumiendo traducciones dinámicas.
   */
  const navItems = [
    { label: t('home'), href: '#home' },
    { label: t('rooms'), href: '#rooms' },
    { label: t('gallery'), href: '#gallery' },
    { label: t('attractions'), href: '#attractions' },
    { label: t('contact'), href: '#contact' },
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
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="relative pointer-events-auto w-full max-w-5xl bg-black/85 backdrop-blur-lg border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-full pl-5 pr-4 py-3 grid grid-cols-12 items-center transition-all duration-500">
        
        {/* Columna 1: Logotipo */}
        <div className="col-span-8 lg:col-span-3 flex justify-start items-center">
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

        {/* Columna 2: Menú de Navegación Unificado (Desktop) */}
        <div className="hidden lg:flex col-span-6 justify-center items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white font-display text-[14px] font-medium tracking-wide transition-all duration-300 ease-in-out hover:-translate-y-[1.5px] transform relative group whitespace-nowrap"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-400 ease-out" />
            </a>
          ))}
        </div>

        {/* Columna 3: Idioma + CTA */}
        <div className="col-span-4 lg:col-span-3 flex justify-end items-center gap-3">
          
          {/* Selector de Idioma Desktop - Códigos Regionales Alineados */}
          <div className="hidden lg:flex items-center gap-2 border-r border-white/20 pr-4 mr-2">
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

          {/* Botón Reservar (Desktop) */}
          <a
            href="#rooms"
            className="hidden lg:inline-block px-5 py-2 bg-white text-gray-950 hover:bg-gray-100 rounded-full font-body text-xs font-semibold transition-all duration-300 ease-in-out shadow-sm hover:scale-[1.02] transform whitespace-nowrap"
          >
            {t('book_now')}
          </a>

          {/* Mobile Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white rounded-full hover:bg-white/10 transition-colors active:scale-95 ml-auto"
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
                
                {/* Selector de Idioma Mobile */}
                <motion.div variants={itemVariants} custom={navItems.length} className="flex justify-center gap-6 pt-4 pb-2">
                  {[
                    { code: 'es-ES', label: 'Español' },
                    { code: 'en-US', label: 'English' },
                    { code: 'pt-BR', label: 'Português' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex flex-col items-center gap-1 transition-colors ${
                        i18n.language === lang.code ? 'text-accent' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-xs font-body font-bold uppercase">{lang.label}</span>
                      {i18n.language === lang.code && <span className="w-1 h-1 bg-accent rounded-full" />}
                    </button>
                  ))}
                </motion.div>

                <motion.a
                  variants={itemVariants}
                  custom={navItems.length + 1}
                  href="#rooms"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-4 py-4 bg-white text-gray-950 rounded-2xl font-body font-medium text-center text-base shadow-sm"
                >
                  {t('book_now')}
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
}