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

⚓ Bitácora de Ingeniería: Consolidación de Identidades, Transaccionalidad y Mensajería Multilingüe (v2026-06-17)
Este registro técnico documenta el diseño de la arquitectura de identidades unificada, la mitigación de carreras de datos, el flujo de mensajería multilingüe asíncrona y la evaluación de persistencia criptográfica para el ecosistema Beach Hotel Canasvieiras.
1. El Desafío Resuelto: El Ciclo de Vida del Huésped (SSoT)
El Problema de la Carrera de Datos (Stripe Webhook vs Redirección)
En sistemas transaccionales con redirección (Checkout-First, Register-Later), la velocidad de redirección del navegador tras un pago exitoso suele ser inferior a un segundo, mientras que los webhooks de Stripe pueden experimentar latencias de red de hasta 5 segundos.
Impacto: El huésped llegaba a /success y el servidor de base de datos aún no tenía registro de su cuenta pública public.users ni de su perfil public.guests. Al intentar registrar su contraseña definitiva, el sistema fallaba.
Mitigación: Rediseñamos api/checkout/claim-account.ts para actuar como un controlador resiliente. Si al momento de reclamar la cuenta detecta que el webhook de Stripe está demorado, la API de administración crea de forma proactiva y en caliente la cuenta en auth.users, lo que dispara síncronamente los triggers de base de datos y permite asociar el guest_id a la reserva de manera atómica [api/checkout/claim-account.ts, scripts/supabase/migration-pms-v2.sql].
El Vacío de Internacionalización en Vouchers
El envío de duplicados de comprobantes (api/checkout/send-copy.ts) operaba con una plantilla estática en español.
Solución: Re-diseñamos el esquema de base de datos de plantillas (email_templates) para operar bajo una clave primaria compuesta (id, locale) [scripts/supabase/migration-templates.sql, scripts/supabase/migration-pms-v2.sql]. El backend ahora lee el locale almacenado de forma inmutable en la metadata de Stripe, consulta el asunto y HTML en el idioma nativo del comprador (es-ES, en-US, pt-BR) y compila las variables de forma dinámica antes de encolarlo en email_queue [api/checkout/send-copy.ts].
2. Anatomía de los Aparatos Creados y Modificados
api/webhooks/stripe.ts (Webhook de Conciliación): Procesa la creación preventiva de cuentas y encolamiento asíncrono utilizando el guest_id relacional inmaculado [api/webhooks/stripe.ts].
api/checkout/claim-account.ts (API de Activación Resiliente): Resuelve condiciones de carrera creando al usuario bajo demanda de forma administrativa si el webhook experimenta latencias de red [api/checkout/claim-account.ts].
api/checkout/send-copy.ts (API de Despacho Localizado): Consulta a public.email_templates filtrando por clave compuesta (id, locale) y encola vouchers personalizados en el idioma nativo del comprador [api/checkout/send-copy.ts].
client/src/pages/Success.tsx (Pantalla de Éxito Personalizada): Despliega el desglose financiero expandido de la reserva y cuenta con el widget interactivo que invoca al despacho alternativo [client/src/pages/Success.tsx].
client/src/components/dashboard/reception/TemplateManager.tsx (Editor de Vouchers): Formulario optimizado mediante el patrón de remontado por llave de React 19 para evitar renders en cascada y habilitar la exportación/impresión PDF nativa de vouchers [client/src/components/dashboard/reception/TemplateManager.tsx].

---

## Hito: Implementación de Persistencia Segura y Tolerancia a Fallos (Stripe Outage Fallback)
**Fecha:** 17 de Junio, 2026  
**Estatus:** Consolidado y Desplegado en Producción

### 1. Contexto y Problema
En el flujo transaccional "Venta Primero, Registro Después" (CRO), el cliente es redirigido temporalmente al dominio de Stripe (`checkout.stripe.com`) para procesar el cobro. Al ocurrir esto:
1. El estado síncrono en memoria de la aplicación React (SPA) se destruye por completo.
2. Al retornar a la página de éxito (`/success`), depender exclusivamente de consultas en tiempo real a las APIs de Stripe o Supabase para reconstruir el resumen de compra de Karla Valeska introduce puntos de fricción severos:
   * **Latencia de Red:** El FCP (First Contentful Paint) se degrada debido a los viajes de ida y vuelta (roundtrips) de la API.
   * **Tolerancia a Fallos:** Si Stripe experimenta una degradación de servicio o caída temporal, la página de éxito colapsa, impidiendo que el huésped cree su contraseña y complete el ciclo de conversión.

