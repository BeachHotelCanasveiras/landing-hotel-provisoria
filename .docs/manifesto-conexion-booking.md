# Manifiesto de Conexión y Plan de Implementación Bidireccional: Booking.com (v3.2)
> Guía técnica de integración, topología de datos, arquitectura de seguridad (PCI-DSS/ISO 27001) y entorno de pruebas Sandbox.

Este documento establece el diseño de arquitectura y el plan de migración para elevar el sistema de sincronización asíncrona por iCal hacia una integración de baja latencia mediante las APIs oficiales de Conectividad de Booking.com (v3.2).

---

## 1. Topología del Entorno de Pruebas (Sandbox Engine)

Para realizar simulaciones de conectividad sin afectar el inventario comercial activo ni requerir contratos de producción inmediatos, el sistema consumirá el Sandbox oficial de desarrollo de Booking.com.

### A. Parámetros de Conexión de Pruebas
*   **Endpoint Central del Sandbox:** `https://demandapi-sandbox.booking.com/3.2`
*   **Autenticación en Cabeceras (Headers):**
    *   `Authorization`: `Bearer <VITE_BOOKING_SANDBOX_TOKEN>` (Token de API Bearer simulado)
    *   `X-Affiliate-Id`: `<VITE_BOOKING_SANDBOX_AFFILIATE_ID>` (ID de Afiliado de Pruebas)
*   **ID de Propiedad Ficticia para Pruebas (Test Property):** `10507360` (Ámsterdam) o `5868189` (Staging de pruebas con tarjeta de crédito dummy).

### B. Datos de Tarjeta de Crédito de Prueba (Simulador de Cobro)
Para simular reservas garantizadas o cobros automáticos a través de la API en el Sandbox, se inyectará la siguiente tarjeta autorizada:
*   **Proveedor:** Visa
*   **Número:** `4111-1111-1111-1111`
*   **CVC:** `123`
*   **Fecha de Expiración:** Cualquier fecha futura.

---

## 2. Flujo de Datos y Arquitectura de Integración (Fase 4 SaaS)

La transición del modelo iCal (basado en consultas lentas) al modelo API de Conectividad REST se estructurará bajo una topología de tres "aparatos" o sub-módulos dentro de nuestro servidor serverless en Vercel:
code
Code
[ HUÉSPED RESERVA EN BOOKING.COM ]
                              │
                   (Notificación Push / Webhook)
                              ▼
                [ /api/ota/booking/webhook.ts ]
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   (Puebla Supabase)                 (WebSocket en Vivo)
bookings (Status: confirmed) Notificación de alerta
guests (Perfil auto-curado) en AdminDashboard
code
Code
### Aparato A: Receptor de Reservas (Webhook en Tiempo Real)
*   **Ruta física:** `api/ota/booking/webhook.ts`
*   **Funcionamiento:** Booking.com envía una notificación de tipo `POST` (XML o JSON, dependiendo del contrato) al instante en que una reserva es creada, modificada o cancelada. 
*   **Lógica de Negocio:** El webhook descodifica el payload, valida criptográficamente la firma para prevenir inyecciones, e inyecta la reserva en Supabase con `room_id = null` (reservado por categoría), gatillando de inmediato el WebSocket que hace sonar la alarma en `AdminDashboard.tsx`.

### Aparato B: Distribuidor de Tarifas y Cierres (Rates and Availability)
*   **Ruta física:** `api/ota/booking/rates.ts`
*   **Funcionamiento:** Cada vez que el administrador modifica tarifas o restricciones en el componente `RatesAvailability.tsx` de nuestro panel, se dispara una petición `POST` masiva hacia el endpoint de tarifas de Booking.com.
*   **Lógica de Negocio:** Actualiza en menos de 2 segundos los precios BRL/USD, el inventario físico disponible y restricciones como estadía mínima (`min_stay`) y cierres de llegada/salida (`closed`).

### Aparato C: Tokenización de Tarjetas de Garantía (PCI-DSS Wrapper)
*   **Ruta física:** `api/ota/booking/payments.ts`
*   **Funcionamiento:** En reservas que requieren validación de tarjeta, esta API consulta de forma segura el endpoint `GET /reservations/{reservation_id}/credit_card` de Booking.com.
*   **Lógica de Negocio:** La tarjeta se enmascara temporalmente y se procesa mediante una pre-autorización directa en Stripe, sin guardar jamás los dígitos de la tarjeta en nuestra base de datos de Supabase, reduciendo el alcance de auditorías financieras.

---

## 3. Plan de Implementación de Archivos (Estructura de Directorios)

Para materializar esta conexión, se estructurará el siguiente árbol de archivos en el proyecto:
beach-hotel-canasvieiras/
├── .docs/
│ └── manifesto-conexion-booking.md <-- Este archivo
├── api/
│ └── ota/
│ └── booking/
│ ├── webhook.ts # Handler para notificaciones de Booking
│ ├── rates.ts # Transmisor de tarifas e inventario
│ └── payments.ts # Validador de tarjetas (Stripe Link)
├── client/
│ └── src/
│ └── hooks/
│ └── useBookingSync.ts # Hook para sincronizaciones manuales


---

