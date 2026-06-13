 El Prompt Maestro de Ingeniería de Backend (Refactorizado)
Este prompt está diseñado para que una IA de élite inicialice el cerebro del hotel siguiendo normas ISO y estándares criptográficos.
"Inicializar el 'Beach Core Engine' utilizando Payload 3.0. Requisitos de arquitectura y seguridad de alto nivel:
Core: Usar Payload 3.0 con Next.js y TypeScript. Configurar una base de datos PostgreSQL (vía Supabase o Neon).
Capa de Integridad (ISO 27001): Implementar un Hook global de 'Before-Change' que valide un HMAC-SHA256 Signature. El backend debe ser la única autoridad de precios: el cliente envía el roomID y el servidor firma un payload con el precio inmutable y un timestamp de expiración.
Modelado Modular: Crear colecciones para Rooms, Bookings (con estados: pending, confirmed, cancelled) y Customers (CRM).
Motor de Pagos: Implementar un endpoint /api/create-checkout-session que valide la firma HMAC del paso anterior antes de generar la sesión en Stripe/Mercado Pago.
Sincronización iCal: Crear un Cron Job (vía Vercel Cron o similar) que parsee el iCal de Airbnb y actualice la colección de disponibilidad en Payload.
Deployment: Configurar para despliegue en Vercel (Serverless) con base de datos en Neon.tech (ambos con Tiers gratuitos de alto rendimiento)."

---

🏗️ Arquitectura de Gestión Hotelera "Beach Core" (v1.0)
Este documento define la infraestructura de backend diseñada para el Hotel Beach Canasvieiras, enfocada en seguridad transaccional, estabilidad y escalabilidad modular.
1. Stack Tecnológico de Élite
Framework: Payload 3.0 (Next.js Native).
Engine: Node.js 20+ con TypeScript estricto.
Database: PostgreSQL (Relacional, esencial para reportes financieros y CRM).
Criptografía: Web Crypto API para firmas HMAC.
ORM: Drizzle (integrado en Payload para velocidad de ejecución extrema).
2. Protocolo de Seguridad y No-Manipulación
Siguiendo los estándares de seguridad de la información, el sistema implementa la Autoridad Total del Servidor:
Solicitud de Cotización: El frontend nunca envía precios. Envía un intent.
Cálculo de Precio: El Backend calcula noches * tarifa_temporada y genera un Hash de Integridad.
Firma Digital: Se entrega al cliente un objeto firmado. Si el cliente modifica 1 solo bit (ej. cambia el precio o la fecha), el Hash se rompe y el backend rechazará el pago.
Validación de Pago: Solo tras un Webhook exitoso de la pasarela, el sistema bloquea el inventario.
3. Escalabilidad Modular (PMS & CRM)
Payload 3.0 nos permite añadir "Blocks" y "Collections" sin afectar el performance:
Módulo CRM: Extensión de la colección Users para guardar preferencias de huéspedes, historial de estancias y triggers de marketing.
Módulo PMS: Panel administrativo para el personal del hotel (check-in, check-out, estado de limpieza de habitaciones).
Módulo de Reportes: Endpoints dedicados para calcular ocupación mensual y proyección de ingresos.
4. Estrategia de Despliegue (Cero Costo Inicial)
API/Panel: Vercel (Hospedaje de Payload 3.0 en modo Serverless).
Database: Neon.tech (Postgres con escalado a cero para no consumir créditos cuando no hay tráfico).
Media: Cloudinary (Ya integrado en el frontend)