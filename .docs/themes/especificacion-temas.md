# Especificación Técnica de Temas: Beach Core PMS
> Arquitectura de diseño de bajo acoplamiento, gobernanza multitema y optimización visual de UI (v1.0 - Junio 2026).

Este documento especifica la estructura y el plan de implementación para habilitar tres temas dinámicos en el Property Management System (PMS) de **Beach Hotel Canasvieiras**, manteniendo el portal web (Landing Page) con su identidad institucional altamente parametrizable para uso en marca blanca (SaaS-Ready).

---

## 1. Los Tres Tiers de la Identidad Visual (PMS)

El panel del dashboard operará bajo tres configuraciones estéticas seleccionables por el personal según sus condiciones de iluminación y preferencias ergonómicas:

### A. Default Light (Lujo Ejecutivo)
*   **Concepto:** Interfaz diurna de alta claridad, limpia y asertiva, diseñada para uso de oficina en recepción con luz ambiental intensa.
*   **Valores Base:**
    *   Fondo Principal (`--dash-bg`): `#F9FAFB` (Gris/Blanco sutil)
    *   Superficie / Contenedores (`--dash-surface`): `#FFFFFF` (Blanco puro)
    *   Bordes y Separadores (`--dash-border`): `#E5E7EB` (Gris claro tenue)
    *   Texto Primario (`--dash-text-primary`): `#111827` (Negro carbón)
    *   Texto Secundario (`--dash-text-secondary`): `#6B7280` (Gris medio)
    *   Acento Interactivo (`--dash-accent`): `#0F3B66` (Azul corporativo del hotel)

### B. Sovereign Dark (Refugio Nocturno)
*   **Concepto:** La transición natural de nuestro diseño premium. Un modo oscuro profundo y sofisticado, con contraste atenuado para no fatigar la vista en turnos nocturnos.
*   **Valores Base:**
    *   Fondo Principal (`--dash-bg`): `#0D0E10` (Gris obsidiana)
    *   Superficie / Contenedores (`--dash-surface`): `#141517` (Antracita mate)
    *   Bordes y Separadores (`--dash-border`): `#1F2124` (Gris oscuro)
    *   Texto Primario (`--dash-text-primary`): `#F3F4F6` (Blanco suave)
    *   Texto Secundario (`--dash-text-secondary`): `#9CA3AF` (Gris plata)
    *   Acento Interactivo (`--dash-accent`): `#D4A574` (Tono arena cálida)

### C. Gemini Dark (Consola High-Tech)
*   **Concepto:** Inspirado en Google AI Studio. Un entorno oscuro altamente técnico, con bordes de bajísima fricción, acentos azules intensos y un gradiente dinámico cónico para elementos destacados (CRO).
*   **Valores Base:**
    *   Fondo Principal (`--dash-bg`): `#131314` (Gris Gemini profundo)
    *   Superficie / Contenedores (`--dash-surface`): `#1E1E1F` (Contenedor plano)
    *   Bordes y Separadores (`--dash-border`): `#2B2B2C` (Bordes finos)
    *   Texto Primario (`--dash-text-primary`): `#F3F3F3` (Blanco liso)
    *   Texto Secundario (`--dash-text-secondary`): `#9E9E9F` (Gris medio / lavanda)
    *   Acento Interactivo (`--dash-accent`): `#4285F4` (Azul neón Gemini)
    *   Gradiente Cónico de Acento: Combinación de `#4285F4` (Azul), `#1AA64A` (Verde), `#FCBD00` (Amarillo) y `#DB372D` (Rojo).

---

## 2. Topología de Tokens Semánticos (Filtro L0)

Para evitar que los estilos queden hardcodeados, todos los aparatos del dashboard se refactorizarán para consumir las siguientes variables de CSS del archivo `client/src/index.css`:

| Token Semántico | Utilidad Tailwind Correspondiente | Propósito |
| :--- | :--- | :--- |
| `var(--pms-bg)` | `bg-[var(--pms-bg)]` | Fondo de lienzo de la aplicación. |
| `var(--pms-surface)` | `bg-[var(--pms-surface)]` | Tarjetas, bloques y layouts flotantes. |
| `var(--pms-surface-high)` | `bg-[var(--pms-surface-high)]` | Inputs, dropdowns y hovers de menú. |
| `var(--pms-border)` | `border-[var(--pms-border)]` | Líneas divisorias y contornos de tarjetas. |
| `var(--pms-text)` | `text-[var(--pms-text)]` | Títulos y jerarquías tipográficas principales. |
| `var(--pms-text-muted)` | `text-[var(--pms-text-muted)]` | Párrafos descriptivos, placeholders y subtítulos. |
| `var(--color-v3-accent-link)` | `text-[var(--pms-accent)]` | Botones de conversión primaria, enlaces y estados activos. |

---

## 3. Implementación del Selector de Ámbito (Scope Attribute)

Para garantizar la estabilidad visual y cero regresiones en la landing page, el tema del dashboard se inyectará en la raíz de su layout en `AdminDashboard.tsx` utilizando un atributo HTML personalizado. 

```html
<!-- La raíz del dashboard controla de forma aislada el tema operativo -->
<div data-dashboard-theme="gemini-dark" class="flex h-screen overflow-hidden">
  <!-- Todos los componentes hijos heredan los tokens semánticos -->
  <aside class="bg-[var(--pms-surface)] border-r border-[var(--pms-border)]">
    <p class="text-[var(--pms-text-muted)]">Navegación</p>
  </aside>
</div>

---

