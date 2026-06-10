import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Configuración centralizada
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function runTest() {
  try {
    console.log("Iniciando prueba...");
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { public_id: "test_image_hotel" }
    );
    console.log("✅ Imagen subida:", result.secure_url);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runTest();