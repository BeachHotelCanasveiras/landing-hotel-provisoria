# Arquitectura y Diseño de Correo Transaccional (Gmail API & Cola Asíncrona)
## Especificación de Ingeniería y Objetivos de Entregabilidad (v1.0 - 2026)

Este documento describe de forma minuciosa la arquitectura lógica, el modelo de datos y las políticas de despacho diseñadas para la gestión de correos electrónicos corporativos e informativos de **Beach Hotel Canasvieiras** bajo el dominio `beachcanasvieiras.com`.

---

## 🎯 1. Objetivos del Sistema

Para garantizar el cumplimiento de los estándares internacionales de seguridad de la información (ISO 27001) y las normativas vigentes de los proveedores de correo, este sistema persigue cuatro objetivos primarios:

### A. Entregabilidad de Élite (Inbox Placement al 100%)
*   **Alineación SPF/DKIM/DMARC:** Garantizar que todo correo enviado tenga firmas criptográficas DKIM alineadas con el dominio `beachcanasvieiras.com` [1.1.2, 1.2.2]. Esto reduce la tasa de rebotes e impide la suplantación de identidad (Phishing) [1.2.2].
*   **RechazoSMTP 5xx Preventivo:** Evitar configuraciones de remitente inválidas que provoquen rechazos permanentes en el servidor destino bajo las políticas estrictas de Google y Yahoo [1.2.2, 1.2.3].
*   **Cumplimiento RFC 8058 (One-Click Unsubscribe):** Incorporar de manera mandatoria las cabeceras `List-Unsubscribe` en todo correo masivo o de marketing enviado a agencias aliadas para facilitar la baja en un solo clic, manteniendo la reputación del dominio [1.1.2, 1.2.3].
*   **Límite de Spam por debajo del 0.10%:** Asegurar una tasa de quejas inferior al 0.10% (con un límite absoluto e innegociable de 0.30%) para evitar la suspensión o degradación de reputación del dominio en Google Postmaster Tools [1.1.4, 1.2.8].

### B. Tolerancia a Fallos y Desacoplamiento (Resilience)
*   **Cola de Mensajería Inmutable:** El frontend de la landing page o el panel administrativo (PMS/CRM) nunca llamará de forma directa a la API de envío de correos durante una transacción crítica. En su lugar, registrará un registro en una cola de base de datos (`email_queue`).
*   **Aislamiento de Errores:** Si la API de Google, la red o el servidor de destino experimentan una caída temporal, la experiencia del usuario no se interrumpe y el correo no se pierde; se reintenta de forma automática según la política de reintentos definida.

### C. Despacho Secuencial Controlado (Anti-Spam Staggering)
*   **Mitigación de Ráfagas:** Enviar cientos de correos de forma simultánea es considerado un patrón de comportamiento de bot o spammer por los sistemas de reputación IP. El sistema introduce una pausa síncrona obligatoria (Staggering) de entre 2 y 5 segundos entre cada envío individual.
*   **Límites de Cuota Respetados:** Asegurar que los envíos automáticos no superen las cuotas diarias impuestas por las licencias de Google Workspace.

### D. Seguridad de Credenciales (ISO 27001)
*   **Cero Fugas en el Cliente:** Las credenciales de Google API, los secretos del cliente de OAuth 2.0 y las API keys se almacenarán estrictamente en las variables de entorno del servidor en Vercel o Supabase [1.1.1]. El cliente (React/Vite) jamás tendrá acceso a estas llaves.

---

## 🛠️ 2. Arquitectura de Flujo Lógico

El ciclo de vida de un correo electrónico en nuestro sistema se divide en tres fases secuenciales:
[ FASE 1: ENCOLAMIENTO ]
Landing Page / PMS / CRM (React)
│
└──► Inserta en tabla 'email_queue' (Supabase) con estado 'pending'
[ FASE 2: DISPARO (CRON JOB) ]
Vercel Cron / Trigger Externo (Cada 5 minutos)
│
└──► Invoca endpoint seguro '/api/cron/process-mails' (Vercel Serverless)
[ FASE 3: TRABAJADOR Y DESPACHO ]
Endpoint Seguro (Servidor)
│
├──► 1. Lee un lote de 10 registros 'pending' ordenados cronológicamente
├──► 2. Se autentica asíncronamente con Google APIs (OAuth2 con Refresh Token)
├──► 3. Itera cada registro:
│ a. Cambia estado de cola a 'sending'
│ b. Construye mensaje MIME (RFC 5322) codificado en Base64url
│ c. Llama a 'gmail.users.messages.send()'
│ d. Si tiene éxito: Estado a 'sent' con timestamp de despacho
│ e. Si falla: Registra error y marca para re-intento (o 'failed' si excede el límite)
│ f. PAUSA OBLIGATORIA (Sleep 3 segundos) para evitar ráfagas
│
└──► 4. Responde con el informe del lote procesado
code
Code
---

