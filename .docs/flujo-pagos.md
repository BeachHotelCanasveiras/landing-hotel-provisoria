💳 Protocolo de Reservas y Pagos de Élite (v1.0)
Este rastro técnico define cómo el Hotel Beach Canasvieiras procesa transacciones financieras de forma segura, escalable y con alto rendimiento.
1. Stack Tecnológico de Transacciones
Gestión de Estado: TanStack Query (v5) - Para cacheo de disponibilidad y sincronización.
Validación de Datos: Zod - Esquemas de validación estricta para formularios de reserva.
Backend-as-a-Service: Supabase (Auth + DB + Edge Functions).
Pasarela de Pago: Stripe / Mercado Pago (Redirección segura para cumplimiento PCI-DSS).
Comunicaciones: Supabase Hooks + Resend (Email de confirmación).
2. El Flujo de "Cero Manipulación" (Security-First)
Para garantizar que nadie modifique el precio en la consola del navegador, el flujo es el siguiente:
Intención de Reserva: El usuario selecciona fechas en el BookingDialog.
Validación de Disponibilidad (TanStack Query): Se consulta a la DB. Si las fechas están libres, se habilita el botón de pago.
Creación de Orden (Server-Side): Al hacer clic en "Pagar", se envía el room_type y las dates a una Edge Function de Supabase.
Cálculo Inmutable: La función calcula el precio real multiplicando noches * precio_db. Nunca confiamos en el precio que viene del frontend.
Sesión de Pago: La Edge Function crea una sesión en la pasarela de pagos y devuelve una URL segura.
Redirección: El usuario es llevado fuera del sitio para pagar.
Webhook: Al confirmarse el pago, la pasarela avisa a Supabase.
Cierre: Supabase bloquea las fechas en la tabla blocked_dates y envía el correo con el ticket al cliente.
3. Estructura de Rutas y Componentes
/checkout/[id]: Página de revisión de reserva antes del pago.
/checkout/success: Feedback visual de éxito con micro-animaciones (Lottie/Framer).
/checkout/cancel: Manejo de errores o abandono de compra con opción de regreso fácil.
4. Estándar de Calidad del Código
Desacoplamiento: La lógica de pagos vive en client/src/lib/payments/.
Integridad: Uso de ErrorBoundaries específicos para el proceso de pago.
UX: Implementación de "Optimistic Updates" para que la interfaz se sienta instantánea.

---

