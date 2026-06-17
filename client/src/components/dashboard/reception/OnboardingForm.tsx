/**
 * @file OnboardingForm.tsx
 * @description Aparato de Primer Acceso, Cambio de Contraseña e Hidratación de Perfil de Personal.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Integración con la biblioteca industrial 'libphonenumber-js' para validación multipaís.
 * - Desinfectación rigurosa de entradas contra XSS permitiendo nombres de dirección reales.
 * - Saneamiento de ESLint v9: Eliminado el tipo 'any' mediante importación explícita de tipos Supabase.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { User } from '@supabase/supabase-js'; // Enlace de tipado fuerte
import { Lock, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from 'sonner';

interface OnboardingFormProps {
  /** Objeto de usuario autenticado de Supabase */
  user: User; 
  /** Callback ejecutado tras finalizar exitosamente el proceso */
  onComplete: () => Promise<void>;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ user, onComplete }) => {
  const { t } = useTranslation('onboarding');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para capturar errores de validación local
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    phone?: string;
    address?: string;
  }>({});

  /**
   * Normaliza y limpia entradas telefónicas prependiendo el indicador internacional si es omitido
   */
  const formatPhoneInput = (input: string): string => {
    let clean = input.trim();
    if (!clean.startsWith('+') && clean.length >= 10) {
      clean = '+' + clean;
    }
    return clean.replace(/[^\d+]/g, '');
  };

  /**
   * Sanitiza y valida de forma segura las entradas del usuario (Capa de Seguridad L0)
   */
  const validateInputs = (): boolean => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    // 1. Validar Contraseña
    if (password.length < 6) {
      tempErrors.password = t('validation_password_min', { defaultValue: 'A senha deve ter no mínimo 6 caracteres.' });
      isValid = false;
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = t('validation_passwords_mismatch', { defaultValue: 'As senhas não coincidem.' });
      isValid = false;
    }

    // 2. Sanitización y Validación del Teléfono con libphonenumber-js (Multipaís)
    const normalizedPhone = formatPhoneInput(phone);
    const parsedPhone = parsePhoneNumberFromString(normalizedPhone);
    
    if (!parsedPhone || !parsedPhone.isValid()) {
      tempErrors.phone = t('validation_phone_invalid', { defaultValue: 'Número de telefone internacional inválido (Ex: +55 48 99812-6650)' });
      isValid = false;
    }

    // 3. Sanitización de la dirección (Anti-XSS / HTML Injection)
    const htmlTagRegex = /[<>]/g; // Bloquea estrictamente inyección de scripts HTML sin romper apóstrofes legítimos
    if (address.trim().length < 8) {
      tempErrors.address = t('validation_address_short', { defaultValue: 'Por favor, digite seu endereço residencial completo.' });
      isValid = false;
    } else if (htmlTagRegex.test(address)) {
      tempErrors.address = t('validation_address_invalid', { defaultValue: 'Caracteres HTML especiais não são permitidos no endereço.' });
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Cambiar contraseña y remover metadato temporal en Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password,
        data: {
          temp_password_active: false // Quita la bandera de bloqueo de onboarding
        }
      });

      if (authError) throw authError;

      // 2. Formatear y sanitizar el teléfono final según el formato internacional de Google (E.164)
      const normalizedPhone = formatPhoneInput(phone);
      const parsedPhone = parsePhoneNumberFromString(normalizedPhone);
      const formattedPhone = parsedPhone ? parsedPhone.format('E.164') : normalizedPhone;

      // 3. Actualizar perfil de contacto en public.guests (dirección y celular)
      const { error: dbError } = await supabase
        .from('guests')
        .update({
          phone: formattedPhone,
          address: address.trim()
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      toast.success('¡Conta configurada com sucesso!');
      await onComplete();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado de rede';
      console.error('[Onboarding Error]:', msg);
      toast.error(`Falha ao configurar conta: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#141517] px-4 py-12 selection:bg-accent/30">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100/50"
      >
        {/* Cabecera */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-800 rounded-full text-[10px] font-body font-bold uppercase tracking-wider mb-3">
            Primeiro Acesso Seguro
          </span>
          <h1 className="font-display text-3xl text-gray-900 tracking-tight">
            {t('title', { defaultValue: 'Configurar Conta' })}
          </h1>
          <p className="font-body text-xs text-gray-500 leading-relaxed font-light mt-2">
            {t('subtitle', { defaultValue: 'Este é o seu primeiro acesso. Por segurança, configure seus dados básicos.' })}
          </p>
        </div>

        {/* Formulario Onboarding */}
        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
          
          {/* Nueva Contraseña */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('labels.password', { defaultValue: 'Nova Senha' })}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('placeholders.password', { defaultValue: '••••••••' })}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
              />
              {errors.password && <p className="text-[9px] text-red-500 font-bold mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('labels.confirm_password', { defaultValue: 'Confirmar Senha' })}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('placeholders.confirm_password', { defaultValue: '••••••••' })}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
              />
              {errors.confirmPassword && <p className="text-[9px] text-red-500 font-bold mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Teléfono Celular (Validado con Google engine) */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <Phone size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('labels.phone', { defaultValue: 'Telefone de Contato' })}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('placeholders.phone', { defaultValue: '+55 48 99812-6650' })}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
              />
              {errors.phone && <p className="text-[9px] text-red-500 font-bold mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Dirección Residencial */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all flex items-center gap-3">
            <MapPin size={18} className="text-gray-400" />
            <div className="flex-1">
              <label className="block text-[9px] font-body font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('labels.address', { defaultValue: 'Endereço Residencial' })}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('placeholders.address', { defaultValue: 'Rua, Número, Cidade' })}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body text-sm text-gray-900 placeholder:text-gray-300 outline-none"
              />
              {errors.address && <p className="text-[9px] text-red-500 font-bold mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Botón de Envío */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 mt-4 bg-accent text-accent-foreground hover:opacity-90 rounded-2xl text-xs font-body font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <Spinner className="w-5 h-5 text-accent-foreground" />
            ) : (
              <>
                <CheckCircle size={16} />
                {t('labels.submit', { defaultValue: 'Ativar Conta' })}
              </>
            )}
          </Button>

        </form>

        <div className="flex items-center gap-2 mt-6 justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <ShieldAlert size={12} className="text-gray-500" />
          Conexão encriptada SSL de grau bancário
        </div>

      </motion.div>
    </div>
  );
};