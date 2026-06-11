import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Configuración centralizada de Cloudinary usando tus variables de entorno seguras
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileName = 'viajeros-grupo.png';
const rootDir = process.cwd();

// Buscamos en las posibles rutas de tu entorno local
const possiblePaths = [
  path.join(rootDir, 'client', 'public', 'clasificar', fileName),
  path.join(rootDir, 'public', 'clasificar', fileName)
];

let localPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    localPath = p;
    break;
  }
}

async function runUpload() {
  if (!localPath) {
    console.error(`\n❌ Error: No se encontró el archivo '${fileName}' en tu disco local.`);
    console.log("Asegúrate de colocar tu imagen generada con el nombre exacto en:");
    possiblePaths.forEach(p => console.log(`   📍 ${p}`));
    process.exit(1);
  }

  console.log(`\n🔍 Activo detectado localmente en: ${localPath}`);
  console.log("🚀 Iniciando la subida a Cloudinary (suites/viajeros-grupo)...");

  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: 'beach-hotel/suites',
      public_id: 'viajeros-grupo',
      overwrite: true,
      resource_type: 'image'
    });
    console.log(`\n✅ ¡Imagen subida y sincronizada con éxito!`);
    console.log(`🔗 URL Segura: ${res.secure_url}`);
    console.log(`📌 ID de Activo para Rooms: suites/viajeros-grupo`);
  } catch (error) {
    console.error("\n❌ Error durante el proceso de subida:", error.message);
  }
}

runUpload();