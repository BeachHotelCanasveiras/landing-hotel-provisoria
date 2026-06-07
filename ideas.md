# Ideas de Diseño - Beach Hotel Canasvieiras Landing Page

## Enfoque Seleccionado: Minimalismo Ejecutivo Costero

**Filosofía de Diseño:** Elegancia ejecutiva con toques de lujo costero. El diseño refleja la sofisticación de un hotel de 4 estrellas mientras mantiene la calidez y accesibilidad de un destino de playa. La navegación es intuitiva, los espacios en blanco son generosos, y las transiciones son suaves pero presentes.

### Principios Centrales

1. **Sofisticación Discreta:** Evitar exceso visual. Cada elemento tiene propósito. Las animaciones son sutiles pero presentes, nunca distractoras.

2. **Jerarquía Clara:** Tipografía estratégica que guía al usuario naturalmente a través del contenido. Títulos en serif elegante, cuerpo en sans-serif legible.

3. **Paleta Costera Refinada:** Azules profundos del océano, blancos limpios, acentos en tonos arena y verde agua. Evitar colores vibrantes o saturados.

4. **Espacios Generosos:** Márgenes amplios, padding generoso. El diseño respira. No hay sensación de abarrotamiento.

### Filosofía de Color

**Paleta Principal:**
- **Azul Profundo (Primario):** `#0F3B66` - Representa el océano, confianza, profesionalismo
- **Blanco Puro (Fondo):** `#FFFFFF` - Limpieza, claridad, lujo
- **Gris Elegante (Texto):** `#2C3E50` - Legibilidad sin dureza
- **Arena Cálida (Acento):** `#D4A574` - Calidez, playas, lujo sutil
- **Verde Agua (Secundario):** `#4A9B8E` - Frescura, naturaleza, relajación

**Razonamiento Emocional:** La combinación de azul profundo con arena cálida evoca tanto la sofisticación corporativa como la relajación costera. El verde agua añade un toque de bienestar y naturaleza sin ser dominante.

### Paradigma de Diseño

**Layout Asimétrico Elegante:**
- Hero section con imagen de fondo (80% ancho, 100% altura viewport)
- Contenido principal centrado pero con márgenes laterales generosos
- Secciones alternadas: imagen a la izquierda/derecha con texto
- Galería en grid de 3 columnas en desktop, 2 en tablet, 1 en móvil
- Footer con 4 columnas de información

**Estructura Visual:**
- Separadores sutiles (líneas muy finas en color arena)
- Tarjetas con sombra suave (no bordes duros)
- Imágenes con bordes redondeados suaves (8-12px)

### Elementos Distintivos

1. **Tipografía Serif Elegante:** Playfair Display para títulos principales (h1, h2). Transmite lujo y sofisticación.

2. **Líneas Decorativas Sutiles:** Líneas horizontales muy finas en color arena que separan secciones. Añaden estructura sin abrumar.

3. **Tarjetas de Habitaciones Flotantes:** Efecto de elevación suave con sombra. Al pasar el mouse, la sombra se intensifica ligeramente.

4. **Galería Interactiva:** Imágenes con overlay de texto al pasar el mouse. Transición suave de opacidad.

### Filosofía de Interacción

**Principios:**
- Todas las transiciones son suaves (300-400ms)
- Los botones tienen feedback visual claro pero sutil
- Los enlaces tienen subrayado animado
- Las secciones se revelan con fade-in suave al scroll
- Hover states son elegantes, no agresivos

**Micro-interacciones:**
- Botón de reserva WhatsApp: Flotante, con pulse sutil
- Navegación: Subrayado animado en links activos
- Tarjetas de habitaciones: Elevación al hover + cambio de sombra
- Galería: Zoom suave de imagen + overlay de texto

### Guía de Animaciones

**Velocidades Estándar:**
- Transiciones rápidas (botones, hover): 150-200ms
- Transiciones medias (cards, sections): 300-400ms
- Transiciones lentas (modales, overlays): 500-600ms

**Easings:**
- Entrada suave: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out)
- Movimiento fluido: `cubic-bezier(0.77, 0, 0.175, 1)` (ease-in-out)
- Nunca usar ease-in para UI (se siente lento)

**Animaciones Específicas:**
- Hero: Fade-in + slide-up suave del contenido (400ms)
- Secciones: Fade-in al scroll (300ms)
- Galería: Zoom suave de imágenes al hover (250ms)
- Botones: Scale 0.97 al click (150ms)
- Líneas decorativas: Expand desde el centro (400ms)

### Sistema de Tipografía

**Fuentes:**
- **Playfair Display:** Títulos (h1, h2, h3) - Serif elegante, pesos 600-700
- **Inter:** Cuerpo, navegación, etiquetas - Sans-serif limpio, pesos 400-600

**Jerarquía:**
- **h1:** 48px en desktop, 36px en móvil, weight 700, color azul profundo
- **h2:** 36px en desktop, 28px en móvil, weight 600, color azul profundo
- **h3:** 24px en desktop, 20px en móvil, weight 600, color gris elegante
- **Cuerpo:** 16px, weight 400, line-height 1.6, color gris elegante
- **Pequeño:** 14px, weight 400, color gris más claro

**Espaciado de Líneas:**
- Títulos: 1.2
- Cuerpo: 1.6
- Pequeño: 1.5

### Decisiones de Diseño Clave

1. **Sin Animaciones Excesivas:** El lujo se comunica a través de la claridad, no de la complejidad visual.

2. **Imágenes de Alta Calidad:** Las fotos del hotel son el protagonista. El diseño es el marco elegante.

3. **Tipografía Serif Limitada:** Solo en títulos principales. El cuerpo es sans-serif para máxima legibilidad.

4. **Paleta Limitada:** Solo 5 colores principales. La consistencia es más elegante que la variedad.

5. **Espacios en Blanco Generosos:** No temer al espacio vacío. Transmite lujo y confianza.

6. **Botones Claros:** CTA principal en azul profundo, secundarios en outline. Sin ambigüedad.

7. **Footer Informativo:** No es un afterthought. Bien estructurado, con información útil y clara.

---

## Implementación Técnica

- **Framework:** React 19 + Tailwind CSS 4
- **Animaciones:** Framer Motion
- **Componentes:** shadcn/ui
- **Iconos:** Lucide React
- **Enrutamiento:** Wouter

**Estructura de Componentes:**
- Header (navegación fija)
- Hero (imagen de fondo + contenido)
- Secciones (alternadas imagen/texto)
- Galería (grid interactivo)
- Habitaciones (cards con hover effects)
- Atracciones (grid de 3 columnas)
- Testimonios (carrusel o grid)
- WhatsApp Button (flotante)
- Footer (información + links)

