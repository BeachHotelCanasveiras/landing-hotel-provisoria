🎯 El Plan de Viaje y Conversión Real (Embudo Optimizado)
Para maximizar el porcentaje de conversión (CRO) de la landing, debemos reorganizar el viaje del usuario en 6 fases psicológicas continuas:
code
Code
[ FASE 1: INSPIRACIÓN ] ──────► [ FASE 2: CONEXIÓN ] ──────► [ FASE 3: DECISIÓN ]
     (Hero Section)                (Propuesta Confort)             (Habitaciones)
                                                                         │
[ FASE 6: CONVERSIÓN ] ◄────── [ FASE 5: GEOLOCALIZACIÓN ] ◄──── [ FASE 4: CERTEZA ]
  (Booking / WhatsApp)             (Mapa y Atracciones)          (Galería y Opiniones)
Fase 1: Inspiración y Conexión Emocional (El Sueño)
Aparato: Hero.tsx
Objetivo Psicológico: Despertar el deseo del descanso. El vaivén lento de las imágenes y la tipografía Serif itálica le permiten imaginarse allí.
CRO Trigger: Botón primario ("Consultar Disponibilidad") que desliza suavemente al usuario hacia el catálogo de habitaciones, no hacia fuera de la web.
Fase 2: Conexión y Propuesta de Confort (El Gancho) — NUEVO BLOQUE
Aparato: AboutSection / ConfortFeatures
Objetivo Psicológico: Validar la decisión racional. El viajero se pregunta: ¿Por qué este hotel me dará paz?
CRO Trigger: Un bloque minimalista de 3 pilares con iconos limpios:
Ubicación Serena: Sobre la principal Av. das Nações, a pasos del mar de aguas tranquilas.
Desayuno de la Casa: Buffet artesanal para empezar el día sin prisas.
Calidez Familiar: Atención de hogar, soporte en español/portugués y soporte 24/7.
Fase 3: Configuración del Descanso (La Decisión)
Aparato: Rooms.tsx
Objetivo Psicológico: Encontrar el espacio adecuado para el grupo familiar.
CRO Trigger: Tarjetas Soft-UI limpias que muestran las opciones (Single, Doble, Triple, Grupal). El precio fijo se oculta para evitar rebote por estacionalidad. Cada tarjeta tiene un botón "Reservar" que abre el BookingDialog interactivo.
Fase 4: Validación Visual y Social (La Certeza)
Aparato: Gallery.tsx + Testimonials.tsx
Objetivo Psicológico: Eliminar el miedo al fraude o a la "expectativa vs. realidad".
CRO Trigger:
Gallery: Fotos reales del hotel, piscina y entorno servidas desde Cloudinary.
Testimonials: Reseñas reales segmentadas por país de origen (Chile, Argentina, Uruguay, Brasil) para generar familiaridad cultural inmediata.
Fase 5: Control y Certeza Geográfica (La Viabilidad) — INTEGRACIÓN DE MAPA
Aparato: MapView (del archivo Map.tsx actual) + Attractions.tsx
Objetivo Psicológico: Confirmar la conveniencia logística. El cliente ve la cercanía exacta a la playa, supermercados y paseos.
CRO Trigger: Renderizar el mapa de Google Maps centrado de forma interactiva en la Av. das Nações 375, seguido de las distancias reales a pie o en auto en Attractions.
Fase 6: Conversión de Baja Fricción (La Transacción)
Aparato: BookingDialog.tsx
Objetivo Psicológico: Reservar de forma segura y humana, sin introducir tarjetas en pasarelas de pago impersonales.
CRO Trigger: Motor Airbnb-Lite de 2 pasos (Fechas con calendario interactivo -> Datos básicos). El flujo culmina en un mensaje de WhatsApp impecablemente estructurado, iniciando una venta consultiva de alta conversión.

---

