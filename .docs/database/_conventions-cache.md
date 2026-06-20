Diagnóstico de la Arquitectura de Caché y Optimización de Recursos
Al auditar la base de código del snapshot, se confirma que la aplicación implementa actualmente una estrategia de caché híbrida y defensiva de tres niveles (TanStack Query, LocalStorage con TTL y Cookies Encriptadas). Esta arquitectura está diseñada específicamente para mitigar el consumo de cuotas, el ancho de banda y la latencia de red, protegiendo las capas gratuitas (Free Tiers) de Supabase y reduciendo a cero el costo de APIs facturables de alta fricción (como Google Places API y Stripe).
A continuación, se presenta la evaluación del estado actual de la caché, el análisis de rendimiento matemático de su impacto y las áreas de optimización para blindar el consumo de recursos.
1. Auditoría del Estado de Caché Actual (¿Cómo está implementado?)
El sistema maneja la persistencia temporal en los siguientes componentes clave:
A. Capa de Protección de API de Terceros (Google Places)
Implementación: En client/src/components/Testimonials.tsx se invoca la API de Google Places para extraer las reseñas reales del hotel.
Estrategia de Caché: Consume StorageService.getLocalWithTTL de storage.ts utilizando una constante de tiempo de vida:
TTL
Reviews
=
7
 d
ı
ˊ
as
=
604,800
 segundos
TTL 
Reviews
​
 =7 d 
ı
ˊ
 as=604,800 segundos
Impacto: Evita invocar el SDK de Google Places en cada carga de página. La consulta se resuelve de forma local en tiempo constante 
O
(
1
)
O(1)
 desde el almacenamiento del cliente, renovándose únicamente una vez transcurridos los 7 días.
B. Capa de Base de Datos (Supabase Query Caching)
Implementación: En client/src/App.tsx y useBlockedDates.ts se configura TanStack Query (React Query v5) como el gestor de estado de red.
Estrategia de Caché:
Global: El QueryClient está parametrizado con un staleTime global de 5 minutos (
300
 s
300 s
) y refetchOnWindowFocus: false.
Fechas Bloqueadas: El hook useBlockedDates eleva el staleTime a 10 minutos (
600
 s
600 s
).
Impacto: El calendario no consulta a Supabase cada vez que el usuario interactúa con la interfaz de reserva o cambia de pestaña. Los datos se consideran "frescos" durante el intervalo de tiempo establecido, reduciendo drásticamente las peticiones de lectura (
Q
Q
) a la base de datos de PostgreSQL.
C. Capa Transaccional de Contingencia (Stripe Session Fallback)
Implementación: En api/checkout/session.ts y retrieve.ts.
Estrategia de Caché: Serializa, encripta mediante AES-256-GCM y almacena el estado de la reserva en la cookie HttpOnly beach_checkout_intent por 30 minutos.
Impacto: Si la API de Stripe sufre latencia o caídas al retornar a /success, el PMS recupera la reserva descifrando la cookie local de forma segura, evitando golpear repetidamente la API de Stripe para reconstruir la UI.

2. Oportunidades de Optimización y Saneamiento
Para elevar el estándar del manejo de la caché del PMS al nivel máximo de eficiencia, podemos implementar tres mejoras no intrusivas:

A. Almacenamiento en Memoria Intermedia (Edge Cache Headers) en las APIs de Lectura
Actualmente, los endpoints serverless de Vercel en la carpeta api/ (como los exportadores iCal y sincronizadores) no le indican a la red que almacenen en caché sus respuestas. Podemos inyectar la cabecera Cache-Control en las lecturas de los calendarios públicos para que la CDN de Vercel (Edge Network) sirva el archivo iCal sin consultar la base de datos de Supabase en cada petición de las OTAs:

TypeScript
// Sugerencia para api/ota/export.ts
res.setHeader(
  'Cache-Control',
  'public, max-age=60, s-maxage=900, stale-while-revalidate=60'
);

Lógica: Las OTAs (Booking, Airbnb) leerán la disponibilidad desde el nodo Edge de Vercel más cercano. La caché se considera fresca en la CDN por 15 minutos (s-maxage=900), reduciendo las consultas síncronas a la base de datos de Supabase a una sola vez cada cuarto de hora por canal.

B. Invocación Selectiva de Invalidación en Mutaciones (TanStack Query)
El PMS utiliza mutaciones de TanStack Query para realizar acciones. Para garantizar que los datos estén frescos únicamente cuando ocurren cambios (optimizando las lecturas), confirmamos la validez de nuestro patrón en AdminDashboard.tsx:
Al realizar un Check-In o Check-Out, se llama a invalidateQueries({ queryKey: ['bookings'] }) e invalidateQueries({ queryKey: ['rooms'] }).
Esto asegura que el PMS solo consuma recursos de lectura de Supabase de manera reactiva tras una escritura exitosa, manteniendo el estado de caché intacto durante la navegación pasiva del recepcionista.

C. Almacenamiento en Caché de Activos Multimedia (Cloudinary CDN)
Las imágenes del hotel se sirven desde Cloudinary. Al utilizar las transformaciones dinámicas de la CDN (f_auto, q_auto), las imágenes ya heredan cabeceras Cache-Control inmutables de un año, lo que previene que los navegadores consuman ancho de banda del servidor del hotel de forma redundante.

---

