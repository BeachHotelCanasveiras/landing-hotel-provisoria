/**
 * @file upload-excursions.js
 * @description Script automatizado para migrar, mapear y optimizar los activos de excursiones
 * generados por IA a la carpeta lógica de Cloudinary 'beach-hotel/excursiones'.
 */

import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Configuración de credenciales de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const rootDir = process.cwd();
const localFolder = path.join(rootDir, 'client', 'public', 'clasificar', 'tours-bajdos', 'creadas-ia', 'webp');

// Mapeo síncrono de archivos locales a IDs públicos exactos del componente Excursions.tsx
const assets = [
  { file: 'beto-carrero_webp.webp', id: 'beto-carrero' },
  { file: 'bombinhas-e-4-ilhas.webp', id: 'bombinhas' },
  { file: 'city-tour.webp', id: 'city-tour' },
  { file: 'guarda-do-imbau.webp', id: 'guarda-embau' },
  { file: 'ilha-do-campeche.webp', id: 'ilha-campeche' },
  { file: 'joaquina-y-barra-da-lagoa.webp', id: 'joaquina' }
];

async function uploadExcursions() {
  console.log("================================================================");
  console.log("🚀 INICIANDO SUBIDA Y OPTIMIZACIÓN DE EXCURSIONES A CLOUDINARY");
  console.log("================================================================");

  if (!fs.existsSync(localFolder)) {
    console.error(`❌ Error: No se encontró la ruta física local en: ${localFolder}`);
    process.exit(1);
  }

  for (const asset of assets) {
    const filePath = path.join(localFolder, asset.file);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Omitido: No se encontró el archivo físico '${asset.file}' en el disco.`);
      continue;
    }

    try {
      console.log(`\n⏳ Subiendo y optimizando: ${asset.file} ...`);
      
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'beach-hotel/excursiones',
        public_id: asset.id,
        overwrite: true,
        resource_type: 'image',
        // f_auto, q_auto y pre-procesamiento de entrega inteligente
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      console.log(`✅ ¡Sincronizado con éxito!`);
      console.log(`   - Public ID: beach-hotel/excursiones/${asset.id}`);
      console.log(`   - URL Segura: ${res.secure_url}`);
    } catch (e) {
      console.error(`❌ Error al subir '${asset.file}':`, e.message);
    }
  }

  console.log("\n================================================================");
  console.log("✨ PROCESO DE MIGRACIÓN Y ASIGNACIÓN SINTÁCTICA COMPLETADO");
  console.log("================================================================");
}

uploadExcursions();