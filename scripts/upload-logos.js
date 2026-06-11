import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

/**
 * SCRIPT DE NIVELACIÓN DE LOGOS - ELITE
 * 
 * Propósito: Sincronizar únicamente la identidad visual con IDs normalizados.
 * Soluciona el problema de nombres de archivos locales incorrectos.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const logosToUpload = [
  { 
    path: './client/public/images/logo/logo-main-dark-png.png', 
    id: 'logo/logo-main-dark' 
  },
  { 
    path: './client/public/images/logo/logo-main-light.png.png', 
    id: 'logo/logo-main-light' 
  },
  { 
    path: './client/public/images/logo/logo-square-dark.png.png', 
    id: 'logo/logo-square-dark' 
  }
];

async function uploadLogos() {
  console.log("🚀 Iniciando carga selectiva de Identidad Visual...");
  
  for (const logo of logosToUpload) {
    try {
      const res = await cloudinary.uploader.upload(logo.path, {
        folder: 'beach-hotel',
        public_id: logo.id,
        overwrite: true,
        resource_type: 'image'
      });
      console.log(`✅ Sincronizado: ${logo.id} -> ${res.secure_url}`);
    } catch (e) {
      console.error(`❌ Error al subir ${logo.id}:`, e.message);
    }
  }
  
  console.log("\n✨ Identidad visual nivelada en la nube.");
}

uploadLogos();