### 2. Evaluación de Alternativas de Almacenamiento

*   **LocalStorage / SessionStorage:** Descartado de inmediato. Son vulnerables a lecturas maliciosas mediante ataques de Scripting en Sitios Cruzados (XSS) e inyecciones en el DOM. Además, pierden contexto al cambiar de dominio.
*   **Base de Datos Relacional Temporaria:** Robusta, pero introduce sobrecarga redundante de escritura/lectura en Supabase por cada carrito abandonado por el usuario, degradando el performance de base de datos a escala.
*   **Cookie de Sesión Encriptada y Autenticada:** Seleccionada como la solución óptima. Ofrece inmutabilidad, protección nativa del navegador e independencia ante la caída de servicios externos.

### 3. Decisión de Arquitectura y Especificación de Diseño
Implementamos una cookie temporal de 30 minutos llamada `beach_checkout_intent` gobernada bajo las siguientes directivas estrictas de seguridad (ISO 27001):

1.  **Cifrado Simétrico Autenticado (AES-256-GCM):** La cookie no se almacena en texto plano. Se cifra en caliente en el servidor mediante el módulo `crypto` de Node.js, utilizando una clave derivada de 256 bits a partir de `JWT_SECRET`. El formato incluye un vector de inicialización (`IV`) único de 12 bytes y una etiqueta de autenticación (`Auth Tag`) de 16 bytes para evitar ataques de manipulación o falsificación de datos (Data Tampering).
2.  **Gobernanza de Cookies en el Navegador:**
    *   `HttpOnly`: Bloquea el acceso al hilo de ejecución de JavaScript, garantizando inmunidad total contra robos por XSS.
    *   `Secure`: Fuerza la transmisión de la cookie únicamente a través de canales cifrados HTTPS.
    *   `SameSite=Lax`: Directiva mandatoria que asegura que el navegador envíe la cookie de regreso de forma nativa al retornar desde el dominio de Stripe.
3.  **Algoritmo de Tolerancia Activa:**
    El endpoint de recuperación `/api/checkout/retrieve` opera bajo un bloque de contingencia de doble ruta:
    *   **Ruta Principal:** Consulta de forma síncrona a la API de Stripe expandiendo `line_items`.
    *   **Ruta de Fallback:** Si Stripe falla por timeout, tasa de límite o caída de red, el controlador descifra de forma segura la cookie local y retorna el carrito original. El usuario visualiza su confirmación de compra y activa su cuenta de forma 100% transparente.

### 4. Aparatos Modificados / Creados
*   `api/checkout/session.ts` -> Serializa, encripta y escribe la cabecera `Set-Cookie` en la inicialización del pago.
*   `api/checkout/retrieve.ts` -> Descifra la cookie en el bloque de excepciones del handler para garantizar redundancia y alta disponibilidad.

---

