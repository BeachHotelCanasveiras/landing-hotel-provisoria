/**
 * @file list-cloudinary-assets.js
 * @description Sincroniza y migra de forma masiva todos los activos del hotel a Cloudinary.
 * Mapea las rutas reales de la carpeta 'client/public/clasificar/' organizadas por formato
 * a sus respectivas carpetas lógicas en Cloudinary (hotel, suites, testimonials).
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

const assets = [
  // --- IDENTIDAD VISUAL (LOGOS) ---
  { path: './client/public/images/logo/logo-main-dark-png.png', id: 'logo/logo-main-dark' },
  { path: './client/public/images/logo/logo-main-light.png.png', id: 'logo/logo-main-light' },
  { path: './client/public/images/logo/logo-square-dark.png.png', id: 'logo/logo-square-dark' },
  
  // --- HOTEL & HERO (Alojados en tu carpeta clasificar/webp/) ---
  { path: './client/public/clasificar/webp/entrada-principal-hotel-beach-canasvieiras.webp', id: 'hotel/hero-1' },
  { path: './client/public/clasificar/webp/fachada-hotel-beach-canasvieiras-exterior.webp', id: 'hotel/hero-2' },
  { path: './client/public/clasificar/webp/piscina.webp', id: 'hotel/piscina' },
  { path: './client/public/clasificar/webp/por-do-sol.webp', id: 'hotel/atardecer' },
  
  // --- SUITES (Alojados en tu carpeta clasificar/png/ y clasificar/) ---
  { path: './client/public/clasificar/png/habitacion-single-ejecutiva-cama-matrimonial.png', id: 'suites/single' },
  { path: './client/public/clasificar/png/habitacion-triple-standard-camas-individuales.png', id: 'suites/triple' },
  { path: './client/public/clasificar/png/habitacion-doble-twin-camas-separadas.png', id: 'suites/grupal' },
  { path: './client/public/clasificar/viajeros-grupo.png', id: 'suites/viajeros-grupo' },

  // --- AVATARES DE TESTIMONIOS (Alojados en tu carpeta clasificar/webp/) ---
  { path: './client/public/clasificar/webp/avatar-cliente-chile.webp', id: 'testimonials/avatar-cliente-chile' },
  { path: './client/public/clasificar/webp/avatar-cliente-argentina.webp', id: 'testimonials/avatar-cliente-argentina' },
  { path: './client/public/clasificar/webp/avatar-cliente-uruguay.webp', id: 'testimonials/avatar-cliente-uruguay' },
  { path: './client/public/clasificar/webp/avatar-cliente-brasil.webp', id: 'testimonials/avatar-cliente-brasil' }
];

async function runMigration() {
  console.log("🚀 Iniciando migración y auditoría de activos estructurada...");
  
  for (const asset of assets) {
    // Verificamos si el archivo existe físicamente en el disco local antes de intentar subirlo
    if (!fs.existsSync(asset.path)) {
      console.warn(`⚠️ Omitido localmente (No existe el archivo): ${asset.path}`);
      continue;
    }

    try {
      const res = await cloudinary.uploader.upload(asset.path, {
        folder: 'beach-hotel',
        public_id: asset.id,
        overwrite: true,
        resource_type: 'image'
      });
      console.log(`✅ Sincronizado: ${asset.id} -> ${res.secure_url}`);
    } catch (e) {
      console.error(`❌ Error en la sincronización de ${asset.id}:`, e.message);
    }
  }
  console.log("\n✨ Sincronización estructurada completada. Verifica tu consola de Cloudinary.");
}

runMigration();