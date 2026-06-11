import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const assets = [
  // LOGOS (Rutas locales detectadas en tu snapshot)
  { path: './client/public/images/logo/logo-main-dark-png.png', id: 'logo/logo-main-dark' },
  { path: './client/public/images/logo/logo-main-light.png.png', id: 'logo/logo-main-light' },
  { path: './client/public/images/logo/logo-square-dark.png.png', id: 'logo/logo-square-dark' },
  
  // HOTEL & HERO
  { path: './client/public/images/hotel/entrada-principal-hotel-beach-canasvieiras.webp', id: 'hotel/hero-1' },
  { path: './client/public/images/hotel/fachada-hotel-beach-canasvieiras-exterior.webp', id: 'hotel/hero-2' },
  { path: './client/public/images/hotel/piscina.webp', id: 'hotel/piscina' },
  { path: './client/public/images/hotel/atardecer.webp', id: 'hotel/atardecer' },
  
  // SUITES
  { path: './client/public/images/suites/habitacion-single-ejecutiva-cama-matrimonial.png', id: 'suites/single' },
  { path: './client/public/images/suites/habitacion-triple-standard-camas-individuales.png', id: 'suites/triple' },
  { path: './client/public/images/suites/habitacion-doble-twin-camas-separadas.png', id: 'suites/grupal' }
];

async function runMigration() {
  console.log("🚀 Iniciando migración y auditoría de activos...");
  for (const asset of assets) {
    try {
      const res = await cloudinary.uploader.upload(asset.path, {
        folder: 'beach-hotel',
        public_id: asset.id,
        overwrite: true,
        resource_type: 'image'
      });
      console.log(`✅ Sincronizado: ${asset.id} -> ${res.secure_url}`);
    } catch (e) {
      console.error(`⚠️ Omitido/Error en ${asset.id}:`, e.message);
    }
  }
  console.log("\n✨ Proceso terminado. Verifica tu consola de Cloudinary.");
}

runMigration();