# Mapa de Rutas y Archivos de Gobernación Legal - Beach Core PMS
> SSoT para la distribución de políticas de cumplimiento de LGPD, GDPR, cookies y términos de servicio.

## 1. Rutas del Cliente (Vistas Públicas de la Landing Page)
Las páginas legales se renderizan de forma dinámica leyendo los diccionarios traducidos según el idioma detectado por el middleware:

*   `/termos` -> Renderiza el componente `TermsOfService.tsx` consumiendo `translation.json -> legal.terms`.
*   `/privacidade` -> Renderiza el componente `PrivacyPolicy.tsx` consumiendo `translation.json -> legal.privacy`.
*   `/cookies` -> Renderiza el componente `CookiePolicy.tsx` consumiendo `translation.json -> legal.cookies`.

## 2. Estructura de Archivos en el Repositorio
Para adherirnos al Manifiesto de Ingeniería, el ecosistema legal se distribuye en:


Para consolidar formalmente el ecosistema legal y de cumplimiento de la plataforma SaaS Beach Core PMS (propiedad de METASHARK INOVA SIMPLES (I.S.)), implementaremos la Trinidad Atómica (Zod + Diccionarios + Mapa de Rutas).
Esto nos permite unificar las directivas legales internacionales y de la LGPD brasileña en una estructura tipada y segura antes de su renderizado.
A continuación, se detalla el mapa de archivos, la especificación de esquemas de validación con Zod y los diccionarios unificados en los tres idiomas del proyecto.
Parte 1: Mapa de Rutas de Entrega Legal (.docs/mapa-rutas-legales.md)
Crearemos este manifiesto en la ruta .docs/mapa-rutas-legales.md para mapear de forma síncrona todas las vistas y endpoints requeridos por el algoritmo de gobernanza legal:
Ruta relativa del archivo: .docs/mapa-rutas-legales.md
code
Markdown
# Mapa de Rutas y Archivos de Gobernación Legal - Beach Core PMS
> SSoT para la distribución de políticas de cumplimiento de LGPD, GDPR, cookies y términos de servicio.

## 1. Rutas del Cliente (Vistas Públicas de la Landing Page)
Las páginas legales se renderizan de forma dinámica leyendo los diccionarios traducidos según el idioma detectado por el middleware:

*   `/termos` -> Renderiza el componente `TermsOfService.tsx` consumiendo `translation.json -> legal.terms`.
*   `/privacidade` -> Renderiza el componente `PrivacyPolicy.tsx` consumiendo `translation.json -> legal.privacy`.
*   `/cookies` -> Renderiza el componente `CookiePolicy.tsx` consumiendo `translation.json -> legal.cookies`.

## 2. Estructura de Archivos en el Repositorio
Para adherirnos al Manifiesto de Ingeniería, el ecosistema legal se distribuye en:
beach-hotel-canasvieiras/
├── .docs/
│ └── mapa-rutas-legales.md <-- Este archivo
├── client/
│ └── src/
│ ├── components/
│ │ └── legal/
│ │ ├── CookieBanner.tsx # Widget de consentimiento síncrono
│ │ └── LegalLayout.tsx # Contenedor común de vistas legales
│ └── locales/
│ ├── es-ES/
│ │ └── legal.json # Diccionario español de España
│ ├── en-US/
│ │ └── legal.json # Diccionario inglés americano
│ ├── pt-BR/
│ │ └── legal.json # Diccionario portugués brasileño (SSoT)
│ └── schemas/
│ └── legal.schema.ts # Validador de esquemas Zod (Trinity)

## 3. Endpoints del Servidor (Gobernación de Datos)
*   `POST /api/legal/cookie-consent`: Registra la IP ofuscada (ISO 27001) y la preferencia en el backend.
*   `DELETE /api/legal/purge-data`: Endpoint administrativo para cumplir con el "Derecho al Olvido" de la LGPD, eliminando huéspedes inactivos de `public.guests`.

---

