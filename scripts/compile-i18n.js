/**
 * @file compile-i18n.js
 * @description Compilador automatizado de internacionalización.
 * Escanea las carpetas regionales es-ES, en-US y pt-BR, unificando todos los fragmentos
 * JSON en un único diccionario 'translation.json' por idioma antes del ciclo de Vite.
 */

import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('client/src/locales');
const languages = ['es-ES', 'en-US', 'pt-BR'];

console.log("🛠️  Unificando fragmentos de traducción...");

languages.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) return;

  const files = fs.readdirSync(langDir);
  const combined = {};

  files.forEach(file => {
    // Evitamos leer el archivo de salida o archivos no válidos
    if (file === 'translation.json' || !file.endsWith('.json')) return;

    try {
      const filePath = path.join(langDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const namespace = path.parse(file).name;
      
      // Estructuramos el diccionario usando el nombre del archivo como namespace
      combined[namespace] = content;
    } catch (e) {
      console.error(`❌ Error al procesar el archivo ${file} para ${lang}:`, e.message);
    }
  });

  // Guardamos el resultado unificado
  fs.writeFileSync(
    path.join(langDir, 'translation.json'),
    JSON.stringify(combined, null, 2)
  );
  console.log(`✅ Diccionario regionalizado listo: ${lang}/translation.json`);
});

console.log("✨ Proceso de i18n finalizado con éxito.");