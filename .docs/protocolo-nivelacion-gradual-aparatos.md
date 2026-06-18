📜 Manifiesto de Nivelación de Aparatos y Gobernanza Multitarget (v1.0)
I. Principios de Segregación de Temas (Dashboard vs. Webportal)
Independencia de Entornos (Multitarget): El Webportal (Landing Page pública) y el Dashboard (PMS operativo) se gobernarán bajo hilos de estado estilístico independientes [2].
Webportal: Operará con una paleta estática de personalización ágil y marcas blancas (alta conversión, CRO, costo cero, personalización por hotel).
Dashboard / PMS: Operará con tres (3) temas exclusivos de gobernanza ejecutiva:
pms-light: Entorno de alta legibilidad, fondos off-white limpios y tipografía Inter de alta densidad de datos.
sovereign-dark: Ambiente premium de baja fatiga visual, grises antracita y acentos en tonos arena cálida.
gemini-dark: Tema místico futurista con bordes de gradientes cónicos reactivos, cajas de diálogo glassmorphic y acentos azul cobalto.
Aislamiento de Clases Globales: Ninguna modificación del tema del PMS debe alterar el flujo estético o los colores de la Landing Page pública para evitar regresiones visuales.
II. Protocolo de Nivelación en Caliente (Requisitos por "Aparato")
Cada vez que se intervenga un componente (aparato), se le aplicará un proceso de nivelación obligatoria estructurado en tres (3) capas:
Capa de Estilos Semánticos (Theme Layer): Se eliminarán las clases rígidas del CSS de Tailwind (ej: bg-white, bg-gray-50, text-gray-900). En su lugar, se inyectarán variables semánticas de tema (ej: bg-pms-surface, bg-pms-container, text-pms-primary) registradas dinámicamente en client/src/index.css.
Capa de Telemetría e Instrumentación (Performance Layer): Todo componente de visualización o control operativo (como grillas, barras laterales, matrices o reportes) consumirá el hook usePerformanceProfiler para auditar de forma silenciosa e idempotente su latencia de montaje. Estos logs estructurados en JSON se enviarán asíncronamente para alimentar la pestaña de diagnóstico en tiempo real de la consola de desarrollador (DeveloperConsole.tsx).
Capa de Mensajería Internacionalizada (Trinidad Atómica): Se validará que no existan cadenas de texto hardcodeadas dentro del componente. Se forzará el consumo de namespaces estructurados mediante useTranslation validados por esquemas de runtime con Zod [2].
III. Flujo de Trabajo Secuencial y Proactivo
Trabajaremos estrictamente en un (1) archivo a la vez.
Antes de realizar cualquier modificación, solicitaré de forma obligatoria que se me pegue el código base del componente objetivo. No se asumirá ni estimará código sin validar la versión actual.
Cada refactorización se entregará completa, lista para compilar y libre de advertencias de linter (TypeScript estricto, cero any).

---