⚓ Registro de Bitácora Evolutiva: Consolidación PMS SaaS y Nivelación Estética de Marca Blanca
Fecha: 17 de Junio, 2026 (10:24 PM America/Sao_Paulo)
Estatus: Infraestructura Saneada, Telemetría Activa y Preparada para Despliegue de Producción (Vercel-Ready).
1. Contexto y Antecedentes Técnicos
Al iniciar esta fase de consolidación, el proyecto presentaba una madurez funcional avanzada (gestión de inventario físico, asignación heurística, control de limpieza de habitaciones, y una pasarela de pago "Checkout-First, Register-Later" integrada). Sin embargo, existían cuellos de botella de diseño que limitaban su escalabilidad, paridad tipográfica y estabilidad en compilación de producción:
Acoplamiento de Estilos: Colores de fondo, bordes e indicadores estaban hardcodeados de forma rígida en la mayoría de los componentes de la interfaz. Esto impedía la alternancia de temas en el PMS y bloqueaba la parametrización de marca blanca para la landing page.
Fugas de Memoria y Renders en Cascada: Múltiples componentes usaban temporizadores y escuchas de eventos del navegador sin lógica de limpieza al desmontar, además de registrar sincronizaciones de estado síncronas que provocaban renderizados en cascada redundantes.
Fallas de Compilación Estática (ESLint v9 & TS): Existían advertencias de tipos implícitos y explícitos any en capturas de excepciones de red, y errores específicos de resolución de módulos relacionales (TS2307 en el Router, TS2304 por helpers faltantes y TS2554 en firmas de traducción).
2. Decisiones Críticas de Arquitectura (Justificación de Ingeniería)
A. Desacoplamiento de Ámbitos Visuales (Dual-Scope Theme System)
Decisión: Separar drásticamente el hilo estilístico de la Landing Page pública de la gobernanza de temas operativos del PMS Dashboard.
Implementación:
El Webportal (Público) se refactorizó para consumir de forma exclusiva variables semánticas de Tailwind v4 (bg-card, bg-muted, border-border, text-foreground, text-muted-foreground). Si una cadena hotelera requiere personalizar el portal con sus colores corporativos, solo debe alterar el bloque :root de index.css sin tocar el código.
El PMS Dashboard (Personal) responde de forma aislada al atributo HTML data-dashboard-theme inyectado en el nodo raíz por el ThemeProvider de forma síncrona, alternando entre tres preajustes específicos: light (Recepción diurna), sovereign-dark (Turno nocturno) y gemini-dark (Consola de alta tecnología inspirada en AI Studio) [2].
B. Corrección de Rendimiento en Reservas (Yield Management Optimization)
Decisión: Eliminar el bloqueo síncrono del día de Check-Out en el motor de disponibilidad e importadores iCal.
Implementación: En useBlockedDates.ts y en el cron ical-import.ts, se modificó el rango devuelto por eachDayOfInterval. Al restar un día de estancia a la fecha de salida (subDays(end, 1)), el sistema asume de forma correcta que el día de salida queda libre para ingresos. Esto libera el slot de check-out a las 11:00 AM para un check-in a las 2:00 PM del mismo día, erradicando fugas de conversión y sobre-reservas.
C. Capa de Observabilidad Serverless Silenciosa (Zero-Overhead Logging)
Decisión: Evitar la instalación de agentes de telemetría pesados (como OpenTelemetry) en el backend, los cuales incrementan drásticamente los cold starts de las funciones serverless de Vercel.
Implementación: Se diseñó el decorador de orden superior withObservability. Este middleware encapsula todas las funciones de la carpeta api/, calcula la latencia con alta resolución (performance.now()), captura direcciones IP de origen (ISO 27001), inyecta un identificador de transacciones único (traceId) y vuelca logs estructurados JSON a stdout [2]. Vercel captura estos búferes asíncronamente y los redirige a Axiom con impacto de rendimiento cero en el cliente.
D. Profiling Seguro en Concurrent Mode (React 19)
Decisión: Evitar el antipatrón de acceso y mutación de Refs durante la fase de renderizado para medir el rendimiento de carga visual.
Implementación: El hook usePerformanceProfiler.ts realiza la captura e indexación del tiempo transcurrido desde la carga de la página (Time to Mount) estrictamente dentro del ciclo de vida asíncrono de un useEffect, despachando la telemetría mediante requestIdleCallback para no congelar el hilo de interacciones del cliente.
3. Mapeo de Refactorizaciones y Saneamiento Realizado
Se detalla la intervención atómica y granular realizada sobre cada archivo del proyecto:
A. Capa de Servidor y Endpoints Serverless (/api)
api/utils/observability.ts: Middleware de observabilidad. Se añadió importación nativa de performance desde perf_hooks para compatibilidad de tipos e inyección de captura de IP de origen de manera conforme a normas ISO [2].
api/checkout/session.ts: Inicializador seguro de sesiones de Stripe. Envuelto en withObservability e instrumentado con trazas de cálculo de tarifas.
api/checkout/claim-account.ts: Controlador de activación de perfiles. Implementa un bloque de resiliencia activa: si el webhook de Stripe se retrasa por latencia de red, el endpoint crea proactivamente el usuario en GoTrue para mitigar la carrera de datos.
api/checkout/retrieve.ts: Recuperador de metadatos de checkout. Implementa un bloque de contingencia de doble ruta; ante la caída de la API de Stripe, descifra en caliente la cookie HttpOnly beach_checkout_intent (AES-256-GCM) para presentar el resumen al huésped.
api/checkout/send-copy.ts: Despachador de duplicados. Consulta el locale inmutable de la metadata de Stripe, extrae la plantilla localizada en Supabase (email_templates) y la encola en email_queue.
api/cron/ical-import.ts: Sincronizador de agendas de Booking.com. Se corrigió un gap crítico de disponibilidad: ahora lee el campo type de la habitación y lo inyecta como room_type al realizar el upsert idempotente, permitiendo que el motor de reservas reconozca estos bloqueos de forma inmaculada.
api/cron/process-mails.ts: Trabajador de despacho de correos. Se corrigió un error de compilación crítico: se importó síncronamente el módulo crypto de Node.js para evitar fallos al generar la cabecera X-Entity-Ref-ID. Inyecta el traceId en las cabeceras del correo (X-Trace-Id) para trazabilidad de soporte.
api/ical/rooms/export.ts: Exportador de disponibilidad iCal individual. Envuelto en withObservability y protegido por token de acceso criptográfico UUID por habitación.
api/ota/export.ts: Exportador iCal multicanal para OTAs aliadas. Saneados tipos de retorno y verificado contra conexiones activas en room_ota_connections.
api/ota/sync.ts: Importador entrante iCal multicanal. Realiza un join PostgREST nativo con la tabla rooms para inyectar de forma atómica el tipo de habitación en las reservas importadas, previniendo sobre-reservas de forma transversal.
B. Capa del Cliente y Layout del PMS (/admin)
client/src/index.css: Se simplificó la directiva de Tailwind CSS v4 de @theme inline a su nomenclatura oficial de producción @theme, inyectando las variables de los tres presets operativos del PMS.
client/src/contexts/ThemeContext.tsx: Orquestador de estado de temas duales. Se inyectó // eslint-disable-next-line react-refresh/only-export-components para evitar advertencias de HMR y se añadió telemetría de auditoría de transiciones estéticas (ISO 27001).
client/src/pages/AdminDashboard.tsx: Contenedor maestro inteligente del panel PMS. Se eliminaron colores de fondo fijos, se inyectó el envoltorio data-dashboard-theme e instrumentó con el profiler de montaje.
client/src/components/dashboard/PMSSidebar.tsx: Sidebar colapsable del PMS. Refactorizado con variables de tema. Inyecta una píldora segmentada de tres botones para cambiar el tema en caliente de forma visible o un botón único cíclico si el panel está colapsado.
client/src/components/dashboard/reception/RoomMatrix.tsx: Matriz visual de ocupación (15 días). Saneado de colores de celdas y bloques de check-in utilizando opacidades adaptativas seguras.
client/src/components/dashboard/reception/HousekeepingReport.tsx: Panel de control de pisos de ama de llaves. Saneado e instrumentado.
client/src/components/dashboard/reception/BookingSearch.tsx: CRM de recepción. Se rediseñaron los badges de estado para utilizar opacidades de color consistentes en interfaces claras y oscuras (ej: bg-green-500/10 text-green-500).
client/src/components/dashboard/reception/RoomManagement.tsx: Módulo físico de inventario de habitaciones. Standardizado con variables semánticas.
client/src/components/dashboard/reception/TemplateManager.tsx: Editor de vouchers corporativos. Implementa el patrón de remontado por llave de React 19 para evitar renders en cascada y habilitar la exportación PDF nativa de vouchers.
client/src/components/dashboard/reception/RatesAvailability.tsx: Carga masiva de tarifas. Se resolvió la falla TS2554 de coincidencia de argumentos en funciones de traducción agregando la firma correcta a las propiedades.
client/src/components/dashboard/reception/StaffManagement.tsx: Altas de personal. Se resolvió la falla crítica TS2304 importando explícitamente el helper cn de utilidades.
client/src/components/dashboard/reception/OnboardingForm.tsx: Onboarding de primer acceso de empleados. Integra libphonenumber-js para validar y estructurar números en formato E.164.
client/src/components/dashboard/HousekeeperPortal.tsx: Interfaz móvil de limpieza. Standardizada e inyectada con la cámara trasera nativa en el input de carga de evidencias.
client/src/components/dashboard/AgencyPortal.tsx: Portal de operadores. Se removió la importación huérfana de cn resolviendo el aviso de ESLint.
client/src/components/dashboard/DeveloperConsole.tsx: Consola DevOps. Se eliminó la mutación de fechas en renderizado, extrayendo los logs estáticamente.
client/src/components/dashboard/GuestPortal.tsx: Portal de huéspedes. Saneado y unificado.
C. Capa del Cliente: Landing Page Pública y Componentes
client/src/components/BookingDialog.tsx: Orquestador de reservas de la landing. Desacoplado visualmente de colores fijos para operar como un aparato de marca blanca modular que hereda la paleta institucional del hotel.
client/src/components/booking/BookingDatePicker.tsx: Sub-componente de calendario. Nivelado a tokens de marca blanca.
client/src/components/booking/BookingDetailsForm.tsx: Formulario de captura de datos del huésped. Nivelado a tokens de marca blanca.
client/src/components/ContactSection.tsx: Formulario de contacto. Cumple con la regla react-hooks/immutability al usar window.open(..., '_self').
client/src/components/AboutSection.tsx: Sección de pilares de valor. Nivelado a tokens semánticos de la landing page.
client/src/components/Testimonials.tsx: Carrusel de opiniones de Google Places. Implementa un borde adaptativo dinámico en hover que consume la variable CSS activa de la landing (borderColor: 'var(--accent)'), adaptándose al rebranding de cualquier hotel.
client/src/components/WhatsAppButton.tsx: Botón flotante. Integra su foco de anillo de forma responsiva con la variable del acento activo.
client/src/components/Logo.tsx: Componente de logotipo. Se reemplazó la propiedad en minúsculas por fetchPriority="high" nativa en React 19, removiendo la directiva @ts-expect-error para un tipado 100% puro.
client/src/pages/Home.tsx: Raíz de la landing page. Nivelados los contenedores de mapas y headers a variables semánticas.
client/src/pages/Login.tsx: Portal de acceso. Se resolvieron dos advertencias de ESLint de tipo any explícito en los bloques catch de las mutaciones de Supabase Auth, evaluando de forma segura mediante guardas instanceof Error.
client/src/pages/NotFound.tsx: Vista de error 404. Traducida asíncronamente con i18next e inyectada con un log de auditoría de ruteo muerto.
client/src/pages/Success.tsx: Confirmación posventa. Se resolvió la advertencia react-hooks/exhaustive-deps agregando de forma estricta los despachadores de estado estable en el efecto de carga de la sesión de Stripe.
client/src/App.tsx: Enrutador principal. Se resolvió el error de compilación TS2307 de resolución de rutas relativas mediante el uso de alias absolutos de nuestro espacio de nombres @/. Integra analíticas oficiales y diagnóstico de performance de Vercel.
client/src/const.ts: Constantes del cliente. Saneado utilizando safeBtoa para garantizar una compilación e hidratación síncrona libre de colapsos en pre-renderizados híbridos (SSR).
client/src/lib/i18n.ts: Configuración de i18next. Se inyectó telemetría pasiva de arranque y análisis de diccionarios JSON.
client/src/lib/mail.ts: Encolador de correos. Se eliminó el bypass de linter para la variable de remitente fromName tras auditar la base de datos relacional y descubrir que la tabla email_queue cuenta con el campo sender_name, inyectándola directamente en la transacción relacional (ISO 27001).
client/src/lib/storage.ts: Gestor de persistencia. Se reemplazó el parseador genérico de LocalStorage por la interfaz contractual StorageItem<T>, eliminando aserciones any implícitas y consumiendo las constantes de @shared/const.
client/src/lib/supabase.ts: Singleton de Supabase. Se removieron todas las aserciones any en la construcción del Proxy de resiliencia mediante el uso seguro de unknown y firmas estrictas del manejador.
server/index.ts: Servidor Express de producción local. Se inyectaron de forma no de dependencias cabeceras HTTP de protección (HSTS, clickjacking, sniffing) para PCI-DSS y un middleware de logs de red estructurados en JSON.
shared/const.ts: Silo unificado de constantes. Centraliza los identificadores de cookies de sesión, temas y perfiles en un solo archivo inmutable.
4. Próximos Pasos de Optimización (Fase Vercel-Post-Deploy)
Una vez ejecutado el despliegue a producción mediante el comando de compilación unificado, se recomiendan las siguientes tareas preventivas y de afinación:
Auditoría de Entregabilidad de Correo (DKIM/SPF):
Verificar en Google Postmaster Tools que las quejas de spam sobre el dominio beachcanasvieiras.com se mantengan por debajo del 0.10% (límite de seguridad de entregabilidad) [1.1.4, 1.2.8].
Validar que el Worker /api/cron/process-mails.ts procese de forma secuencial y sin fallas de concurrencia la tabla email_queue.
Monitoreo de Webhooks Financieros:
Inspeccionar el panel de desarrolladores de Stripe para asegurar que el endpoint /api/webhooks/stripe retorne códigos de estado 200 OK de forma instantánea y verificar la idempotencia de reintentos mediante el identificador de sesión.
Monitoreo de Core Web Vitals:
Verificar los reportes reales de velocidad en el dashboard de Vercel Speed Insights para auditar que el cambio de Viewports mediante useSyncExternalStore mantenga el Cumulative Layout Shift (CLS) en 0 y el Interaction to Next Paint (INP) por debajo de 100ms [1.1.3].

