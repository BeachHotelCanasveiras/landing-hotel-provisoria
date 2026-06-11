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

