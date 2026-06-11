/**
 * @file upload-avatars.js
 * @description Script automatizado para subir los avatares webp de testimonios a Cloudinary.
 * Busca los activos locales en 'client/public/clasificar/webp/' y los aloja con compresión optimizada.
 */

import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Configuración centralizada de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const avatars = [
  'avatar-cliente-argentina.webp',
  'avatar-cliente-brasil.webp',
  'avatar-cliente-chile.webp',
  'avatar-cliente-uruguay.webp'
];

const rootDir = process.cwd();
const localFolder = path.join(rootDir, 'client', 'public', 'clasificar', 'webp');

async function uploadAvatars() {
  console.log("\n🚀 Iniciando subida de avatares de clientes a Cloudinary...");
  
  if (!fs.existsSync(localFolder)) {
    console.error(`❌ Error: No se encontró la carpeta local de origen en: ${localFolder}`);
    process.exit(1);
  }

  for (const file of avatars) {
    const filePath = path.join(localFolder, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Omitido: No se encontró el archivo '${file}' en la carpeta local.`);
      continue;
    }

    // Extrae el nombre del archivo sin extensión para usarlo como public_id
    const publicId = path.parse(file).name;

    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'beach-hotel/testimonials',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      });
      console.log(`✅ Sincronizado: ${file} -> ${res.secure_url}`);
    } catch (e) {
      console.error(`❌ Error al subir el archivo ${file}:`, e.message);
    }
  }
  console.log("\n✨ Proceso de avatares finalizado en la nube de Cloudinary.");
}

uploadAvatars();