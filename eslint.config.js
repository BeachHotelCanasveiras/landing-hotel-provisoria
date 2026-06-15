/**
 * @file eslint.config.js
 * @description Flat Config para ESLint v9.
 * - Soporte nativo ESM (ECMAScript Modules).
 * - Integración con TypeScript estricto.
 * - Reglas de React Hooks y Fast Refresh para Vite.
 */

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // 1. Ignorar carpetas de compilación, reportes y assets
  { ignores: ['dist', 'reports', 'node_modules', '.docs'] },
  
  {
    // 2. Extender configuraciones recomendadas
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    
    // 3. Archivos a auditar
    files: ['**/*.{ts,tsx}'],
    
    // 4. Entorno de lenguaje (Browser para la SPA)
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    
    // 5. Plugins de React y Vite
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    
    // 6. Reglas de negocio e Ingeniería
    rules: {
      // Activa las reglas recomendadas de Hooks (ej. exhaustive-deps)
      ...reactHooks.configs.recommended.rules,
      
      // Validar Fast Refresh en Vite
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Aplicación del Manifiesto: Desalentar el uso de 'any' para mantener tipado estricto
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Errores estrictos si se dejan dependencias huérfanas en useEffect/useCallback
      'react-hooks/exhaustive-deps': 'error'
    },
  }
);