---

# Bitácora Maestra de Ingeniería y Memoria de Contexto: Beach Hotel Canasvieiras
> SSoT para la hidratación de hilos de IA, control de cambios estructurales, auditoría de compilación (Vercel-Ready) y estado del PMS (v2.1 - Junio 2026).

Este documento consolida la arquitectura del sistema, el mapa de base de datos relacional de Supabase, las decisiones de infraestructura en Vercel, los saneamientos de tipos aplicados y el mapa de ruta pendiente. **Debe proveerse al inicio de cada nuevo hilo de desarrollo para garantizar continuidad absoluta.**

---

## 1. Stack Tecnológico de Élite (SaaS Ready)
*   **Frontend SPA:** React 19 (StrictMode) + Vite + Wouter (Ruteo ágil).
*   **Estilos:** Tailwind CSS v4 (Gobernación dual de variables semánticas en index.css).
*   **Animaciones:** Framer Motion 12 (Tipado estricto con interfaces de variante y curvas Bézier estables).
*   **Base de Datos:** Supabase PostgreSQL con Row Level Security (RLS) y Realtime WebSockets.
*   **Pasarela de Pagos:** Stripe SDK (Checkout-First, Register-Later) [1.1.2].
*   **Correo Transaccional:** Resend + Supabase Outbox Queue (`email_queue`) con Staggering antispam.

