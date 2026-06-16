# Manifiesto de Ingeniería: Beach Hotel Canasvieiras
> Sistema de Gobernanza para el Desarrollo de la Plataforma PMS e Infraestructura Web.

Este documento establece las directrices arquitectónicas, los estándares de calidad de código y las metodologías operativas innegociables para el desarrollo del ecosistema "Beach Core". Toda adición o refactorización debe estar en consonancia con este manifiesto.

---

## 1. Principios Fundamentales del Desarrollo

### A. Integridad del Código
- **Atomicidad:** Cada componente debe ser una unidad funcional con responsabilidad única. Los componentes de interfaz de usuario (UI) no deben gestionar lógica de negocio pesada, la cual debe ser delegada a Hooks personalizados o controladores.
- **Formato de Entrega Completo:** Para mantener la coherencia y facilitar la revisión sintáctica, no se permiten entregas de código parciales, fragmentadas o estimadas. Todo script o componente React se entrega en su totalidad.
- **Estabilidad de Estado:** Cada refactorización o cambio de diseño debe diseñarse de forma retrocompatible para evitar regresiones o parpadeos (CLS) en la interfaz de usuario.
- **Erradicación del Tipo `any`:** El uso de aserciones del tipo `any` queda estrictamente prohibido en el entorno de TypeScript. Se debe utilizar un tipado fuerte, tipos de unión, genéricos parametrizados o, en su defecto, `unknown` acompañado de guardas de tipo.

### B. Estructura del Ecosistema y Rutas
- **Importaciones:** Se utilizarán rutas relativas explícitas y completas en las importaciones de componentes y utilidades. No se permiten importaciones ambiguas que dependan de resoluciones implícitas del motor de compilación.
- **Estructura Modular:**
  - El código del cliente reside estrictamente en `client/src/`.
  - Las funciones serverless independientes se ubican en `api/`.
  - Los scripts de automatización e infraestructura se alojan en `scripts/`.
- **Independencia de Scripts:** Cada script administrativo o de diagnóstico de la carpeta `scripts/` debe ser auto-contenido, documentado técnicamente y con una salida estructurada y limpia (preferentemente JSON o tablas en consola).

---

## 2. Arquitectura de Base de Datos y Seguridad (ISO/IEC 27001)

### A. Modularidad y Topología de Datos
- El esquema de base de datos se distribuye en tablas granulares e independientes: `rooms`, `bookings`, `guests`, `users`, y `room_ota_connections` para el módulo multicanal.
- **Identificadores Únicos (SSoT):** El **email** actúa como el identificador principal de enlace relacional entre los esquemas de autenticación y los perfiles de huéspedes (`guests`).

### B. Row Level Security (RLS) y RBAC
- Todas las tablas creadas en Supabase deben poseer políticas RLS activas y restrictivas.
- Los accesos operativos de lectura y escritura se gobiernan estrictamente según el rol asignado (`developer`, `admin`, `receptionist`, `housekeeper`, `agency`, `guest`).
- El cliente frontend jamás debe actuar bajo privilegios administrativos; toda operación administrativa sensible se rutea mediante endpoints serverless en `api/` verificando la firma de autenticación del JWT del usuario solicitante.

---

## 3. Integración de Terceros y Transaccionalidad Segura (PCI-DSS)

### A. Autoridad Total del Servidor (No-Data Tampering)
- El cliente (frontend) nunca es la autoridad para el cálculo de tarifas, noches de estancia o disponibilidad.
- Toda solicitud de reserva envía un token de intención del tipo de habitación y fechas. El servidor de Stripe o el endpoint `/api/checkout/session` calcula la tarifa en caliente leyendo directamente el estado inmutable de `rooms` en base de datos.

### B. Idempotencia y Deduplicación
- Todos los webhooks de conciliación financiera (como Stripe Webhooks) deben implementar lógica de idempotencia verificando de forma redundante si la transacción ya fue procesada antes de realizar inserciones en `bookings`.

---

## 4. Internacionalización (i18n) de Clase Élite

### A. Desacoplamiento Total de Cadenas Fijas
- Queda prohibida la presencia de cadenas de texto fijo (strings) dentro del código de renderizado de los componentes. Todo texto debe ser invocado a través del hook `useTranslation` de `react-i18next`.

