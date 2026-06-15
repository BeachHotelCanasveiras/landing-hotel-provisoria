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