## 🗄️ 3. Modelo de Datos de la Cola (`email_queue`)

La base de datos utiliza una estructura optimizada en la tabla `public.email_queue` con los siguientes campos y responsabilidades:

| Campo | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `gen_random_uuid()` | Identificador único de trazabilidad de cada correo. |
| `recipient_email` | `TEXT` | *Ninguno (NOT NULL)* | Correo electrónico del destinatario (Huéspe, Agencia, etc.). |
| `subject` | `TEXT` | *Ninguno (NOT NULL)* | Asunto o cabecera del correo. |
| `html_content` | `TEXT` | *Ninguno (NOT NULL)* | Cuerpo del mensaje formateado en HTML limpio. |
| `status` | `TEXT` | `'pending'` | Estado del ciclo de vida del correo: `pending`, `sending`, `sent`, `failed`. |
| `attempts` | `INT` | `0` | Número de intentos de despacho realizados hasta el momento. |
| `max_attempts` | `INT` | `3` | Número máximo de reintentos permitidos antes de marcarlo como fallo definitivo. |
| `error_log` | `TEXT` | `NULL` | Registro detallado del error SMTP o mensaje devuelto por la API en caso de fallo. |
| `scheduled_at` | `TIMESTAMPTZ`| `now()` | Fecha y hora en la que el correo debe ser liberado para su envío. Permite programar correos a futuro. |
| `sent_at` | `TIMESTAMPTZ`| `NULL` | Fecha y hora exacta en la que el servidor de Google aceptó el correo con éxito. |
| `created_at` | `TIMESTAMPTZ`| `now()` | Sello de tiempo de creación del registro. |

---

## 🔒 4. Protocolo de Autenticación con Google APIs (OAuth 2.0)

Debido a que Google retiró el soporte de autenticación básica con contraseñas de aplicación simples para desarrolladores, la integración requiere un flujo seguro de tokens:

1.  **Credenciales en Consola de Google Cloud:** Se habilita la **Gmail API** y se configuran credenciales OAuth 2.0 de tipo *Aplicación Web*.
2.  **Refresh Token:** Mediante el flujo inicial de consentimiento, se obtiene un `refresh_token` de larga duración. Este token no expira y permite obtener de forma automática un `access_token` temporal en cada ejecución del Cron Job [1.1.1].
3.  **Variables de Entorno Clave:**
    *   `GMAIL_CLIENT_ID`: Identificador público de la consola de Google.
    *   `GMAIL_CLIENT_SECRET`: Clave secreta de la consola de Google.
    *   `GMAIL_REFRESH_TOKEN`: Token permanente que otorga permisos para actuar en nombre de `reservas@beachcanasvieiras.com`.

---

## 🛡️ 5. Políticas Anti-Spam y Cumplimiento de Cabeceras

Todo correo automático generado por este motor inyectará obligatoriamente los siguientes metadatos en su estructura MIME antes de presentarse ante los servidores de Google:

1.  **Alineación DMARC (`From` Coincidente):** El remitente del encabezado visible debe coincidir exactamente con el dominio autenticado por DKIM:
    `From: Hotel Beach Canasvieiras <reservas@beachcanasvieiras.com>` [1.1.1, 1.1.2]
2.  **Cabecera de Baja Rápida (RFC 8058):**
    `List-Unsubscribe: <https://beachcanasvieiras.com/api/unsubscribe?email=correo_cliente>` [1.1.2]
    `List-Unsubscribe-Post: List-Unsubscribe=One-Click` [1.1.2]
    *Estas cabeceras permiten que clientes como Gmail y Outlook muestren un botón de "Anular suscripción" al lado del nombre del hotel en la bandeja de entrada del usuario, impidiendo que el cliente tenga que marcar el correo manualmente como SPAM, protegiendo así la reputación de nuestro dominio.* [1.1.2, 1.2.3]

    ---

    