Este análisis exhaustivo y sistemático de los términos y condiciones de Channex.io (Contrato de Cliente, DPA de GDPR, Políticas de Privacidad, Uso Aceptable y Seguridad) servirá como el plano arquitectónico y legal-técnico para redactar las políticas de nuestro propio sistema PMS y plataforma SaaS (Beach Core PMS).
La estructura de Channex ha sido desglosada en cinco pilares operacionales críticos para la industria del software de hospitalidad.
Pilar 1: Matriz de Retención de Datos y PCI-DSS (La Gobernanza de la Información)
Este es el pilar más sensible de la plataforma debido a la coexistencia de Información de Identificación Personal (PII) y Datos de Tarjetas de Pago (PCI). Channex implementa límites temporales estrictos para reducir su alcance de auditoría y responsabilidad legal:
Tipo de Datos	Política de Retención Channex	Propósito Técnico / Cumplimiento	Propuesta Beach Core PMS
Datos de Tarjeta (PAN, CVV, Exp)	Eliminación automática 7 días después del Check-Out.	Minimiza el riesgo de multas y fugas bajo PCI-DSS Level 1.	Mismo estándar: Forzar eliminación mediante un Vercel Cron Job síncrono.
Datos de Reservas (Bookings)	Eliminación automática 3 meses después del Check-Out.	Cumplimiento del derecho al olvido (GDPR / LGPD brasileña).	Retención de 6 meses: Necesaria para reportes de contabilidad del hotel.
Tarifas y Disponibilidad Pasada	Eliminación diaria de registros históricos.	Optimización del rendimiento de la base de datos (PostgreSQL).	Mismo estándar: Limpiar diariamente las celdas históricas de rooms.
Propiedades Inactivas	Eliminación tras 3 meses sin canales activos.	Evita el consumo ocioso de almacenamiento en la nube.	Mismo estándar: Desactivar tenants inactivos automáticamente.
Pilar 2: Estructura del Contrato y Limitaciones de Responsabilidad
El acuerdo de Channex está diseñado para proteger al proveedor de software frente a demandas millonarias causadas por fallos en la conectividad o pérdidas de reservas (sobre-reservas).
Conceptos Clave a Replicar en el Beach Core PMS:
Límite de Responsabilidad (Liability Cap): Channex limita su responsabilidad financiera total al monto cobrado al cliente en los últimos 12 meses (Sección 19). En cuentas gratuitas o de prueba, la compensación máxima es de $20 USD.
Lección para nuestro PMS: Debemos incluir una cláusula idéntica que limite nuestra responsabilidad ante pérdidas causadas por sobre-reservas debido a fallas de sincronización externas de Booking o Decolar.
Exclusión de Garantías (Warranty Disclaimer): Se establece explícitamente que el servicio se entrega "AS IS" (Tal cual está). No se garantiza que el servicio sea ininterrumpido o libre de errores de red inherentes a la infraestructura de internet o de las OTAs (Sección 18.2).
Prohibición de Datos Sensibles Médicos: Se prohíbe explícitamente subir datos regulados por HIPAA (salud) o datos personales que no sean necesarios para la reserva (Sección 7.7.2).
Pilar 3: Anexo de Procesamiento de Datos (DPA) bajo GDPR / LGPD
La legislación brasileña (LGPD - Lei Geral de Proteção de Dados) y la europea (GDPR) exigen definir de forma transparente los roles de las partes en el tratamiento de los datos del huésped.
El Cliente (El Hotel) es el Controlador (Data Controller): Es el dueño de los datos del huésped y el único responsable de obtener el consentimiento legal para su tratamiento.
El PMS (Beach Core) es el Encargado (Data Processor): Procesa la información (nombres, correos, estancias) exclusivamente para cumplir con el servicio contratado (el "Permitted Purpose") (Sección 28.1.2).
Subprocesadores (Subprocessors): Channex exige el consentimiento del cliente para delegar almacenamiento o infraestructura (como AWS, Google Cloud o, en nuestro caso, Supabase y Stripe) (Sección 28.1.7). Se debe dar un aviso previo de 30 días antes de cambiar de proveedor de base de datos para que el cliente pueda objetar por motivos de privacidad.
Pilar 4: Política de Seguridad de la Infraestructura (ISO 27001)
Channex detalla de forma transparente su modelo de Defensa en Profundidad (Defense in Depth), lo que genera confianza técnica y comercial:
Segregación de Entornos (VLANs / Redes): Separación lógica absoluta entre los entornos de desarrollo, pruebas y producción, impidiendo que datos de huéspedes reales se utilicen en fases de pruebas locales.
Acceso Mínimo Requerido (No Root Access): Ningún cliente o agente externo tiene acceso de administrador (root) a los servidores, bases de datos o contenedores. Toda consulta se rutea mediante APIs validadas con firmas Bearer (Sección "No Root Access").
Hardening de Sistemas (Endurecimiento): Inspección continua de puertos y servicios. Se desactivan de forma sistemática todos los servicios y puertos que no sean requeridos para la transmisión HTTPS (como SSH expuesto o puertos de base de datos abiertos).
Pilar 5: Política de Uso Aceptable (Acceptable Use Policy)
Este documento previene que los clientes utilicen la plataforma para actividades maliciosas o que degraden el rendimiento de los servidores compartidos.
Restricciones Críticas a Importar:
Prohibición de Abuso de Recursos: Bloquea actividades de scraping automatizado (extracción de datos), pruebas de penetración o escaneo de vulnerabilidades no autorizadas por el hotel en la API del PMS.
Prevención de Spam: Prohíbe el uso de la cola de correos del sistema (email_queue) para enviar publicidad no solicitada o masiva que comprometa la reputación de entrega IP de nuestra API (Resend/SMTP).
Plan de Acción para Redactar Nuestros Términos y Condiciones (SaaS Ready)
Para el lanzamiento formal de la plataforma comercial Beach Core PMS, dividiremos la redacción legal-técnica en tres documentos independientes:
Términos del Servicio (ToS): Regulará el licenciamiento de uso del PMS, el límite de responsabilidad ante overbookings accidentales, las suscripciones recurrentes de Stripe y la jurisdicción legal (Florianópolis, Brasil).
Anexo de Tratamiento de Datos (DPA): Alineado con la LGPD brasileña, definiendo al hotel como controlador y a nuestro PMS como encargado, especificando el subprocesamiento de datos a través de Supabase y Stripe.
Política de Seguridad de Datos: Detallando de forma transparente nuestro cifrado AES-256-GCM sobre cookies de sesión, las políticas RLS restrictivas a nivel de base de datos y la destrucción segura de tarjetas de crédito 7 días después del check-out del huésped.

---

