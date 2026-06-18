# Límites de la Cuenta Vercel Hobby y Proyección de Costos de Producción (v2026-06)
> SSoT para el control de consumo de infraestructura serverless, auditoría de cuotas del plan gratuito (Hobby) y calculadora de escalado financiero en el plan comercial (Pro).

---

## 1. Tabla Comparativa de Límites Generales y Cuotas

| Recurso / Métrica | Plan Hobby (Gratuito) | Plan Pro (Comercial) | Unidad de Medida / Frecuencia |
| :--- | :--- | :--- | :--- |
| **Proyectos por Cuenta** | 200 | Ilimitados | Cantidad total |
| **Despliegues Diarios** | 100 | 6,000 | Por día (ciclo de 24h) |
| **Funciones por Despliegue** | 12 (Límite estricto) | Sin límite rígido | Cantidad de Serverless Functions (rutas `/api`) |
| **Cores de Compilación** | 2 Cores | 2 Cores | Capacidad de cómputo en build |
| **Memoria de Compilación**| 8 GB | 8 GB | Memoria RAM en tiempo de empaquetado |
| **Duración de Compilación** | Máx. 45 min | Máx. 60 min | Límite por función serverless en ejecución |
| **Conexiones Git** | Solo cuentas personales | Cuentas personales y de equipos | Integración directa con GitHub |
| **Límite de Tamaño de Chunk** | 500 kB (Advertencia) | 500 kB (Advertencia) | Alerta de empaquetado Rollup/Vite |

---

## 2. Límites Específicos de Infraestructura Serverless (Hobby)

A continuación, se detallan las cuotas de consumo gratuitas mensuales asignadas a la cuenta Hobby. Si se excede cualquiera de estos límites, el servicio puede suspenderse temporalmente hasta el siguiente ciclo de facturación o requerir la migración al plan Pro:

*   **Invocaciones de Funciones (Invocations):** **1 millón (1,000,000)** de ejecuciones de funciones serverless al mes.
*   **Active CPU:** **4 CPU-horas** mensuales de tiempo de procesamiento activo.
*   **Provisioned Memory:** **360 GB-horas** mensuales de memoria asignada al ciclo de vida de las funciones.
*   **Ancho de Banda (Fast Data Transfer):** **100 GB** de transferencia de datos de salida al mes.
*   **Transferencia de Origen (Fast Origin Transfer):** Hasta **10 GB** de datos desde el origen.
*   **Duración de Ejecución de Función (Timeout):**
    *   *Por defecto:* **10 segundos** por llamada síncrona.
    *   *Máximo configurable:* **60 segundos** (1 minuto) en la configuración de la función.
*   **Retención de Logs de Tiempo de Ejecución (Runtime Logs):** **1 hora** de almacenamiento en el panel de Vercel.
*   **Dominios por Proyecto:** **50 dominios** vinculados como máximo.
*   **Carga de Archivos Estáticos (CLI):** Máximo **100 MB** de peso total en los archivos de origen.
*   **Archivos de Origen (Source Files):** Máximo **15,000 archivos** cargados mediante la CLI de Vercel.
*   **Límite de Almacenamiento de Caché de Build:** Máximo **1 GB** (Retenido por 1 mes).
*   **Tiempo de Espera de Peticiones Proxy (Proxied Timeout):** **120 segundos** (2 minutos) para redirecciones externas.
*   **Vercel Blob Storage (Operaciones simples):** Máximo **1,200 operaciones** por minuto.
*   **Vercel Blob Storage (Operaciones avanzadas):** Máximo **1,500 operaciones** por minuto.
*   **Cron Jobs Configurados:** Máximo **20 trabajos cron** activos por proyecto (con ejecución mínima de 1 vez por hora en Hobby).

---

## 3. Límites de Tasa de Despliegue (Rate Limits - Hobby)

*   **Límite de Despliegues por Día:** **100 despliegues** por cada 86,400 segundos.
*   **Límite de Despliegues por Hora:** **100 despliegues** por cada 3,600 segundos.
*   **Límite de Despliegues por 5 Minutos:** **60 despliegues** por cada 300 segundos.
*   **Cambios de Nombre de Usuario:** Máximo **6 veces** por semana.

---

## 4. Calculadora y Proyección Financiera de Despliegue en Producción (Plan Pro)