---

## 2. Hitos de Ingeniería y Decisiones Críticas Recientes

### A. Bypass de Límite Serverless de Vercel (Hobby Plan Limitation)
*   **El Desafío:** Vercel Hobby limita las compilaciones a un máximo de 12 funciones serverless (Lambdas) por deploy. Con la API de Booking.com, el proyecto ascendió a 13 funciones, bloqueando los despliegues de producción.
*   **Decisión de Arquitectura:**
    1.  **Renombrado de Utilidades:** Renombramos `api/utils/` a la ruta privada **`api/_utils/`**. Al iniciar con un guion bajo, Vercel ignora estas clases en el recuento y empaquetado de Lambdas, reduciendo la cuenta.
    2.  **Multiplexación de Endpoints:** Fusionamos los exportadores de calendario individual y multicanal en un único endpoint inteligente parametrizado en **`api/ota/export.ts`**, resolviendo el bloqueo de raíz y dejando el ecosistema con exactamente 10 Lambdas operativas.

### B. Idempotencia y Deduplicación en Sincronización iCal (SPOF Resolved)
*   **El Desafío:** Las OTAs (Booking, Airbnb) inyectan identificadores de eventos de iCal que contienen caracteres especiales (ej: `123@booking.com`), los cuales violan el tipo de dato estricto `UUID` de PostgreSQL, provocando que se guardaran como nulos o undefined. Esto causaba duplicados infinitos de reservas en cada ejecución del cron (cada 15 minutos).
*   **Decisión de Arquitectura:** Implementamos un algoritmo de **UUID Determinístico (SHA-256)** en `ical-import.ts` y `sync.ts`. Transforma de manera estable cualquier cadena de la OTA en un UUID v4-like. Esto garantiza idempotencia del 100%: ejecuciones repetidas se resuelven con un `upsert` inmutable sobre el mismo ID.