### B. La Trinidad Atómica de los Componentes
Todo nuevo aparato (módulo o sección) que renderice o procese datos multilingües debe construirse obligatoriamente con tres elementos:
1.  **El Componente React:** (`Aparato.tsx`) - Enfocado exclusivamente en la UI y la recepción de datos.
2.  **Los Diccionarios de Idioma:** (`Aparato.json` en `es-ES`, `en-US`, `pt-BR`) - Aislados y estructurados.
3.  **El Esquema de Validación:** (`Aparato.schema.ts` utilizando Zod) - Garantiza la paridad estructural de las traducciones en tiempo de ejecución.

### C. Nomenclatura Regional
- Se utilizará estrictamente la variante de idioma regional `pt-BR` para portugués de Brasil y `es-ES` para español de España, respetando mayúsculas y minúsculas en directorios para evitar colisiones entre sistemas operativos.
- Las traducciones se compilan de forma automatizada mediante el script `scripts/compile-i18n.js` antes del empaquetado en producción.

---

## 5. Gestión de Estado y Rendimiento del Cliente (React 19)

### A. Sincronización de Estado sin Efectos Síncronos
- Para evitar renderizados en cascada (cascading renders) que degraden el rendimiento, la inicialización de estados locales debe ser perezosa (lazy initial state) y la sincronización con el contexto debe realizarse durante la fase de renderizado, evitando el uso de efectos que disparen `setState` en cascada.

### B. Persistencia Controlada (TTL)
- **Cookies (1 año):** Reservadas exclusivamente para persistir preferencias persistentes como el idioma o identificadores de atribución publicitaria (tracking).
- **LocalStorage (Con TTL):** Utilizado para el cacheo temporal de consultas a la API (como reseñas de Google Places o inventario). Toda clave en `localStorage` debe incluir un sello de tiempo y lógica de auto-limpieza al expirar su tiempo de vida útil.

### C. Mutaciones de Interfaz con TanStack Query
- El estado de los datos del servidor se maneja mediante TanStack Query (v5).
- Las operaciones asíncronas de guardado o cambio de estado operativo (Check-in/Out, tareas de limpieza) deben usar mutaciones de Query con invalidación de consultas (`invalidateQueries`) para mantener consistencia transversal instantánea en todas las pantallas del PMS.

---

# Manifiesto de Ingeniería: Beach Hotel Canasvieiras
> Directrices de Arquitectura de Software, Seguridad Transaccional y Gobernanza PMS.

Este documento establece las normas arquitectónicas y de calidad de código para el ecosistema transaccional "Beach Core Engine". Es la fuente única de verdad para mantener la integridad, el rendimiento de clase producción y la seguridad de la información (ISO 27001) del hotel.

---

## 1. Principios Fundamentales del Desarrollo

### A. Integridad y Pureza de Código (SOLID)
- **Responsabilidad Única (SRP):** Cada componente debe cumplir una tarea única y granular. Los orquestadores (como `AdminDashboard.tsx`) delegan la lógica de presentación a sub-aparatos desacoplados y la lógica de mutaciones a estados tipados de red.
- **Principio Abierto/Cerrado (OCP):** El renderizado de vistas en paneles de administración no se gestiona mediante bifurcaciones síncronas o `switch` monolíticos. Se implementa un **Mapa de Vistas Tipado** (`VIEWS`), permitiendo la extensión del sistema sin alterar la lógica de control.
- **Entregas de Código Absolutas:** No se admiten entregas fragmentadas, parciales o estimadas. Todo script o componente se entrega en su totalidad, listo para compilar.
- **Estabilidad de Tipos (Zero 'any'):** Queda estrictamente prohibido el bypass de tipos mediante `any` o aserciones de escape inseguras. Se debe modelar con contratos estrictos e interfaces sincronizadas entre base de datos y UI.

---

## 2. Arquitectura Frontend de Alto Rendimiento (React 19 & Tailwind v4)

### A. Sincronización de Estado sin Renders en Cascada
- Para erradicar la degradación del rendimiento de renderizado por estados síncronos redundantes, la sincronización se realiza en fase de renderizado mediante el patrón *Lazy State Initialization* o estados perezosos.
- Se prohíbe el uso de efectos colaterales de post-renderizado (`useEffect`) para sincronizar estados internos que dependan de cambios de propiedades externas.

