# Beach Hotel Canasvieiras - Roadmap de Atomización y Producción

Este documento detalla los componentes y flujos lógicos que deben ser atomizados y refinados de forma modular en las siguientes fases del proyecto para asegurar un rendimiento de nivel de producción (Vercel Ready) y total conformidad con la Trinidad Atómica (UI + Zod + i18n JSON).

---

## 🛡️ 1. Atomización de los Paneles Administrativos (/admin)
Actualmente, `client/src/pages/AdminDashboard.tsx` es un orquestador que contiene sub-componentes integrados en el mismo archivo. Para seguir de manera estricta el Manifiesto de Ingeniería, estos sub-paneles deben dividirse en archivos individuales:

- [ ] **Aparato Guest Dashboard:** Separar a `client/src/components/dashboard/GuestPortal.tsx`.
  - *Responsabilidad única:* Mostrar el historial de estancias del huésped, guía de check-in y su itinerario de excursiones del hotel.
- [ ] **Aparato Agency Dashboard:** Separar a `client/src/components/dashboard/AgencyPortal.tsx`.
  - *Responsabilidad única:* Mostrar tarifas exclusivas de operador, cupones de descuento y contacto directo con el concierge.
- [ ] **Aparato Admin Dashboard (PMS):** Separar a `client/src/components/dashboard/AdminPMS.tsx`.
  - *Responsabilidad única:* Mostrar gráficos analíticos de ocupación, listados de reservas, control de check-in/out y limpieza de habitaciones.
- [ ] **Aparato Developer Dashboard (DevOps):** Separar a `client/src/components/dashboard/DeveloperConsole.tsx`.
  - *Responsabilidad única:* Mostrar logs del sistema, estado en tiempo real de la base de datos de Supabase y métricas de activos de Cloudinary.

---

## 🔒 2. Seguridad de Base de Datos e Integridad Transaccional (Supabase Policies)
Con las tablas e índices creados de forma síncrona en Supabase, debemos activar políticas de Row Level Security (RLS) estrictas para garantizar el cumplimiento de la norma ISO 27001:

- [ ] **Políticas de lectura para `public.rooms`:** Lectura pública y sin autenticación obligatoria para que el widget de reservas pueda validar disponibilidad y precios de forma abierta.
- [ ] **Políticas para `public.bookings`:**
  - Los huéspedes (`guest`) solo pueden leer y crear sus propias reservas (filtrando por `guest_id` asociado a su UUID).
  - Las agencias (`agency`) solo pueden leer y crear reservas que les correspondan.
  - El personal de administración (`admin`) y los desarrolladores (`developer`) tienen permisos totales de lectura, edición y eliminación de reservas de todas las habitaciones.
- [ ] **Políticas para `public.users`:**
  - El usuario autenticado solo puede leer su propio perfil y rol.
  - El administrador del hotel tiene permisos totales para consultar y auditar la base de datos de usuarios.

---

## 🗓️ 3. Transaccionalidad Real en el Widget de Reservas
- [ ] **Widget Conectado (`client/src/components/BookingDialog.tsx`):**
  - Conectar el selector de rango de fechas (`react-day-picker`) con Supabase a través de TanStack Query para desactivar/bloquear en el calendario las fechas que ya estén ocupadas en la tabla `bookings` para la habitación seleccionada.
  - Al completar el formulario de 2 pasos, guardar de forma síncrona la reserva en estado "pending" dentro de la tabla `bookings` e iniciar el mensaje estructurado de WhatsApp.

---

## 🔄 4. Sincronización Automática de Airbnb (iCal Sync)
- [ ] **Cron Job de Sincronización:**
  - Implementar una Edge Function en Supabase (o un servidor cron sin estado en Vercel) que parsee de forma asíncrona cada 10 minutos el enlace de iCal de tu anuncio de Airbnb.
  - Insertar de manera inmutable los bloqueos detectados en la tabla `bookings` de Supabase para evitar sobre-reservas (Overbookings) en tiempo real.

  ---

  ## ✉️ 5. Automatización de la Cola de Correos Transaccionales (Outbox Pattern - ISO 27001)
Este módulo desacopla la creación de reservas de la entrega de notificaciones físicas, garantizando transacciones seguras (PCI-DSS), cero fugas de API Keys y una entrega de alta fiabilidad.

- [ ] **Esquema de Base de Datos (`email_queue`):**
  - Crear la tabla física en Supabase con RLS restrictivo que autorice únicamente al `service_role`.
  - Crear el índice optimizado `idx_email_queue_status_scheduled` para búsquedas en tiempo constante $O(1)$.
  
- [ ] **Worker de Despacho de Correo (`api/cron/process-mails.ts`):**
  - Desplegar el endpoint serverless en Vercel para procesar lotes (batch) de hasta 5 correos.
  - Implementar *Idempotencia de Envío* bloqueando el registro en estado `sending` antes de disparar la API de Resend.
  - Sostener el *Staggering* anti-spam con pausas asíncronas de 2 segundos entre envíos.

- [ ] **Gatillo Transaccional en Caliente (Trigger SQL):**
  - Implementar una función en PL/pgSQL y su correspondiente Trigger `on_booking_confirmed` en Supabase.
  - *Lógica del Trigger:* Cada vez que una fila en la tabla `bookings` sea insertada o actualizada con estado `confirmed`, inyectar de manera síncrona la plantilla y datos del correo en la tabla `email_queue`.

  ---

  