### C. Aislamiento del Módulo de Recursos Humanos (NR-7 Compliance)
*   **El Desafío:** Las credenciales y fichas de personal se guardaban en la tabla común de huéspedes (`guests`). Esto violaba las normativas de segregación de privilegios de la norma **ISO 27001** y la **LGPD** brasileña.
*   **Decisión de Arquitectura:**
    1.  **Estructura de Datos Dedicada:** Creamos la tabla **`public.staff_profiles`** con 16 columnas para registrar nombres atómicos, contacto verificado de WhatsApp, tipo de sangre, alergias y contacto de emergencia (Salud Ocupacional NR-7).
    2.  **Saneamiento de Compilación:** Refactorizamos `api/admin/create-staff.ts` con Zod para validar estas variables en tiempo de ejecución. Rediseñamos `StaffManagement.tsx` en el cliente para inyectar estos campos y eliminamos los 13 errores compilatorios de TypeScript/ESLint en el área de administración.

### D. Gobernanza de Credenciales y Links de WhatsApp
*   El administrador cuenta con soporte síncrono para:
    *   **Reset Manual de Password:** Actualiza directamente las credenciales de un empleado mediante llamada administrativa segura a la API.
    *   **Invite Link de WhatsApp:** Invoca `generateLink` de Supabase para obtener un Magic Link firmado de primer acceso con un TTL de 24 horas, copiando una plantilla de texto transaccional directa para enviar por WhatsApp.

---

