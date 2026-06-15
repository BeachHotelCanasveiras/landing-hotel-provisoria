/**
 * @file LanguageSelector.tsx
 * @description Sub-componente atómico para el selector de idioma flotante del Header.
 * - UX: Menú interactivo por Hover/Click de alta fidelidad con transiciones fluidas.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  /** Callback activado al cambiar de idioma */
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, i18n } = useTranslation('nav');
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="relative text-left"
      onMouseEnter={() => setIsLangOpen(true)}
      onMouseLeave={() => setIsLangOpen(false)}
      ref={menuRef}
    >
      {/* Botón Globo con micro-interacción */}
      <button
        onClick={() => setIsLangOpen((prev) => !prev)}
        className="p-2.5 text-gray-400 hover:text-white rounded-full bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer"
        aria-label="Change language"
      >
        <Globe size={15} />
      </button>

      {/* Menú Desplegable con Glassmorphism */}
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
              { code: 'es-ES', label: t('LANG_ES') },
              { code: 'en-US', label: t('LANG_EN') },
              { code: 'pt-BR', label: t('LANG_PT') }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-3.5 py-2.5 text-left rounded-xl font-body font-light text-[11px] uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer ${
                  i18n.language === lang.code 
                    ? 'bg-accent text-accent-foreground font-normal' 
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
  );
};