# 🌊 Beach Hotel Canasvieiras Floripa
> **Plataforma Integral PMS & Landing Page de Alta Conversión**  
> *Arquitectura híbrida de hospitalidad, reservas seguras con Stripe, notificaciones en tiempo real y cola de correos optimizada.*

---

## 🛠️ Stack Tecnológico de Élite

| Capa | Tecnologías Clave | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion 12, Wouter | Interfaz ultra-rápida, diseño móvil interactivo y animaciones fluidas. |
| **Estilos** | CSS Variables (oklch), Outfit (Cuerpo), Playfair Display (Títulos) | Estética de Lujo Silencioso (Quiet Luxury) y alto contraste visual. |
| **Base de Datos** | Supabase (PostgreSQL), Realtime, Row Level Security (RLS) | Persistencia inmutable, suscripciones en vivo y seguridad de acceso. |
| **Pagos** | Stripe API, Stripe Checkout (PCI-DSS Compliant) | Pasarela de cobros segura con cálculo de tarifas del lado del servidor. |
| **Correos** | Resend (Transaccional), Zoho Mail / Google Workspace (Humano) | Envío masivo asíncrono con cero spam y buzón de soporte dedicado. |

---

## 📦 Estructura del Ecosistema
beach-hotel-canasvieiras/
├── .docs/ # Planos, bitácora e ingeniería del proyecto
│ ├── prompts/ # Guías de IA (Dirección de Fotografía, etc.)
│ ├── arquitectura-emails.md # Diseño pormenorizado del motor de correos
│ └── todo.md # Plan de atomización y pendientes
├── api/ # Endpoints Serverless (Vercel Functions)
│ └── checkout/
│ ├── session.ts # Creación de sesión de Stripe (Precios seguros)
│ ├── retrieve.ts # Recuperador de metadatos de checkout
│ └── stripe.ts # Webhook de conciliación de reservas
├── client/ # Código de la aplicación SPA
│ ├── public/ # Activos estáticos críticos (Favicon, fuentes)
│ └── src/
│ ├── components/ # Componentes atómicos de la UI
│ │ ├── Excursions.tsx # Carrusel interactivo y galería de tours
│ │ └── Header.tsx # Navegación y selector de idiomas Hover
│ ├── hooks/ # Ganchos de sincronización y tiempo real
│ │ └── useBookingNotifications.ts # Alertas auditivas y de toast del PMS
│ ├── lib/ # Clientes singleton (Supabase, Mail)
│ ├── locales/ # Diccionarios internacionalizados (Bilingüe)
│ └── pages/ # Vistas principales (Home, Admin, Success)
├── scripts/ # Automatizaciones y migraciones
│ └── upload-excursions.js # Sincronización y optimización en Cloudinary
└── vercel.json # Enrutador e inyección de cabeceras de caché

---

## ⚙️ Flujos Críticos de Negocio

### 💳 1. Motor de Reservas: "Venta Primero, Registro Después" (CRO)

Para eliminar la fricción que causa el abandono del carrito, el cliente realiza el pago sin registrar una cuenta de forma previa. El registro de usuario se posterga para la página de confirmación de éxito.

[ PASO 1: SELECCIÓN ] ──► [ PASO 2: SESIÓN SEGURA ] ──► [ PASO 3: PASARELA STRIPE ]
Huésped elige fechas Server calcula el precio Stripe procesa el cobro
en BookingDialog.tsx real (Evita alteraciones) (PCI-DSS Compliant)
│
[ PASO 6: PORTAL PMS ] ◄── [ PASO 5: REGISTRO ] ◄── [ PASO 4: RETORNO ]
Acceso instantáneo Huésped crea contraseña Redirección a /success
a llaves y tours y se asocia su reserva Escribe cookie de persistencia

### ✉️ 2. Sistema de Correos Híbrido (Antiespam & Resiliencia)

Desacoplamos los canales de envío para proteger el dominio principal `beachcanasvieiras.com` de bloqueos por spam masivo:

*   **Bandeja de Entrada de Soporte (Zoho Mail):** Utilizada por el personal humano para ventas y concierge desde `reservas@beachcanasvieiras.com`. Incorpora alias gratuitos (`ventas@`, `maximo.menji@`) direccionados al buzón principal para ahorrar licencias.
*   **Envíos Transaccionales (Resend):** Automatizado desde el código de Vercel/Supabase para confirmaciones de reservas. 
*   **Seguridad y Entregabilidad:** El sistema inyecta cabeceras `List-Unsubscribe` de un solo clic (cumplimiento de directrices anti-spam de Google) y se rutea mediante un despachador encolado con retrasos dinámicos de **3 segundos** entre correos.

### 🔔 3. Notificaciones PMS en Tiempo Real (Supabase Realtime)

Cuando el webhook de Stripe concilia un pago, inserta la reserva en la tabla `bookings` con estado `confirmed`. El panel de administración PMS (`AdminDashboard.tsx`) reacciona al instante:

1.  Escucha el cambio a nivel de base de datos de manera reactiva.
2.  Dispara un sonido sutil de alerta en la recepción del hotel.
3.  Despliega una notificación persistente tipo Toast de Sonner que invita al recepcionista a verificar los datos del huésped.

---

## 🚀 Guía de Instalación y Despliegue Local

### Requisitos Previos
*   Node.js 18+ (Formato ESM)
*   pnpm (Recomendado) o npm

### 1. Clonación e Instalación de Dependencias
```bash
git clone https://github.com/BeachHotelCanasveiras/landing-hotel-provisoria.git
cd landing-hotel-provisoria
pnpm install
2. Configuración del Archivo de Entorno (.env)
Cree un archivo .env en la raíz del proyecto y configure sus credenciales de la siguiente manera:

# Supabase de Producción
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreto

# Stripe API
STRIPE_SECRET_KEY=sk_test_tu-clave-secreta
STRIPE_WEBHOOK_SECRET=whsec_tu-secreto-de-webhook

# Resend Mail
RESEND_API_KEY=re_tu-clave-de-correo

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret


3. Compilación de Diccionarios y Desarrollo

# Compilar fragmentos JSON e iniciar servidor de Vite local
pnpm run dev
La aplicación estará disponible en http://localhost:3000.
🌐 Despliegue en Producción (Vercel)
El proyecto está optimizado y preparado para un despliegue de comando único sin fricciones.
Para subir tus cambios, compilar los fragmentos de idiomas e iniciar el build de producción en Vercel, ejecuta este comando unificado:

git add . && git commit -m "build: despliegue de infraestructura transaccional" && git push && vercel --prod
🔒 Estándares de Cumplimiento de Ingeniería
ISO/IEC 27001: Protección y cifrado de llaves de API en Vercel, políticas de Row Level Security (RLS) en Supabase y control de accesos basado en roles (RBAC).
PCI-DSS: Manejo exclusivo de flujos de pago mediante redirección nativa e inmutable (Stripe Elements).
W3C / SEO: Estructura semántica en HTML, metadatos estructurados en formato JSON-LD, carga perezosa de recursos multimedia y optimización dinámica de imágenes (f_auto, q_auto) sirviendo formatos AVIF/WebP desde Cloudinary.

---
Raz Podestá  - MetaShark Tech