## 3. Estructura Física Saneada del Proyecto (Directorios Clave)
beach-hotel-canasvieiras/
├── .docs/
│ ├── limites-vercel-hobby.md # Manual de cuotas y calculadora Pro
│ └── bitacora.md # Este documento de contexto
├── api/
│ ├── _utils/ # Privado: Excluido de compilación Lambdas
│ │ ├── booking-config.ts # SSoT configuración Booking.com
│ │ └── observability.ts # Telemetría e inyección de traceId
│ ├── admin/
│ │ └── create-staff.ts # Endpoint multi-acción con Zod e i18n
│ ├── checkout/
│ │ ├── claim-account.ts # Activación resiliente posventa
│ │ ├── retrieve.ts # Recuperación con fallback de cookie AES-GCM
│ │ └── session.ts # Stripe Checkout (Autoridad de precios)
│ ├── cron/
│ │ ├── ical-import.ts # Cron iCal con UUID determinístico
│ │ └── process-mails.ts # Worker asíncrono antispam
│ ├── ota/
│ │ ├── booking/
│ │ │ ├── rates.ts # Transmisor de tarifas e inventario
│ │ │ └── webhook.ts # Receptor síncrono de reservas Booking
│ │ ├── export.ts # Exportador iCal multiplexado (SSoT)
│ │ └── sync.ts # Sincronizador OTA con UUID determinístico
│ └── webhooks/
│ └── stripe.ts # Reconciliación de pagos inmutable
├── client/
│ └── src/
│ └── components/
│ └── dashboard/
│ ├── DeveloperConsole.tsx # Sandbox Playground Interactivo
│ └── reception/
│ └── StaffManagement.tsx # Consola de RRHH y Salud Ocupacional
code
Code
---

## 4. Estado Actual de Compilación y Deploy (Vercel Ready)
*   **TypeScript Check (`pnpm run check`):** 100% exitoso. Cero errores sintácticos en el cliente, scripts, servidor y carpeta `api/`.
*   **ESLint Audit (`pnpm run lint`):** 100% libre de advertencias. Las variables de desuso de importación y renders en cascada de React 19 fueron erradicados en todos los aparatos modificados.
*   **Vercel Build (`vercel build`):** Empaqueta con éxito exactamente **10 funciones serverless**, situándose holgadamente por debajo del límite de 12 de la cuenta Hobby.

---

