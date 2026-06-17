⚓ Bitácora Maestra: Beach Hotel Canasvieiras (Estado de Élite)
Este documento es el núcleo de contexto para la hidratación de modelos de IA y la gestión del proyecto. Define la arquitectura, el diseño de experiencia (UX), la identidad de marca y el estado técnico actual.
1. Visión y Filosofía de Marca
Narrativa: El proyecto ha evolucionado de un concepto de "Lujo Ejecutivo" a uno de "Refugio y Hospitalidad Auténtica". El objetivo es transmitir la calidez de un hogar frente al mar, priorizando el bienestar, la cercanía y la comodidad familiar.
Identidad Visual (Branding):
Tipografía: Uso estricto de PMN Caecilia Sans Head Heavy para la identidad corporativa.
Estrategia de Logo: Debido a la complejidad del kerning original, se ha optado por PNGs de Alta Densidad (Retina Ready) servidos desde Cloudinary, descartando la reconstrucción por vectores SVG para garantizar fidelidad al 100%.
Paleta: Negro Puro (#000000) para la marca en contextos claros, Blanco Puro (#FFFFFF) para contextos oscuros, y Azul Corporativo (#0F3B66) para elementos de acción y conversión.
2. Infraestructura y Performance (Stack Tecnológico)
Frontend: React 19 + Vite (Rendimiento extremo).
Estilos: Tailwind CSS v4 (Uso de variables dinámicas y capas @layer).
Animaciones: Framer Motion 12 (Tipado estricto con Variants y uso de as [number, number, number, number] para curvas Bézier).
Gestión de Medios: Cloudinary (SSoT de Activos).
Parámetros: f_auto (formato automático AVIF/WebP) y q_auto (calidad inteligente).
Local: El repositorio local está limpio de binarios pesados. Solo se mantienen archivos .gitkeep en las rutas de imágenes.
Backend & Datos:
Supabase: Infraestructura remota para la tabla de disponibilidad (blocked_dates).
iCal Sync: Lógica preparada para sincronizar disponibilidad con Airbnb.
3. Fuente Única de Verdad (SSoT) - Datos Reales
Dirección: Avenida das Nações, 375, Canasvieiras, Florianópolis, SC, Brasil (Rectificado según evidencia fotográfica).
Contacto: WhatsApp +55 (48) 99812-6650 | Correo reservas@beachcanasvieiras.com.
Dominio: https://beachcanasvieiras.com.
Autoría: Raz Podestá - MetaShark Tech (Inyectado en metadatos y pie de firma).
4. Auditoría de Componentes (Nivelación de Élite)
A. Header (Identidad)
Fondo: Negro profundo (gray-950) con desenfoque de fondo (backdrop-blur).
Logo: PNG blanco optimizado para Retina.
UX: Breakpoint lg para navegación desktop para evitar colisiones visuales con el logo en tablets.
B. Hero (Impacto)
Visual: Carrusel de 4 imágenes con efecto Ken Burns (micromovimientos de escala).
Animación: Efecto de "Flotación/Respiración" en el bloque de texto principal (floatingVariants).
Espacio: Se eliminó el logo redundante para subir el texto y ganar amplitud visual.
C. Rooms (Conversión)
Diseño: Tarjetas de "Soft-UI" con radio de 2.5rem (Airbnb style).
Lógica: Se eliminaron los precios fijos. Cada tarjeta dispara el BookingDialog.
Categorías: Single, Doble, Triple y Plan Grupal.
D. Booking Engine Lite (Aparato de Reservas)
Estética: Clon de Airbnb-Mini adaptado a móvil.
Calendario: Integración con react-day-picker v9.11.1 corregida (Cero errores de tipado en Chevron e IconLeft).
Conversión: Flujo de 2 pasos (Fechas -> Datos) que culmina en un mensaje estructurado de WhatsApp.
E. Testimonials & Attractions
Testimonios: Carrusel Embla fluido con ratings de 4.6 a 5.0 y avatares optimizados.
Atracciones: Sincronizadas con distancias reales desde la nueva dirección en Av. das Nações.
5. Instrucciones para la IA (Continuidad del Desarrollo)
Metodología Incremental: No modificar más de un archivo por interacción.
Validación de Tipos: Prohibido el uso de any. Se deben usar los tipos de Framer Motion (Variants) y React correctamente.
Higiene del Código: Antes de cada entrega, asegurar que no hay regresiones de color (el logo siempre debe respetar su tema dark o light).
Limpieza de Disco: No sugerir la descarga de imágenes locales. Todo activo nuevo debe pasar por el script de subida a Cloudinary.
Vercel Readiness: Asegurar que vercel.json mantenga los headers de caché para imágenes y el rewrite para el ruteo de la SPA.
6. Próximos Pasos Pendientes
Build Final: Ejecutar pnpm check && pnpm build para validar integridad.
Deploy: Configurar variables de entorno en Vercel (CLOUDINARY_API_SECRET, etc.).
SEO Audit: Verificar el renderizado del Schema JSON-LD en la herramienta de resultados enriquecidos de Google.

---

# Bitácora Evolutiva: Beach Hotel Canasvieiras
Este documento registra el historial de ingeniería y cambios estructurales.

## Fase 1: Cimientos de Élite (Completada)
- **Internacionalización:**
    - Implementación de motor i18next con soporte para `es-ES`, `en-US`, `pt-BR`.
    - Creación de compilador de diccionarios unificados (`scripts/compile-i18n.js`).
    - Integración en el ciclo de build de `package.json`.
- **Infraestructura de Datos:**
    - Configuración de `StorageService` para persistencia (Cookies y LocalStorage con TTL).
    - Middleware de detección de idioma (`useAppMiddleware.ts`) con Circuit Breaker para prevenir bloqueos de renderizado.
- **Saneamiento de Componentes:**
    - Refactorización de `Header`, `Hero`, `Rooms`, `Gallery`, `Attractions`, `ContactSection`, `Footer` bajo el patrón de **Trinidad Atómica (UI + JSON + Zod)**.
    - Integración segura de la API de Google Maps a través del Proxy de Manus.

## Fase 2: Transaccionalidad (En Curso)
- **Objetivo:** Implementar sistema de reservas inmutable.
- **Estado:** Estructura de tablas SQL definida (`rooms`, `bookings`, `guests`, `users`) con RLS habilitado.
- **Pendiente:** Integración de lógica transaccional en `BookingDialog.tsx` y creación de `BookingSchema.ts`.

---
*Cualquier cambio estructural debe ser registrado aquí antes de proceder a la siguiente refactorización.*

---
## Fase 2: Transaccionalidad y Experiencias Propias (Completada)
- **Desacoplamiento Total de Terceros (Manus):**
    - Se refactorizó el componente `Map.tsx` para eliminar la dependencia del proxy de Manus (`forge.manus.ai`).
    - Implementación de un cargador dual en `Map.tsx` que detecta de forma segura `VITE_GOOGLE_MAPS_API_KEY` desde el entorno local. Si no existe, se degrada elegantemente a un fallback dinámico oficial de Google Maps basado en la dirección física, garantizando costo cero y disponibilidad del 100%.
- **Módulo de Excursiones Propias (`Excursions.tsx`):**
    - Creación de la sección de experiencias gestionadas por el hotel, integrando los contratos de traducción (Trinidad Atómica) para `es-ES`, `en-US` y `pt-BR`.
    - Las excursiones del folleto físico (City Tour, Beto Carrero, Ilha do Campeche, etc.) están plenamente integradas con sus respectivas descripciones, duraciones, inclusiones, llamadas a la acción por WhatsApp y geolocalización.
- **Optimización UX Móvil (Fatiga de Scroll):**
    - Se modificaron las vistas móviles de `Rooms.tsx` y `Excursions.tsx`. Ahora, en lugar de apilar tarjetas verticalmente, se renderizan como carruseles de arrastre horizontal (*Snap-Scroll*) con aceleración por GPU.
    - Se implementó la táctica híbrida: exploración rápida horizontal en la landing y visualización rica con aislamiento de conversión en modales/drawers de alta fidelidad.
- **Sincronización de Enlaces:**
    - Actualización simétrica de menús de navegación en `Header.tsx` y `Footer.tsx` para habilitar el enlace directo a `#excursions`.

    ---

    ⚓ Bitácora Maestra: Beach Hotel Canasvieiras (Estado de Élite)
Este documento es el núcleo de contexto para la hidratación de modelos de IA y la gestión del proyecto. Define la arquitectura, el diseño de experiencia (UX), la identidad de marca y el estado técnico actual.

1. Visión y Filosofía de Marca
Narrativa: El proyecto ha evolucionado de un concepto de "Lujo Ejecutivo" a uno de "Refugio y Hospitalidad Auténtica". El objetivo es transmitir la calidez de un hogar frente al mar, priorizando el bienestar, la cercanía y la comodidad familiar.
Identidad Visual (Branding):
Tipografía: Uso estricto de PMN Caecilia Sans Head Heavy para la identidad corporativa, complementada con Outfit (Cuerpo) y Playfair Display (Títulos).
Estrategia de Logo: Debido a la complejidad del kerning original, se ha optado por PNGs de Alta Densidad (Retina Ready) servidos desde Cloudinary, descartando la reconstrucción por vectores SVG para garantizar fidelidad al 100%.
Paleta: Negro Puro (#000000) para la marca en contextos claros, Blanco Puro (#FFFFFF) para contextos oscuros, y Azul Corporativo (#0F3B66) para elementos de acción y conversión.

2. Infraestructura y Performance (Stack Tecnológico)
Frontend: React 19 + Vite (Rendimiento extremo).
Estilos: Tailwind CSS v4 (Uso de variables dinámicas y capas @layer).
Animaciones: Framer Motion 12 (Tipado estricto con Variants y uso de as [number, number, number, number] para curvas Bézier).
Gestión de Medios: Cloudinary (SSoT de Activos).
Parámetros: f_auto (formato automático AVIF/WebP) y q_auto (calidad inteligente).
Local: El repositorio local está limpio de binarios pesados. Solo se mantienen archivos .gitkeep en las rutas de imágenes.
Backend & Datos:
Supabase: Infraestructura remota para la tabla de disponibilidad (blocked_dates).
iCal Sync: Lógica preparada para sincronizar disponibilidad con Airbnb.

3. Fuente Única de Verdad (SSoT) - Datos Reales
Dirección: Avenida das Nações, 375, Canasvieiras, Florianópolis, SC, Brasil (Rectificado según evidencia fotográfica).
Contacto: WhatsApp +55 (48) 99812-6650 | Correo reservas@beachcanasvieiras.com.
Dominio: https://beachcanasvieiras.com.
Autoría: Raz Podestá - MetaShark Tech (Inyectado en metadatos y pie de firma).

4. Auditoría de Componentes (Nivelación de Élite)
A. Header (Identidad)
Fondo: Píldora flotante con desenfoque de fondo (backdrop-blur) en negro translúcido.
Logo: PNG blanco optimizado para Retina.
UX: Menú compacto con tipografía fina y mayúsculas. Selector de idioma flotante interactivo (Hover) y botón de CTA dinámico (Join or Sign In / Dashboard) enlazado al contexto de Supabase Auth.
B. Hero (Impacto)
Visual: Carrusel de 4 imágenes con efecto Ken Burns (micromovimientos de escala).
Animación: Efecto de "Flotación/Respiración" en el bloque de texto principal (floatingVariants).
Espacio: Se eliminó el logo redundante para subir el texto y ganar amplitud visual.
C. Rooms (Conversión)
Diseño: Tarjetas de "Soft-UI" con radio de 2.5rem (Airbnb style).
Lógica: Se eliminaron los precios fijos. Cada tarjeta dispara el BookingDialog.
Categorías: Single, Doble, Triple y Plan Grupal.
D. Booking Engine Lite (Aparato de Reservas)
Estética: Clon de Airbnb-Mini adaptado a móvil.
Calendario: Integración con react-day-picker v9.11.1 corregida (Cero errores de tipado en Chevron e IconLeft).
Conversión: Flujo automatizado hacia Stripe Checkout (reemplazando el flujo manual de WhatsApp).
E. Testimonials & Excursiones
Testimonios: Carrusel Embla fluido con API de Google Places conectada vía Proxy seguro para evitar exponer credenciales.
Excursiones: Carrusel infinito de autodesplazamiento cada 2 segundos con modales de carga diferida (Mapas + Galería).

5. Instrucciones para la IA (Continuidad del Desarrollo)
Metodología Incremental: No modificar más de un archivo por interacción.
Validación de Tipos: Prohibido el uso de any. Se deben usar los tipos de Framer Motion (Variants) y React correctamente.
Higiene del Código: Antes de cada entrega, asegurar que no hay regresiones de color (el logo siempre debe respetar su tema dark o light).
Limpieza de Disco: No sugerir la descarga de imágenes locales. Todo activo nuevo debe pasar por el script de subida a Cloudinary.
Vercel Readiness: Asegurar que vercel.json mantenga los headers de caché para imágenes y el rewrite para el ruteo de la SPA.

6. Próximos Pasos Pendientes
Backend Endpoints: Concluir la codificación y validación de `/api/checkout/session` y `/api/webhooks/stripe`.
Deploy: Verificar el paso final de la pasarela y la página `/success`.

---

# Bitácora Evolutiva: Beach Hotel Canasvieiras
Este documento registra el historial de ingeniería y cambios estructurales.

## Fase 1: Cimientos de Élite (Completada)
- **Internacionalización:** Motor i18next (`es-ES`, `en-US`, `pt-BR`) con compilador unificado.
- **Persistencia:** `StorageService` (Cookies y LocalStorage con TTL) y Middleware de idioma por IP.
- **Saneamiento:** Refactorización Atómica (UI + JSON + Zod) de todos los componentes estáticos.

## Fase 2: Módulos de Experiencia (Completada)
- **Mapas Seguros:** Desacoplamiento de Manus Proxy. `Map.tsx` utiliza la API de Google Maps de forma nativa e inyectada por Vercel.
- **Excursiones Propias:** Carrusel de alto rendimiento (Embla) con mapas condicionales de Google (Direcciones vs Satélite).
- **Optimización en la Nube:** Creación de scripts para inyectar activos generados por IA (Nano Banana) hacia Cloudinary (`upload-excursions.js`).

## Fase 3: Transaccionalidad de Élite y Automatización (Completada)
En esta fase dimos el salto de una "Landing Page Informativa" a un "Motor PMS Transaccional" de ciclo completo. Se documentan las decisiones críticas y fricciones resueltas:

### 1. Arquitectura de Correos Desacoplada (Ahorro de Licencias y Anti-Spam)
- **Decisión:** En lugar de saturar un servidor o pagar licencias de Google Workspace para correos masivos, implementamos un ecosistema híbrido.
- **Zoho Mail / Gmail:** Exclusivo para comunicación humana manual (`reservas@beachcanasvieiras.com`). Se implementó la estrategia de *Alias de Correo* en Workspace para que `ventas@` y otras direcciones lleguen a un solo buzón sin costo extra.
- **Resend + Supabase Queue:** Exclusivo para correos automatizados (confirmaciones, marketing).
- **Fricciones DNS resueltas:** Para la validación de Google Workspace y DKIM en Vercel, el equipo enfrentó problemas de permisos en la CLI (perfil erróneo) y errores de validación web (formatos IPv4). Se resolvió gestionando el cambio de alcance con `vercel switch` y forzando la entrada limpia del registro `TXT` (`google._domainkey`) y `MX` (`SMTP.GOOGLE.COM`) en el dashboard de Vercel.

### 2. Migración del Flujo de Pagos (De WhatsApp a Stripe)
- **Decisión:** Para profesionalizar el cobro y cumplir con normas bancarias internacionales (PCI-DSS), se eliminó el cierre de ventas por WhatsApp en el componente `BookingDialog.tsx`.
- **Implementación:** El botón "Pagar" ahora realiza un POST a nuestro servidor (Vercel Serverless Function `/api/checkout/session`). El servidor es la **Autoridad de Precios Inmutable**: consulta la tabla `rooms` en Supabase y emite la sesión para Stripe, imposibilitando el hackeo de precios desde el navegador.
- **Aprensión resuelta (Stripe Projects):** El equipo tuvo dudas ante la documentación de "Stripe Projects CLI". Se aclaró que nuestro stack ya estaba estructurado (Vercel + Supabase independientes), por lo que solo necesitábamos habilitar la **API de Pagos (Checkout)** y obtener las llaves clásicas (`pk_live`, `sk_live`, `whsec_`).

### 3. Táctica CRO: "Venta Primero, Registro Después"
- **Decisión:** Para reducir el abandono del carrito, el cliente compra como "invitado" en Stripe. 
- **Flujo Post-Venta:** Tras el pago exitoso, Stripe redirige al cliente a `/success?session_id=...`. La página captura la cookie de éxito y despliega un Pop-up. Se le pide al cliente **solo una contraseña**; el correo se rescata de los metadatos de Stripe y se fusiona automáticamente en Supabase Auth, creando el perfil sin formularios tediosos.

### 4. Correcciones Críticas de Entorno (Troubleshooting)
- **Crasheo de Renderizado en `useBookingNotifications.ts`:** El frontend fallaba al iniciar por una variable huérfana (`api`) en la matriz de dependencias del `useEffect`. Se eliminó la variable y se limpió el canal `supabase.removeChannel` para evitar fugas de memoria.
- **Integración de TanStack Query:** Se inyectó `QueryClientProvider` en `App.tsx` para garantizar que todas las llamadas asíncronas futuras de la aplicación tengan soporte de reintentos y caché.
- **Error 404 en el API Fetching ("Unexpected token T"):** Al intentar hacer checkout, Vercel devolvía el `index.html` en lugar de la respuesta del servidor. 
  - **Causa:** El archivo `vercel.json` interceptaba todo el tráfico hacia el Frontend. 
  - **Solución:** Se añadió la regla de reescritura explícita `{ "source": "/api/(.*)", "destination": "/api/$1" }` para exponer correctamente el backend serverless.
- **Resolución de Assets (Cloudinary):** Dudas sobre la extensión de las fotos en código (`.webp`) versus la base de datos (`.jpg`). Se clarificó la superioridad del parámetro de transformación dinámica `f_auto,q_auto`, el cual anula la extensión rígida y sirve el formato óptimo (AVIF/WebP) evaluado en tiempo de ejecución por la CDN.

---

Fase 3: Transaccionalidad, Saneamiento de Tipos y Auth (v2026-06-15)
1. Arquitectura Serverless e Integración de Tipos (Vercel)
Decisión: Se removieron los tipos genéricos de express de los archivos dentro de la carpeta /api/ para resolver errores de compilación (TS2339) en Vercel.
Solución: Se inyectó la dependencia @vercel/node y se refactorizaron los endpoints (retrieve.ts, session.ts, stripe.ts) para utilizar de forma nativa VercelRequest y VercelResponse. Esto garantiza que Vercel exponga correctamente los parámetros de cuerpo, consulta y cabeceras sin necesidad de montar un servidor de Express completo en cada función.
2. Saneamiento de Autenticación, Triggers y RLS (Supabase)
Fisura Resuelta (Deduplicación de Registros): Se instaló una validación lógica a nivel de webhook (stripe.ts) para verificar si la reserva ya existía con estado confirmed antes de re-insertarla, evitando filas duplicadas en caso de reintentos de Stripe.
Fisura Resuelta (Bypass de RLS en SDK): Se identificó que al autenticar el cliente de Supabase con credenciales de usuario, este deja de actuar como service_role y pasa a enviar el token JWT del usuario, bloqueando la consulta a public.users debido a la falta de políticas de lectura.
Solución: Se aplicó la política RLS "Permitir lectura individual de perfiles" para autorizar a los usuarios logueados a leer únicamente su propia fila, resolviendo el crash silencioso del linter de pruebas y garantizando que el AuthContext del frontend recupere el rol del usuario de forma segura.
Sincronización Retroactiva: Se creó un script administrativo (create-super-admin.ts) que crea y auto-confirma usuarios directamente mediante la API de administración (bypasseando el flujo SMTP), y se ejecutó un query de backfill SQL para sincronizar retroactivamente el rol developer de la cuenta razpodesta@gmail.com.
3. Estándar de Calidad y Pureza de Código (ESLint v9 & React 19)
eslint.config.js (Flat Config): Se instaló ESLint v9 en modo ESM (apuntando a nuestro proyecto "type": "module") para automatizar el análisis estático de dependencias.
Framer Motion & Purity: Se resolvió la advertencia react-hooks/purity en DeveloperConsole.tsx al remover llamadas directas e impuras a Date.now() en la fase de renderizado. Los logs e históricos simulados ahora se definen como constantes estáticas del módulo fuera de la función de render.
Sincronización de Estado sin Efectos: Se resolvió la advertencia react-hooks/set-state-in-effect en BookingDialog.tsx reemplazando los efectos síncronos de post-renderizado por la sincronización de estado de React 19 durante la fase de renderizado (usando el patrón prevIsOpen).
4. Atomización de Responsabilidades (UI)
BookingDialog: Se dividió el componente monolítico delegando el Calendario a BookingDatePicker.tsx y el formulario con SSO (Google / Facebook) a BookingDetailsForm.tsx, centralizándolo en el orquestador principal.
Header: Se integró el menú de perfil premium con avatar, nombre desplegable y opciones de control (UserProfileMenu.tsx), y se implementó un header inteligente (Smart Scroll) que se oculta al bajar y reaparece al subir usando transiciones de framer-motion.

---

## Fase 4: Consolidación del Ecosistema PMS (Property Management System) Autogestionable
**Fecha de Hito:** Junio 2026
**Visión Arquitectónica:** Transformar la aplicación de un portal estático/transaccional a un **SaaS Multi-Tenant de Autogestión Hotelera**. El sistema ahora es capaz de administrar inventarios, asignaciones heurísticas, control de pisos (Housekeeping), tarifas dinámicas y roles de usuario bajo una arquitectura de "cero fricciones" y máxima seguridad (ISO 27001).

### 1. Atomización Estructural y Patrón Smart/Dumb
Para garantizar un rendimiento de renderizado impecable y escalabilidad a futuro, el orquestador monolítico `AdminDashboard.tsx` fue desensamblado en sub-aparatos de responsabilidad única. 
*   **Orquestador Híbrido (`AdminDashboard.tsx`):** Se refactorizó para actuar únicamente como un contenedor inteligente ("Smart Component"). Evalúa el rol del usuario mediante Supabase Auth y despacha los datos cacheados con `TanStack Query` hacia los componentes de presentación. Presenta un layout inmersivo (con Sidebar) para Staff, y un Top-Nav limpio para Huéspedes/Agencias.
*   **Módulos de Recepción (SaaS-Ready):** 
    *   `HousekeepingReport.tsx`: Panel interactivo para la gestión de limpieza. Soporta tareas patrón automáticas (creadas vía triggers en DB) y tareas de mantenimiento manuales inyectadas en caliente.
    *   `RatesAvailability.tsx`: Matriz bidimensional para la carga masiva de tarifas base, control de inventario (`min_stay`, `closed`) y manejo multidivisa.
    *   `BookingSearch.tsx`: Módulo CRM para el personal. Permite filtrar huéspedes, ejecutar Check-in (`IN`) y Check-out (`OUT`), y lanzar notificaciones automatizadas por WhatsApp.
    *   `AmenitiesConfig.tsx`: Creado bajo el Principio de Inversión de Dependencias. Permite configurar el catálogo de comodidades inyectando diccionarios dinámicos, preparándolo para ser revendido a cualquier hotel (Marca Blanca).

### 2. Innovación Algorítmica: Defragmentación de Inventario (IA)
*   **Aparato `RoomMatrix.tsx`:** Se desarrolló un calendario visual de ocupación que mapea el cruce entre habitaciones físicas y línea de tiempo (15 días).
*   **Smart Allocation (Asignación Heurística):** Se programó un algoritmo que evalúa el estado de limpieza actual de las habitaciones y la densidad de reservas futuras. El sistema asigna automáticamente a los huéspedes ("Walk-ins" o nuevas reservas) en el *slot* físico que genere la menor fragmentación del inventario, preservando los bloques de disponibilidad largos para estadías de alto valor.

### 3. Seguridad de Base de Datos y Control de Accesos (RBAC)
*   **Bypass y Sincronización de Roles:** Se corrigió un defecto de diseño donde los usuarios creados vía OAuth quedaban huérfanos de rol. Se implementó el script `create-super-admin.ts` utilizando la API de administración para crear cuentas auto-verificadas y saltar la restricción del servidor SMTP (`email_rate_limit`).
*   **Políticas RLS Rigurosas:** Se inyectó una política en Supabase (`auth.uid() = id`) para permitir que la sesión de frontend lea su propio rol en `public.users`, corrigiendo los bloqueos silenciosos del cliente.
*   **Topología de Base de Datos (`seed-pms-rooms.ts`):** Se creó un script idempotente que construye la matriz física del hotel de forma dinámica (ej. 4 pisos, 35 habitaciones).

### 4. Calidad de Código de Élite (ESLint v9 & React 19)
*   **Flat Config (ESM):** Se eliminaron las configuraciones obsoletas de CJS. El proyecto ahora está blindado por `eslint.config.js`, analizando de forma estricta el tipado y las dependencias de hooks.
*   **Erradicación de Impurezas (react-hooks/purity):** Se refactorizó `DeveloperConsole.tsx` para eliminar la mutación de fechas (`Date.now()`) durante la fase de renderizado, encapsulándolas estáticamente.
*   **Eliminación del 'State in Effect':** En componentes como `BookingDialog.tsx` y `AmenitiesConfig.tsx`, se aplicó el patrón oficial de React 19 para la inicialización y sincronización de estado perezoso (Lazy State) durante el renderizado, erradicando los renders en cascada destructivos.
*   **Tipado Estricto (Zero 'any'):** Todo el código se refactorizó utilizando `unknown`, aserciones `instanceof Error` y contratos Zod.

### 5. Experiencia de Usuario (UX) e Internacionalización
*   **Smart Header:** El `Header.tsx` fue descompuesto. Ahora implementa un sistema de ocultamiento por GPU al hacer scroll down (foco de lectura) y reaparición al hacer scroll up.
*   **Menú de Perfil Premium:** Si el usuario está autenticado, la cabecera muestra un `UserProfileMenu.tsx` (Glassmorphism) con su Avatar real de Google o iniciales calculadas, eliminando botones toscos.
*   **Compilador i18n Optimizado:** El script `compile-i18n.js` ahora elimina estados previos, normaliza a minúsculas (`toLowerCase`) para evitar colisiones entre sistemas operativos, y detiene el build si detecta un JSON vacío.

### 6. Roadmap y Próximos Pasos
1.  **Cola de Correos Transaccionales (`email_queue`):** Integrar la tabla de base de datos con el servicio `mail.ts` usando cron jobs (Vercel Cron) para despachar correos de confirmación con retrasos síncronos (Anti-Spam).
2.  **SEO y Microdatos:** Inyección de esquemas `JSON-LD` en la raíz de la página para la indexación enriquecida en Google Hotel Search.
3.  **Auditoría de Despliegue Final:** Monitorear logs en Vercel para asegurar la correcta comunicación del Webhook de Stripe en el entorno de producción.

---

⚓ Registro de Bitácora Evolutiva: Consolidación PMS SaaS Multicanal y Saneamiento de Calidad de Código (Fase 4 - Junio 2026)
Este documento registra de forma pormenorizada e inmersiva las últimas decisiones de arquitectura, desacoplamientos de software, justificaciones técnicas y flujos implementados en el ecosistema Beach Hotel Canasvieiras.
1. Visión Holística y Objetivos de la Arquitectura (El "Por Qué")
La transición de una landing page informativa hacia un SaaS Multi-Tenant de Gobernanza Hotelera exigía migrar de una lógica monolítica y acoplada a un modelo de Componentes Atómicos Especializados.
Nuestros objetivos principales en esta fase han sido:
Aislamiento y Segregación de Privilegios (ISO 27001): El personal de limpieza no debe lidiar con finanzas ni tarifas, y el cliente no debe ver el backend operativo. Cada rol (RBAC) debe recibir una interfaz diseñada exclusivamente para su dispositivo y su labor [client/src/pages/AdminDashboard.tsx].
Cero Latencia en Base de Datos (Performance): Los procesos pesados de red (APIs de pasarelas de pago, envíos de correo, sincronización con OTAs como Booking y Decolar) deben desacoplarse del flujo síncrono del cliente para no bloquear el hilo de ejecución principal ni causar sobre-reservas (Overbookings) [api/checkout/session.ts, client/src/lib/mail.ts].
Pureza de Código y Cero Advertencias (React 19 & ESLint v9): La base de código se ha blindado contra renderizados en cascada (cascading renders), funciones impuras en fase de renderizado y aserciones de tipo genéricas (any), logrando un compilado inmaculado [client/src/components/ui/carousel.tsx, client/src/components/ui/sidebar.tsx, client/src/pages/AdminDashboard.tsx].
2. Hitos de Ingeniería y Desacoplamiento de Aparatos (El "Qué")
Módulo A: SEO de Próxima Generación e Integración de Datos Estructurados
Qué se hizo: Inyección de un esquema JSON-LD enriquecido en client/index.html [client/index.html] y saneamiento de metadatos Open Graph/Twitter Cards [client/index.html].
Cómo se hizo: Se integró el esquema oficial de schema.org/Hotel agregando coordenadas de geolocalización inmutables, rangos de precio, fotos de Cloudinary y políticas operativas de check-in/check-out [client/index.html].
Por qué: Para indexar de forma nativa la propiedad en Google Hotel Search, permitiendo a Google rastrear las tarifas del hotel directamente desde los metadatos de cabecera, aumentando la visibilidad orgánica a costo cero.
Módulo B: Saneamiento de Compilación y Pureza de React 19
Qué se hizo: Corrección de fallas críticas de compilado en los componentes comunes y de UI (useMobile.tsx, carousel.tsx, sidebar.tsx, ContactSection.tsx, Logo.tsx y AuthContext.tsx).
Cómo se hizo:
ContactSection.tsx: Reemplazo de la mutación de window.location.href por window.open(..., '_self') para cumplir con la regla de inmutabilidad de React 19.
carousel.tsx y useMobile.tsx: Mover llamadas síncronas de setState a colas asíncronas (setTimeout / inicializadores perezosos de estado) para erradicar los renderizados en cascada.
sidebar.tsx: Se eliminó el uso de la función impura Math.random() dentro del renderizador, envolviéndola de forma idempotente en un useState perezoso. Se desactivó Fast Refresh para este silo mediante /* eslint-disable react-refresh/only-export-components */.
AuthContext.tsx: Se redefinió la función de flecha fetchUserRole como una función clásica con hoisting nativo para evitar la zona muerta temporal (Temporal Dead Zone) al llamarla antes de su declaración.
Módulo C: Gobernanza Inteligente de Pisos y Sincronización de Perfiles
Qué se hizo: Creación de las tablas guest_requests y housekeeping_audits, y desarrollo del aparato HousekeeperPortal.tsx.
Cómo se hizo:
Se diseñó una interfaz móvil de alto contraste con objetivos de pulsación sobredimensionados para el auxiliar de limpieza.
Se implementó una suscripción en tiempo real vía canal de Supabase para que las solicitudes de huéspedes (ej: pedir toallas) aparezcan de forma inmediata en la pantalla del auxiliar de limpieza.
Se integró la directiva capture="environment" en el input de tipo archivo para forzar la apertura de la cámara trasera del dispositivo móvil y reportar incidencias visuales.
Trigger SQL en Supabase: Se programó una función de base de datos (handle_new_user_sync) que se ejecuta síncronamente al crear una cuenta en Supabase Auth, sincronizando el rol e inyectando un perfil inicial por defecto en public.guests (previniendo la tabla vacía de la auditoría anterior).
Módulo D: Motor de Sincronización Multicanal iCal (Booking & Decolar)
Qué se hizo: Diseño del Silo de Conectividad room_ota_connections y creación del motor asíncrono universal en /api/ota/.
Cómo se hizo:
Se desacopló el motor de canales de la lógica de habitaciones. La nueva tabla room_ota_connections permite a una sola suite física conectarse a infinitas OTAs (Booking, Decolar, Airbnb, etc.) simultáneamente.
Sincronización de Salida (api/ota/export.ts): Exporta de forma segura mediante un token criptográfico único por canal la disponibilidad de bloqueos del PMS en formato estándar RFC 5545.
Sincronización de Entrada (api/ota/sync.ts): Un worker en segundo plano que corre cada 15 minutos, descarga los archivos .ics de Booking y Decolar, los decodifica utilizando ical.js y bloquea las fechas mediante un upsert idempotente. Resuelve el error de tipo TS2339 convirtiendo a objetos nativos JS Date.
Módulo E: Centralización i18n & SSoT (Comunicaciones WhatsApp)
Qué se hizo: Creación del namespace centralizado whatsapp.json y del esquema de validación whatsapp.schema.ts.
Cómo se hizo: Se extrajeron todas las plantillas y copys transaccionales de WhatsApp de la aplicación y se centralizaron en un único diccionario bilingüe con soporte Zod, inyectándolo en WhatsAppButton.tsx, Excursions.tsx, Attractions.tsx y BookingSearchRow.tsx.
3. Mapeo de Flujos y Casos de Uso (El "Cómo")
Caso de Uso 1: Registro Administrativo de Funcionario (RBAC)
code
Code
[ Administrador (AdminPMS) ] 
      │
      ├── Accede a pestaña 'Configuraciones > Personal' (StaffManagement.tsx)
      ├── Digita Nombre Completo, Rol (ej: 'housekeeper') y Nombre de Usuario (ej: 'b.martinez')
      └── Envía Formulario (POST a /api/admin/create-staff)
            │
      [ Servidor Serverless (Vercel) ]
            ├── 1. Valida criptográficamente el JWT del Administrador para evitar escalada de privilegios
            ├── 2. Genera email corporativo (b.martinez@beachcanasvieiras.com)
            ├── 3. Genera contraseña temporal segura (Bch_xxxxxx!)
            ├── 4. Crea usuario en auth.users con 'email_confirm: true' para saltar confirmación SMTP
            └── 5. Retorna credenciales de acceso para copia rápida en WhatsApp
                  │
      [ Supabase Database (Engine) ]
            └── Trigger 'on_auth_user_created' intercepta inserción:
                  ├── Crea registro síncrono en public.users con rol 'housekeeper'
                  └── Crea perfil por defecto en public.guests dividiendo el nombre
Caso de Uso 2: Sincronización Multicanal de Canales (OTAs)
code
Code
[ Vercel Cron Job (Cada 15 min) ] ──► Invoca de forma segura /api/ota/sync
                                            │
                                 [ Sincronizador de Canales ]
                                            ├── 1. Descarga conexiones activas de Supabase
                                            ├── 2. Consulta iterativamente los calendarios .ics
                                            │      (ej. Decolar Extranet & Booking Extranet)
                                            ├── 3. Parsea formato iCal de forma segura con ical.js
                                            └── 4. Bloquea las fechas con 'upsert' usando el UID de la OTA
Caso de Uso 3: Operación de Limpieza Móvil en Caliente
code
Code
[ Huésped de la Habitación 101 ] ──► Solicita Toallas desde la Web (guest_requests)
                                            │
                                 [ Supabase Realtime Channel ] (Suscripción activa)
                                            │
[ Auxiliar de Limpieza en Móvil ] ◄── Alerta instantánea en Header (HousekeeperPortal.tsx)
      ├── Selecciona Habitación 101 -> Cambia estado a "En Limpieza"
      ├── Completa checklist interactivo síncrono (Bases de datos actualizándose)
      ├── Detecta ampolleta rota -> Presiona "Reportar Falla" -> Abre Cámara Nativa del celular
      └── Finaliza Checklist -> Marca como "Limpia" -> Recepción (AdminPMS) notificada al instante
4. Cumplimiento de Normas Internacionales e Integridad
ISO 27001 (Seguridad y Privacidad): El endpoint /api/admin/create-staff prohíbe que usuarios comunes o agentes externos creen cuentas con privilegios administrativos. La inyección de firmas JWT y la RLS de las tablas de Supabase garantizan que un auxiliar de limpieza solo lea sus tareas asignadas y un huésped solo lea su propio perfil [client/src/contexts/AuthContext.tsx, client/src/pages/AdminDashboard.tsx].
PCI-DSS (Transacciones Seguras): Al derivar el cobro a Stripe Checkout mediante redirecciones firmadas del lado del servidor, el PMS nunca almacena números de tarjeta ni datos bancarios en Supabase, eliminando por completo el alcance de la auditoría de tarjetas en la base de datos de nuestro hotel.
SOLID (Clean Code): La atomización estricta de BookingSearch y Excursions asegura que cada componente realice una única tarea especializada. Los barriles (index.ts) encapsulan las exportaciones y aíslan los detalles internos del sistema.

--

## Hito: Onboarding de Seguridad, Validación Multi-País y Saneamiento Vercel (Junio 2026)
- **Capa de Onboarding e Interceptor del Dashboard:**
    - Implementado un interceptor reactivo en `AdminDashboard.tsx` que detecta si la cuenta recién creada posee la metadata de contraseña temporal activa (`temp_password_active: true`).
    - Diseñado el aparato modular `OnboardingForm.tsx` que fuerza el cambio de contraseña a nivel de Supabase Auth e hidrata la información residencial del empleado en la tabla pública.
- **Validación Telefónica Industrial y Sanitización L0:**
    - Integración exitosa de la biblioteca de código abierto `libphonenumber-js` para validar y estructurar de forma interactiva números telefónicos bajo el estándar internacional E.164.
    - Implementación de filtros de desinfectación preventiva en el esquema Zod `onboarding.schema.ts` para depurar caracteres peligrosos y neutralizar cualquier vector de inyección SQLi o ataques de scripts (XSS).
- **Resolución de Regresiones y Saneamiento Vercel (Compilación Limpia):**
    - Saneados los errores `TS7006` en los exportadores iCal y OTA (`api/ical/rooms/export.ts` y `api/ota/export.ts`) mediante el tipado estricto del parámetro de iteración usando una interfaz local `BookingRow`.
    - Resueltos los errores de tipo `TS2339` en el endpoint administrativo `api/admin/create-staff.ts` mediante la aserción de tipo segura `ExtendedAuthClient`, eliminando aserciones `any` e integrando el Flat Config de ESLint v9.
- **Optimización de Diagnóstico Dinámico:**
    - Refactorizado el script de auditoría `scripts/supabase/db-audit.ts` para consultar dinámicamente la especificación OpenAPI de PostgREST, reflejando fielmente la estructura de las 10 tablas activas de la base de datos sin rigideces en el código.

    ---

    ## Hito: Seguridad de Concurrencia, Validación Multi-País y Saneamiento Serverless (Junio 2026)
- **Resolución de Congelamiento en Autenticación (Deadlock Workaround):**
    - Identificado y resuelto un bloqueo mutuo (*deadlock*) crítico en `supabase-js` v2 dentro de `client/src/contexts/AuthContext.tsx`. Las llamadas asíncronas de base de datos (`fetchUserRole`) ejecutadas dentro del ciclo síncrono de `onAuthStateChange` se derivaron de forma segura a macro-tareas no bloqueantes (`setTimeout` con retraso 0), liberando la comunicación del cliente y permitiendo cargas instantáneas en el dashboard.
- **Validación Telefónica de Nivel Industrial y Sanitización L0:**
    - Integración de la biblioteca de código abierto `libphonenumber-js` para validar de forma reactiva números telefónicos bajo el estándar global E.164.
    - Implementada desinfectación de entradas en `client/src/locales/schemas/onboarding.schema.ts` y en el formulario de primer acceso para neutralizar caracteres peligrosos, bloqueando de raíz cualquier intento de inyección de código (SQLi/XSS).
- **Control de Primer Acceso (Onboarding de Personal):**
    - Completado el aparato modular `client/src/components/dashboard/reception/OnboardingForm.tsx` con soporte para tres idiomas (`pt-BR`, `es-ES`, `en-US`), forzando al personal a cambiar su contraseña temporal e hidratar su dirección y teléfono antes de habilitar el acceso al PMS.
- **Saneamiento de Compilación en Vercel (TypeScript SSoT):**
    - Saneados los errores `TS7006` en los exportadores iCal y OTA (`api/ical/rooms/export.ts` y `api/ota/export.ts`) mediante el tipado estricto del parámetro de iteración usando la interfaz local `BookingRow`.
    - Resueltos los errores de tipo `TS2339` en el endpoint administrativo `api/admin/create-staff.ts` mediante la aserción de tipo segura `ExtendedAuthClient`, eliminando aserciones `any` e integrando el Flat Config de ESLint v9.
- **Inyección Defensiva de Analíticas en HTML:**
    - Refactorizado `client/index.html` para reemplazar la etiqueta de script estática de Umami por un cargador dinámico autoejecutable, evitando el error público `ERR_HTTP2_PROTOCOL_ERROR` si las variables de entorno de producción no están declaradas en Vercel.
- **Optimización de Diagnóstico de Base de Datos:**
    - Refactorizado el script de auditoría `scripts/supabase/db-audit.ts` para consultar dinámicamente la especificación OpenAPI de PostgREST, reflejando fielmente la estructura de las 10 tablas activas de la base de datos sin rigideces en el código.
    
    ---

    




