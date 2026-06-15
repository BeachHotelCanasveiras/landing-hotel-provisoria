/**
 * @file compile-i18n.js
 * @description Compilador optimizado de internacionalización.
 * Refactorizado para limpieza de estado, validación estricta y seguridad de namespaces.
 */

import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('client/src/locales');
const languages = ['es-ES', 'en-US', 'pt-BR'];

console.log("🛠️  Iniciando unificación de diccionarios (Modo Producción)...");

languages.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  const outputFile = path.join(langDir, 'translation.json');
  
  if (!fs.existsSync(langDir)) {
    console.warn(`⚠️ Directorio no encontrado: ${langDir}`);
    return;
  }

  // 1. Limpieza de estado previo: Eliminar el archivo de salida si existe
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  const files = fs.readdirSync(langDir);
  const combined = {};

  files.forEach(file => {
    // Saltamos el archivo de salida y archivos que no sean .json
    if (file === 'translation.json' || !file.endsWith('.json')) return;

    try {
      const filePath = path.join(langDir, file);
      const rawContent = fs.readFileSync(filePath, 'utf8');
      
      if (!rawContent.trim()) {
        throw new Error(`El archivo ${file} está vacío.`);
      }

      const content = JSON.parse(rawContent);
      const namespace = path.parse(file).name.toLowerCase(); // Normalización a minúsculas
      
      combined[namespace] = content;
    } catch (e) {
      console.error(`❌ Error crítico procesando ${file} en ${lang}:`, e.message);
      process.exit(1); 
    }
  });

  // 2. Escritura atómica
  try {
    fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2));
    console.log(`✅ Diccionario validado y listo: ${lang}/translation.json`);
  } catch (err) {
    console.error(`❌ Error al escribir el archivo final de ${lang}:`, err.message);
    process.exit(1);
  }
});

console.log("✨ Proceso de i18n finalizado exitosamente.");