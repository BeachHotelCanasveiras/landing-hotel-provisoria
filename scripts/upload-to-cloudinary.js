import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagesToUpload = [
  { path: './client/public/images/hotel/entrada-principal-hotel-beach-canasvieiras.webp', id: 'hotel/hero-1' },
  { path: './client/public/images/hotel/fachada-hotel-beach-canasvieiras-exterior.webp', id: 'hotel/hero-2' },
  { path: './client/public/images/hotel/piscina.webp', id: 'hotel/piscina' },
  { path: './client/public/images/hotel/por-do-sol.webp', id: 'hotel/atardecer' },
  { path: './client/public/images/suites/habitacion-single-ejecutiva-cama-matrimonial.png', id: 'suites/single' },
  { path: './client/public/images/suites/habitacion-triple-standard-camas-individuales.png', id: 'suites/triple' },
  { path: './client/public/images/suites/habitacion-doble-twin-camas-separadas.png', id: 'suites/grupal' }
];

async function uploadFiles() {
  console.log("🚀 Iniciando subida masiva a Cloudinary...");
  for (const img of imagesToUpload) {
    try {
      const res = await cloudinary.uploader.upload(img.path, {
        folder: 'beach-hotel',
        public_id: img.id,
        overwrite: true
      });
      console.log(`✅ Subida: ${img.id} -> ${res.secure_url}`);
    } catch (e) {
      console.error(`❌ Error en ${img.id}:`, e.message);
    }
  }
}

uploadFiles();