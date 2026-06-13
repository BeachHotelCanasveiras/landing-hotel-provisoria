📜 Manifiesto de Ingeniería: Beach Hotel Canasvieiras (Proyecto Elite)
Este documento define los estándares innegociables para el desarrollo del ecosistema transaccional del hotel.
1. Estándares de Código y Calidad
Atomicidad: Cada componente UI (BookingDatePicker, PricingCard) es una unidad atómica, sin lógica de negocio incrustada (todo mediante props/hooks).
Tipado Estricto: Prohibido el uso de any. Todos los modelos de datos deben estar definidos mediante Zod para validación en runtime y TypeScript para seguridad en compile-time.
Granularidad: Cada sección tendrá su propio archivo index.ts que exporte exclusivamente lo necesario, manteniendo el resto privado.
2. Seguridad y Transaccionalidad
Backend Autoridad: El frontend jamás define precios o condiciones finales. Todo se calcula en el servidor y se valida mediante firmas HMAC o tokens seguros.
Resiliencia: Uso de TanStack Query para gestionar estados de carga, errores y optimistic updates. Ninguna petición de reserva debe quedar en un "limbo".
Logs: Implementación de trazas para auditoría (quién reserva, qué fecha, y qué estado de pago tiene).
3. Marketing y Conversión (CRO)
Performance: Todo componente debe ser lazy-loaded si no es crítico para el primer renderizado (LCP).
SEO & Analytics: Soporte para metadatos dinámicos y eventos de conversión (umami) integrados de forma no intrusiva.
Low Friction: El flujo de reserva no debe tener más de 3 pasos.
4. Internacionalización (i18n)
Estructura: Diccionarios separados por namespace (ej: booking.es.json, rooms.en.json).
Independencia: Los componentes consumen textos a través de un hook useTranslation, permitiendo cambiar de idioma sin recargar la página.

---

1. ISO/IEC 27001 (Gestión de la Seguridad de la Información)
El objetivo es garantizar la Confidencialidad, Integridad y Disponibilidad (CIA Triad).
En la UI (Aparatos):
Principio de Menor Privilegio: Los formularios de reserva (BookingDialog) solo solicitarán datos estrictamente necesarios (Nombre, email, fechas). Nada más.
Validación de Entradas: Implementaremos esquemas Zod estrictos en el frontend y backend para prevenir inyecciones (SQLi, XSS).
Cifrado: Toda comunicación debe ser sobre HTTPS obligatoriamente (Vercel ya lo gestiona, pero debemos forzar el HSTS en la configuración del proyecto).
En el Código:
Gestión de Secretos: Nunca expondremos claves de API en el cliente. Usaremos variables de entorno y Serverless Functions (o Payload/Next.js routes) como puente.
2. PCI-DSS (Seguridad en Pagos)
Aunque usamos pasarelas externas (Stripe/Mercado Pago), el estándar exige:
No tocar la tarjeta: Jamás procesaremos números de tarjeta en tu servidor. Todo se maneja a través de Stripe Elements (tokens seguros), cumpliendo con el cumplimiento de alcance reducido.
Logging de Auditoría: Registrar todos los intentos de reserva fallidos y éxitos sin guardar datos sensibles (Pii).
Plan de Cumplimiento por "Aparato"
Aparato	Norma ISO Aplicada	Control Técnico
Calendario	Integridad (27001)	Validación de rangos en servidor (evitar date-tampering).
Formulario Huésped	Confidencialidad	Sanitización de input y enmascaramiento de datos.
Pasarela de Pagos	PCI-DSS / ISO 27001	Webhooks verificados con firma secreta (Hash).
Bases de Datos	Disponibilidad (27001)	Backups automáticos en Supabase y bloqueo de registros.

---

