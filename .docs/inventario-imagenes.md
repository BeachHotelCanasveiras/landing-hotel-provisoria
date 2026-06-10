# Inventario y Optimización de Activos Multimedia (SEO Ready)

La plataforma utiliza una arquitectura de "Punteros de Activos" (*Sovereign Pointers*). Todo recurso multimedia se almacena en el bucket `sanctuary-vault` de Supabase S3 y se optimiza dinámicamente mediante el motor Sharp del CMS.

## 1. Estándares Técnicos de Ingesta (Filtro L0)

| Tamaño de Imagen | Dimensiones Óptimas | Formato Recomendado | Calidad Sharp | Propósito en UI |
| :--- | :--- | :--- | :--- | :--- |
| **Thumbnail** | 400 x 300 px | WebP | 80% | Previsualizaciones rápidas en listados y avatares. |
| **Card** | 768 x 1024 px | AVIF | 75% | Tarjetas de Suites y Artículos de Blog (Relación 3:4 o vertical). |
| **Hero Cinematic** | 2560 x 1080 px | WebP | 85% | Fondos cinemáticos, carruseles de cabecera y sliders de ancho completo. |

## 2. Inventario de Activos del Hotel (Canasvieiras Core)

### A. Sección: Recepción y Presentación (Hero)
*   **Atributo ALT Altamente Descriptivo:** "Vista panorámica aérea del Hotel Beach Canasvieiras frente al mar en Florianópolis"
*   **Nombre de Archivo Optimizado para S3:** `hotel-beach-canasvieiras-vista-aerea-florianopolis.webp`
*   **Dimensiones Óptimas:** 2560 x 1080 px (Hero Cinematic)
*   **Uso:** Imagen de fondo estática o póster de carga para el video de cabecera.

### B. Sección: Filosofía de la Casa (About)
*   **Atributo ALT Altamente Descriptivo:** "Fachada principal del Hotel Beach Canasvieiras a pasos de la playa de Canasvieiras"
*   **Nombre de Archivo Optimizado para S3:** `hotel-beach-canasvieiras-fachada-principal-playa.webp`
*   **Dimensiones Óptimas:** 768 x 1024 px (Card) o 800 x 600 px (Custom Aspect Ratio)
*   **Uso:** Imagen destacada en `AboutSection.tsx`.

### C. Catálogo de Hospitalidad (Luxury Suites)
Cada suite requiere imágenes exclusivas que reflejen su nivel de confort y justifiquen el Yield comercial:

1.  **Suite Master Sanctuary**
    *   **Atributo ALT Altamente Descriptivo:** "Interior de la Suite Master con cama king size, jacuzzi privado y vista al mar en Florianópolis"
    *   **Nombre de Archivo Optimizado para S3:** `suite-master-sanctuary-jacuzzi-vista-mar.avif`
    *   **Dimensiones Óptimas:** 768 x 1024 px (Card / AVIF)

2.  **Suite Deluxe**
    *   **Atributo ALT Altamente Descriptivo:** "Habitación Deluxe con balcón privado, minibar y diseño moderno frente a la playa de Canasvieiras"
    *   **Nombre de Archivo Optimizado para S3:** `suite-deluxe-balcon-playa-canasvieiras.avif`
    *   **Dimensiones Óptimas:** 768 x 1024 px (Card / AVIF)

3.  **Habitación Standard Comfort**
    *   **Atributo ALT Altamente Descriptivo:** "Habitación estándar confortable con cama de dos plazas y aire acondicionado en Canasvieiras"
    *   **Nombre de Archivo Optimizado para S3:** `habitacion-standard-comfort-hospedaje-boutique.avif`
    *   **Dimensiones Óptimas:** 768 x 1024 px (Card / AVIF)

### D. Testimonios (Social Proof)
*   **Atributo ALT Altamente Descriptivo:** "Retrato de James Sterling, huésped frecuente del programa de fidelidad del hotel"
*   **Nombre de Archivo Optimizado para S3:** `james-sterling-huesped-frecuente-avatar.webp`
*   **Dimensiones Óptimas:** 400 x 300 px (Thumbnail)

## 3. Inventario de Activos del Festival (Canasvieiras Fest 2026)

### A. HQ Sunset (Día 1)
*   **Atributo ALT Altamente Descriptivo:** "Fiesta de apertura en la piscina del Hotel Beach Canasvieiras al atardecer"
*   **Nombre de Archivo Optimizado para S3:** `hq-sunset-fiesta-apertura-piscina.webp`
*   **Dimensiones Óptimas:** 768 x 1024 px (Card)

### B. Boat Party (Día 3)
*   **Atributo ALT Altamente Descriptivo:** "Fiesta a bordo de un yate privado recorriendo la Bahía Norte de Florianópolis"
*   **Nombre de Archivo Optimizado para S3:** `boat-party-new-wave-yate-privado.webp`
*   **Dimensiones Óptimas:** 768 x 1024 px (Card)

### C. The Sanctuary Night (Día 5)
*   **Atributo ALT Altamente Descriptivo:** "Inmersión de música techno con iluminación láser en club subterráneo de Florianópolis"
*   **Nombre de Archivo Optimizado para S3:** `the-sanctuary-night-club-underground-techno.webp`
*   **Dimensiones Óptimas:** 768 x 1024 px (Card)