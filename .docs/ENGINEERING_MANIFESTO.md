Principios Fundamentales del Desarrollo
1. Integridad del Código
Atomicidad: Cada componente debe ser granular. Funcionalidad única, responsabilidad única.
Formato: Los scripts y componentes deben ser siempre entregados en su totalidad, listos para "copiar y pegar". No se aceptan entregas parciales ni fragmentos de código.
Rutas: Se utilizarán rutas relativas explícitas y completas en las importaciones.
Estabilidad: En cada refactorización, se debe priorizar la compatibilidad con el estado anterior, evitando regresiones.
2. Estructura del Ecosistema
Gestión de Base de Datos: Todo lo relacionado a la interacción con la base de datos se alojará bajo la carpeta scripts/supabase/.
Independencia de Scripts: Cada script debe ser auto-contenido, documentado con comentarios técnicos y capaz de ejecutarse de forma independiente con un reporte de salida estructurado (JSON).
3. Internacionalización (i18n)
Desacoplamiento: Ningún texto fijo (string) debe residir en los componentes. Todo texto pasará por la capa de i18n.
Evolución: La internacionalización se construirá de forma incremental, adaptando cada aparato a medida que sea creado o refactorizado.

4. Flujo de Trabajo hiper proactivo
Verificación: Antes de cualquier cambio, la IA debe auditar el estado actual del archivo.
Sincronización: Cada cambio que implique una modificación de la arquitectura será reportado en el registro de cambios (a definir).

Documentación: El presente docs/ENGINEERING_MANIFESTO.md es la fuente de verdad sobre las convenciones de este proyecto.

---

## Principios Fundamentales del Desarrollo

### 1. Integridad del Código
- **Atomicidad:** Cada componente debe ser granular. Funcionalidad única, responsabilidad única.
- **Formato:** Los scripts y componentes deben ser siempre entregados en su totalidad, listos para "copiar y pegar". No se aceptan entregas parciales ni fragmentos de código.
- **Rutas:** Se utilizarán rutas relativas explícitas y completas en las importaciones. 
- **Estabilidad:** En cada refactorización, se debe priorizar la compatibilidad con el estado anterior, evitando regresiones.

### 2. Estructura del Ecosistema
- **Gestión de Base de Datos:** Todo lo relacionado a la interacción con la base de datos se alojará bajo la carpeta `scripts/supabase/`.
- **Independencia de Scripts:** Cada script debe ser auto-contenido, documentado con comentarios técnicos y capaz de ejecutarse de forma independiente con un reporte de salida estructurado (JSON).

### 3. Base de Datos y Modelo de Datos
- **Modularidad:** El esquema de base de datos será altamente granular. Tendremos tablas separadas para `rooms`, `bookings`, `guests`, `users`, y `roles`.
- **Identidad:** El **email** será el identificador único principal (`unique identifier`) para establecer las relaciones de un usuario y sus roles dentro del sistema.
- **Seguridad:** Todas las tablas se crearán con Row Level Security (RLS) habilitado. Se implementará una autenticación basada en roles (RBAC) en futuras fases.

### 4. Internacionalización (i18n)
- **Desacoplamiento:** Ningún texto fijo (`string`) debe residir en los componentes. Todo texto pasará por la capa de i18n.
- **Evolución:** La internacionalización se construirá de forma incremental, adaptando cada aparato a medida que sea creado o refactorizado.

### 5. Flujo de Trabajo
- **Verificación:** Antes de cualquier cambio, la IA debe auditar el estado actual del archivo.
- **Sincronización:** Cada cambio que implique una modificación de la arquitectura será reportado en el registro de cambios (a definir).
- **Documentación:** El presente `docs/ENGINEERING_MANIFESTO.md` es la fuente de verdad sobre las convenciones de este proyecto.


### 6. Internacionalización (i18n) y Localización
- **Idiomas Oficiales:** Inglés (`en`), Español (`es`), Portugués de Brasil (`pt-BR`).
- **Middleware de Detección:** El sistema debe detectar el idioma del navegador (`navigator.language`) y la IP del usuario en el primer renderizado, sirviendo la versión óptima automáticamente.

### 7. Gestión de Estado Persistente y Tracking
- **Cookies (Larga duración):** Las cookies se usarán estrictamente para preferencias de usuario (idioma) y tracking de marketing (Google Ads, Meta Pixel) con una duración innegociable de **1 año**.
- **Local Storage (Corta/Media duración):** Se utilizará para caché de datos de la API y estados de sesión intermedios. Todo item en `localStorage` debe tener un mecanismo de **auto-limpieza (TTL - Time To Live)**.

---
### Contrato Estricto de Componentes (UI + i18n + Zod)
- **Nomenclatura Regional:** El idioma portugués utilizará estrictamente el estándar `pt-BR`. Todas las rutas, diccionarios y lógicas deben respetar este formato sin excepciones.
- **Trinidad Atómica:** Todo "Aparato" (Componente UI) que renderice texto debe poseer obligatoriamente tres elementos:
  1. El componente React (`Aparato.tsx`).
  2. Sus diccionarios granulares aislados (`Aparato.json` en `es`, `en`, `pt-BR`).
  3. Su esquema de validación (`Aparato.schema.ts`) utilizando Zod.
- **Garantía de Runtime:** El componente no debe confiar ciegamente en el motor i18n. Debe utilizar el esquema Zod asociado para asegurar que la estructura del texto recuperado cumple con el contrato esperado antes de renderizarse.

---