### B. Estética "Quiet Luxury" y Sistema Visual
- **Branding Coherente:** El diseño visual se basa en variables dinámicas de colorimetría en espacio de color OKLCH y tipografías premium como *PMN Caecilia Sans* y *Playfair Display*.
- **Carga de Medios Inteligente:** Las imágenes se sirven de forma dinámica utilizando los parámetros `f_auto,q_auto` de Cloudinary. La extensión estática en el código no debe limitar el formato final; la CDN evalúa y sirve el archivo óptimo (AVIF/WebP) en tiempo de ejecución.
- **Táctica Móvil Híbrida:** En dispositivos móviles, los catálogos (habitaciones, excursiones) se renderizan en carruseles de arrastre horizontal con aceleración por GPU (*Snap-Scroll*) para mitigar la fatiga de scroll vertical, desplegando detalles en drawers aislados de conversión.

---

## 3. Trinidad Atómica de Componentes (i18n & Zod)

Cada aparato (módulo o sección) que procese o renderice cadenas localizadas debe estar estructurado obligatoriamente por tres elementos complementarios:
1.  **Componente React:** (`Aparato.tsx`) - Maneja estrictamente la presentación y eventos.
2.  **Diccionarios de Idioma:** (`Aparato.json` en `es-ES`, `en-US`, `pt-BR`) - Archivos JSON aislados por namespace regional, eliminando el hardcodeo de cadenas.
3.  **Esquema de Validación:** (`Aparato.schema.ts` utilizando Zod) - Valida en runtime la integridad de las traducciones antes de presentarse en pantalla.

*Nota: La nomenclatura portuguesa se restringe al estándar regional `pt-BR` de forma transversal en todas las rutas y diccionarios.*

---

## 4. Gobernanza y Topología de Base de Datos (Supabase PostgreSQL)

Para evitar desajustes operativos, la base de datos se consolida bajo un esquema relacional con restricciones estrictas de integridad y automatizaciones del lado del servidor.

### A. Triggers de Onboarding y Transaccionalidad
- **Sincronización en Caliente de Perfiles (`trigger_on_auth_user_created`):** Automatiza la propagación desde el esquema privado `auth.users` hacia las tablas públicas `users` y `guests` en una sola transacción síncrona, eliminando perfiles de huésped vacíos.
- **Ingreso Impecable de Habitaciones (`trigger_on_room_created_onboarding`):** Al dar de alta un nuevo cuarto físico en la interfaz PMS, la base de datos inyecta automáticamente la suite de 5 tareas estándar de aseo, haciéndolo operativo en caliente en la pestaña de Ama de Llaves.
- **Outbox Pattern de Notificaciones (`trigger_on_booking_confirmed_queue_email`):** Desacopla la confirmación de pago de la entrega física del correo. Al marcar un pago como `confirmed`, el motor Postgres encola automáticamente la plantilla HTML a `email_queue`.

### B. Capa de Seguridad RLS y RBAC
- RLS habilitado en cascada en todas las tablas operativas.
- Centralización del control de acceso mediante la función segura de base de datos `public.get_user_role(auth.uid())`, restringiendo lecturas y modificaciones en base a roles validados (`admin`, `developer`, `receptionist`, `housekeeper`).

---

## 5. Integridad Transaccional y Pasarelas de Pago (Stripe & PCI-DSS)

### A. Autoridad de Precios Inmutable
- El frontend jamás define precios o noches de forma estática en la pasarela de pagos.
- Al iniciar un checkout, el cliente envía un intent. El endpoint `/api/checkout/session` calcula las tarifas leyendo directamente la base de datos de Supabase, anulando cualquier intento de manipulación de datos (*Data Tampering*) desde la consola del navegador.

### B. Idempotencia de Webhook
- El webhook de Stripe (`api/webhooks/stripe.ts`) realiza una validación idempotente comparando fechas y habitación asignada antes de conciliar, evitando duplicidades por reintentos de red.

### C. Cookies de Persistencia de Larga Duración
- Las preferencias de idioma del usuario recurrente y tracking de marketing se persisten de forma segura mediante cookies seguras (`SameSite=Lax;Secure`) con un tiempo de vida innegociable de **1 año** (365 días) para máxima fidelización.

---



