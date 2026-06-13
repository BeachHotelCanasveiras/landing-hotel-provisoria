🔐 Protocolo de Integridad Criptográfica (Integrity Layer)
Este rastro técnico describe la capa de blindaje aplicada a las transacciones del Hotel Beach Canasvieiras para prevenir la manipulación de datos (Data Tampering).
1. Estándares de Cumplimiento
ISO/IEC 27001: Control de integridad de datos en tránsito.
PCI-DSS Level 1: Manejo de flujos de pago mediante tokens y firmas digitales.
Criptografía: Uso de algoritmos de hashing fuerte (SHA-256) con salado (salting) dinámico.
2. Arquitectura de la Firma (HMAC-SHA256)
El sistema genera un Token de Integridad para cada intento de reserva.
Estructura del Payload: { room_id, check_in, check_out, total_price, timestamp }
Generación: HMAC(Payload, SERVER_SECRET_KEY)
Propósito: Garantizar que el precio y las fechas calculadas por el servidor no puedan ser modificadas por el cliente antes de llegar a la pasarela de pagos.
3. Flujo de Validación de Élite
Frontend: Captura selección de usuario -> Envía a /api/sign-booking.
Server (Edge Function): Valida disponibilidad -> Calcula precio real -> Firma el objeto -> Devuelve signed_payload.
Frontend: Almacena el signed_payload en un estado inmutable (TanStack Query).
Checkout: Se envía el signed_payload a la pasarela.
Webhook de Confirmación: Re-verifica la firma antes de marcar las fechas como bloqueadas en la base de datos de Supabase.
4. Medidas Anti-Tampering adicionales
Time-to-Live (TTL): Las firmas expiran en 15 minutos para evitar ataques de repetición (Replay Attacks).
Idempotency Keys: Cada intento de pago genera una clave única en Supabase para evitar cobros duplicados por fallos de red.

---

