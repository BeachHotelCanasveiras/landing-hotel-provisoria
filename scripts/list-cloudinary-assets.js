import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * SCRIPT DE INVENTARIO CLOUDINARY (ÉLITE)
 * 
 * Propósito: Consultar todos los activos subidos a la nube para 
 * verificación y auditoría de URLs de producción.
 */

const rootDir = path.resolve(process.cwd());
const reportsDir = path.join(rootDir, 'reports');
const inventoryPath = path.join(reportsDir, 'cloudinary-inventory.json');

// Configuración de credenciales desde .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getCloudinaryInventory() {
  console.log("📡 Conectando con la API de Cloudinary...");
  
  try {
    // Buscamos específicamente en la carpeta del hotel
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'beach-hotel/', // Solo lo que pertenece a este proyecto
      max_results: 500
    });

    const inventory = result.resources.map(asset => ({
      public_id: asset.public_id,
      format: asset.format,
      version: asset.version,
      size_kb: (asset.bytes / 1024).toFixed(2),
      width: asset.width,
      height: asset.height,
      url: asset.secure_url,
      created_at: asset.created_at
    }));

    // Asegurar que la carpeta de reportes exista
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));

    console.log(`✅ Inventario generado con éxito.`);
    console.log(`📍 Archivo guardado en: ${inventoryPath}`);
    console.log(`📊 Total de activos en la nube: ${inventory.length}`);
    
    // Resumen visual rápido en consola
    console.log("\n--- Resumen de Activos ---");
    inventory.forEach(item => {
      console.log(`- [${item.format.toUpperCase()}] ${item.public_id} (${item.size_kb} KB)`);
    });

  } catch (error) {
    console.error("❌ Error al obtener el inventario:", error.message);
  }
}

getCloudinaryInventory();