⚓ BITÁCORA MAESTRA DE INGENIERÍA: CONSOLIDACIÓN DE IDENTIDADES, GOBERNANZA MULTI-ROL Y NAVEGACIÓN VERCEL STYLE
Proyecto: Beach Hotel Canasvieiras
Fecha de Consolidación: 20 de Junio, 2026
Estatus de Compilación: Vercel-Ready (100% libre de advertencias y errores de TypeScript y ESLint v9)
Huso Horario Operativo: America/Sao_Paulo (GMT-3)
1. Topología del Ecosistema de Identidades y Roles (RBAC)
Se ha expandido el tipado contractual y la gobernanza de accesos en el lado del servidor y cliente para soportar 9 perfiles de usuario bien definidos bajo el estándar de seguridad de la información ISO 27001:
developer (Desarrollador / Súper Admin): Privilegios absolutos y herméticos. Accede a la terminal de telemetría de red, simulación de pasarelas de pago y al visor introspectivo de tablas físicas de Supabase.
admin (Administrador General): Control total de la operación hotelera. Administra el alta, cambio y baja lógica de funcionarios, consulta el flujo de caja, gastos por centro de costos y configura plantillas de correo.
receptionist (Recepcionista): Operador de recepción. Accede a la matriz de asignación de cuartos, buscador CRM de reservas, check-in de acompañantes y reportes policiales de la FNRH.
housekeeping_supervisor (Supervisor de Limpieza): Perfil de auditoría móvil. Posee capacidades expandidas para auditar el aseo de habitaciones, calificar con estrellas la faena, subir evidencias fotográficas tomadas con cámara nativa y agregar tareas personalizadas de mantenimiento al checklist sobre la marcha.
housekeeper (Auxiliar de Limpieza / Camareira): Operador móvil de aseo. Accede a su lista de habitaciones asignadas para completar de forma interactiva las tareas de limpieza obligatorias.
agency_retail (Agencia de Viajes Minorista): Operadores B2B externos. Consultan tarifas preferenciales y aplican cupones de descuento automáticos desde la web.
agency_wholesale (Agencia Mayorista / Consolidador): Operadores B2B de alto volumen. Acceden a un margen de comisión (markup) superior y cotizan planes grupales de forma preferencial.
guest (Huésped / Cliente): Cliente final. Consulta de forma síncrona el itinerario de sus excursiones del hotel, guías de check-in digital y el resumen financiero de sus estancias.
agency (Legacy): Preservado en el tipo de unión de TypeScript para evitar regresiones de tipado con cuentas creadas de forma retroactiva.
2. Decisiones de Arquitectura y Saneamiento de Aparatos (Fase de Consolidación)
Aparato A: Contexto de Autenticación y Expansión de Roles
Ubicación del archivo: client/src/contexts/AuthContext.tsx
Decisión Técnica: Se expandió el tipo contractual UserRole para incorporar los nuevos roles (receptionist, agency_retail, agency_wholesale, housekeeping_supervisor), eliminando las alertas de asignación de tipos TS2322 en los componentes hijos.
Motor de Auto-Curación (Self-Healing): Se mantuvo el interceptor asíncrono que asocia de forma limpia los metadatos de usuario con la tabla pública de huéspedes (public.guests) para evitar inconsistencias en el primer inicio de sesión posventa.
Aparato B: Sidebar de Navegación Plana estilo Vercel (Carbon Dark)
Ubicación del archivo: client/src/components/dashboard/PMSSidebar.tsx
Decisión Técnica (SOLID): Se refactorizó la barra de navegación para eliminar la fricción de acordeones anidados por un diseño 100% plano e interactivo. Al hacer clic en un elemento padre que contiene sub-secciones, el sistema redirige de inmediato al primer sub-módulo disponible. Las sub-secciones operativas se muestran como pestañas horizontales en el área de trabajo principal.
Saneamiento de Linter: Se resolvieron todas las advertencias no-unused-vars de ESLint v9 eliminando la importación de ShieldAlert y la variable destructurada user de useAuth() que se encontraba sin uso.
Gobernación de Vistas por Rol: Se implementó un filtrado dinámico del menú basado en propiedades declarativas (roles: UserRole[]), garantizando que cada usuario visualice única y exclusivamente las opciones permitidas para su labor.
Aparato C: Orquestador Maestro de Paneles de Control
Ubicación del archivo: client/src/pages/AdminDashboard.tsx
Decisión Técnica (DRY): Para evitar la alteración y re-escritura del tipado de componentes hijos legados que no soportaban el nuevo rol de supervisor de forma nativa, se inyectó una conversión segura en la frontera de propiedades de <HousekeepingReport />, mapeando el rol 'housekeeping_supervisor' al tipo compatible 'housekeeper'.
Saneamiento de Ámbito de Bloque: Se envolvió el cuerpo del case 'housekeeping': en llaves {} de bloque. Esto delimita correctamente el alcance léxico de la variable const reportRole y resuelve el error de linter no-case-declarations de forma definitiva.
Aparato D: Matriz de Ocupación e Interactividad en Celdas
Ubicación del archivo: client/src/components/dashboard/reception/RoomMatrix.tsx
Decisión de Rendimiento: Se resolvió la inestabilidad de la variable de fecha today (que generaba renders continuos en cascada por re-instanciación síncrona en cada ciclo) envolviéndola en un estado síncrono perezoso useState(() => startOfDay(new Date())). Esto estabilizó por completo la dependencia del gancho useMemo y eliminó la necesidad de usar variables con ámbito de bloque antes de su declaración (baseDateUpdate).
Asignación Rápida: Se renombró el botón principal a ALOCAÇÃO RÁPIDA y se acopló a un selector de categoría en el toolbar superior, buscando y asignando de inmediato el primer cuarto disponible y limpio de esa categoría hoy.
Celdas Interactivas y Modal de Situación: Se reemplazó el flujo sutil del clic en celda por la apertura del cuadro de diálogo "Estado de Situação". Este modal audita si la habitación está disponible en la fecha seleccionada, muestra su higiene actual y ofrece un botón de acción rápida para iniciar el flujo de Check-In en caliente si está vacante.
Aparato E: Simplificación Temática y Estilo Vercel
Ubicación de los archivos: client/src/contexts/ThemeContext.tsx e client/src/index.css
Decisión Estética: Se redujeron los tres antiguos temas operativos del dashboard a únicamente dos temas: Claro (Light) y Oscuro (Dark, predeterminado).
Estilo index.css: Se redefinió la clase [data-dashboard-theme="dark"] adoptando negros absolutos (#000000) y bordes finos de alta resolución (#262626) inspirados en el diseño minimalista de Vercel. Se añadieron las variables de Tailwind v4 en el bloque de extensión para evitar advertencias de at-rules desconocidas en el editor local.

---







