import fs from 'fs';
import path from 'path';

/**
 * SCRIPT DE AUDITORÍA DE MEDIOS (PRODUCCIÓN)
 * 
 * Propósito: Analizar únicamente las imágenes que se desplegarán en Vercel.
 * Ignora carpetas de desarrollo, librerías y la carpeta temporal 'clasificar'.
 */

const rootDir = path.resolve(process.cwd()); 
const reportsDir = path.join(rootDir, 'reports');
const reportPath = path.join(reportsDir, 'media-audit.json');

// Asegurar que la carpeta de reportes exista
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'];

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Lista de exclusión estricta para el reporte de producción
    if (stat.isDirectory()) {
      const isIgnored = ['node_modules', '.git', 'dist', '.docs', 'clasificar'].includes(file);
      if (!isIgnored) {
        getFiles(filePath, fileList);
      }
    } else if (imageExtensions.includes(path.extname(file).toLowerCase())) {
      fileList.push({
        path: filePath.replace(rootDir, ''),
        name: file,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        extension: path.extname(file).toLowerCase()
      });
    }
  });
  return fileList;
}

// Nota: He añadido la lógica de 'stats' que faltaba para recuperar el tamaño correctamente
function getFilesWithStats(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const isIgnored = ['node_modules', '.git', 'dist', '.docs', 'clasificar'].includes(file);
        if (!isIgnored) {
            getFilesWithStats(filePath, fileList);
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          fileList.push({
            path: filePath.replace(rootDir, ''),
            name: file,
            size: (stat.size / 1024).toFixed(2) + ' KB',
            extension: ext
          });
        }
      }
    });
    return fileList;
  }

console.log("🔍 Iniciando barrido de imágenes de producción...");
const report = getFilesWithStats(rootDir);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`✅ Auditoría completada con éxito.`);
console.log(`📍 Reporte guardado en: ${reportPath}`);
console.log(`📊 Total de imágenes detectadas (fuera de clasificar): ${report.length}`);