Cuando el tráfico del hotel y las agencias crezca, o si requerimos agregar más de 12 funciones serverless, migraremos a la cuenta **Vercel Pro ($20 USD / mes por miembro)**. En esta cuenta, los recursos consumidos que excedan los límites base se facturarán bajo demanda según la siguiente matriz de precios:

### A. Tarifas Unitarias de Consumo Bajo Demanda (On-Demand Rates)
*   **Invocaciones de Funciones (Invocations):** `$0.60` por cada 1,000,000 de invocaciones adicionales.
*   **Active CPU (Tiempo de cómputo):** `$0.128` por hora de cómputo activa.
*   **Provisioned Memory:** `$0.0106` por GB-hora consumido.
*   **Edge Config Reads (Lecturas rápidas):** `$3.00` por cada 1,000 lecturas.
*   **Edge Config Writes (Escrituras rápidas):** `$10.00` por cada 1,000 escrituras.
*   **ISR Reads (Caché estático incremental):** `$0.0004` por cada 1,000 lecturas.
*   **ISR Writes (Generación de páginas en caché):** `$0.004` por cada 1,000 escrituras.
*   **Eventos de Web Analytics (Métrica nativa):** `$3.00` por cada 1,000 eventos registrados.
*   **Eventos de Speed Insights:** `$0.65` por cada 10,000 eventos de rendimiento de carga.
*   **Transformaciones de Optimización de Imagen:** `$0.05` por cada 1,000 imágenes procesadas en la CDN.
*   **Lectura de Caché de Imágenes:** `$0.40` por cada 1,000,000 de lecturas.
*   **Escritura de Caché de Imágenes:** `$4.00` por cada 1,000,000 de escrituras.
*   **Logs y Telemetría Asíncrona (Log Drains):** `$0.50` por cada 1 GB de logs procesados.

---

## 5. Simulación Práctica de Consumo Mensual (Beach Hotel Canasvieiras)

Supongamos un escenario operativo real de alto tráfico en temporada alta con **10,000 visitas al portal**, **1,500 reservas creadas** y sincronización constante de canales.

### A. Volumen de Invocaciones Estimado (Serverless):
1.  **Checkout Sessions (`session.ts`):** 3,000 intentos de reserva = 3,000 invocaciones.
2.  **Webhooks de Stripe (`stripe.ts`):** 1,500 reservas exitosas * 3 webhooks (payment, update, completion) = 4,500 invocaciones.
3.  **Cron de iCal Sync (`sync.ts` & `ical-import.ts`):** 24 horas * 4 ejecuciones/hora * 30 días = 2,880 invocaciones.
4.  **Worker de Correos (`process-mails.ts`):** 12 ejecuciones/hora * 24 horas * 30 días = 8,640 invocaciones.
5.  **Recuperador de Checkout (`retrieve.ts`):** 2,000 consultas de éxito = 2,000 invocaciones.
6.  **Sincronizador de Tarifas (`rates.ts`):** 100 modificaciones manuales = 100 invocaciones.

*   **Total de Invocaciones Mensuales Estimado:** **21,120 invocaciones**.
*   **Cálculo de Costo en Hobby:** **Costo $0** (Muy por debajo del límite gratuito de 1 millón).
*   **Costo Proyección en Pro:** **Costo $0** (Incluido en la cuota base del plan Pro).

### B. Consumo de Ancho de Banda (Fast Data Transfer):
*   La Landing Page y el PMS Dashboard están altamente optimizados. Tamaño promedio de página cargada (con imágenes de Cloudinary redirigidas) es de **1.2 MB**.
*   10,000 visitas mensuales * 1.2 MB = **12 GB de transferencia de datos de salida**.
*   **Cálculo de Costo en Hobby:** **Costo $0** (Dentro del límite de 100 GB gratuitos).
*   **Costo Proyección en Pro:** **Costo $0** (Dentro del límite de 1 TB incluido en Pro).

### C. Conclusión del Diagnóstico Financiero
Nuestra aplicación de hospitalidad e inventario "Beach Core PMS" está altamente optimizada y desacoplada de procesos pesados de disco. **El hotel puede operar el 100% de sus transacciones, reservas y sincronizaciones en el Plan Hobby de Vercel de forma gratuita (Costo $0)**, ya que el volumen de uso real en invocaciones y ancho de banda se mantiene por debajo de los umbrales de facturación.

---

