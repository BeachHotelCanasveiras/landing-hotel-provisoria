# Manifiesto de Convenciones de Direcciones Postales y Geolocalización (SaaS Multi-Tenant)
> Estandarización de gobernanza de datos residenciales para la integración sin fricciones con Google Maps API y pasarelas de pago (Stripe / Mercado Pago).

Este documento rige la estructura de almacenamiento de direcciones físicas en todas las tablas del ecosistema (Huéspedes, Personal, Agencias, Proveedores e Inquilinos), garantizando la paridad con la especificación de componentes de dirección de la API de Google y aislando los ámbitos residenciales de los laborales.

---

## 1. Estructura Dual de Direcciones (Personal vs. Laboral)

Para cumplir con las regulaciones de tratamiento de datos y permitir una visualización segmentada en pestañas independientes, se separan los ámbitos residenciales en dos estructuras:

### A. Domicilio Particular (Residencial - Atributos Base)
*   Representa la residencia permanente del huésped o funcionario.
*   Es la base de validación tributaria y de identidad.

### B. Domicilio Laboral (Comercial - Atributos Opcionales)
*   Representa el lugar de trabajo del huésped o funcionario.
*   Se almacena en columnas independientes con el prefijo `work_` y es **100% anulable (nullable)**. Si la pestaña laboral no es completada por el usuario, todos los campos correspondientes persistirán como `NULL`.

---

## 2. Topología del Esquema de Datos (Database Schema)

| Nombre de Columna (Residencial) | Nombre de Columna (Laboral) | Tipo de Datos | Restricción | Componente Google Maps |
| :--- | :--- | :--- | :--- | :--- |
| `street` | `work_street` | `TEXT` | NOT NULL (Res.) / NULL (Lab.) | `route` |
| `number` | `work_number` | `VARCHAR(15)` | NOT NULL (Res.) / NULL (Lab.) | `street_number` |
| `apartment` | `work_apartment` | `VARCHAR(15)` | NULL | `subpremise` |
| `neighborhood` | `work_neighborhood` | `TEXT` | NULL | `sublocality_level_1` |
| `city` | `work_city` | `TEXT` | NOT NULL (Res.) / NULL (Lab.) | `locality` |
| `state_province` | `work_state_province` | `VARCHAR(50)` | NOT NULL (Res.) / NULL (Lab.) | `administrative_area_level_1` |
| `country_code` | `work_country_code` | `VARCHAR(2)` | NOT NULL (Res.) / NULL (Lab.) | `country` |
| `postal_code` | `work_postal_code` | `VARCHAR(15)` | NULL | `postal_code` |
| `latitude` | `work_latitude` | `DECIMAL(10, 8)` | NULL | `geometry.location.lat` |
| `longitude` | `work_longitude` | `DECIMAL(11, 8)` | NULL | `geometry.location.lng` |

---

## 3. Convenciones de Normalización y Almacenamiento (Lowercase SSoT)

1.  **Gobernanza de Minúsculas:** 
    Toda entrada alfanumérica (`street`, `city`, `neighborhood`, `postal_code`, y sus contrapartes `work_`) se guardará estrictamente en **minúsculas** en la base de datos física para optimizar la velocidad de búsqueda de índices y mitigar la fricción de colación. La capa de interfaz de usuario aplicará la capitalización (*Title Case*) al momento de renderizar.
2.  **Sanitización de Códigos Postales:**
    Los códigos postales se almacenarán desprovistos de caracteres especiales, guiones o espacios (ej: `88054010` en lugar de `88054-010`).

---

## 4. Algoritmo de Capitalización Inteligente en Recobro (Restore & Format)

Cuando los aparatos o componentes de visualización consuman los datos de la base de datos, deberán aplicar un algoritmo de capitalización inteligente antes de renderizar la información, garantizando una correcta ortografía mediante la exclusión de preposiciones:

1.  **Tratamiento de Siglas y Códigos:**
    *   Los campos `country_code`, `work_country_code` y las provincias/estados que utilicen códigos ISO se convertirán íntegramente a mayúsculas sostenidas mediante la función $\text{UPPER()}$ (ej: `br` $\rightarrow$ `BR`, `sc` $\rightarrow$ `SC`).
2.  **Title Case con Exclusión de Preposiciones (Stop Words):**
    *   Se capitalizará la primera letra de cada palabra del string, **exceptuando** las preposiciones y conectores gramaticales de los idiomas soportados (portugués, español, inglés) que no inicien la oración.
    *   *Preposiciones excluidas:* `de`, `do`, `da`, `dos`, `das`, `e`, `y`, `of`, `the`, `in`.
    *   *Ejemplo de Entrada en DB:* `avenida das nações` $\rightarrow$ *Salida Renderizada:* `Avenida das Nações`.
    *   *Ejemplo de Entrada en DB:* `rio de janeiro` $\rightarrow$ *Salida Renderizada:* `Rio de Janeiro`.

---

## 5. Algoritmo de Concatenación Segura y Control de Separadores

Para evitar inconsistencias de espaciado o puntuaciones huérfanas al imprimir comprobantes o renderizar la dirección de forma unificada (ej: cuando `apartment` o `neighborhood` son nulos), la concatenación física debe ser resuelta mediante lógica condicional:

```typescript
// Algoritmo de formateo adaptativo del cliente
function formatAddress(addr: AddressRecord): string {
  const streetName = capitalizeTitleCase(addr.street);
  const houseNumber = addr.number;
  const apt = addr.apartment ? `, ${capitalizeTitleCase(addr.apartment)}` : '';
  const block = addr.neighborhood ? ` - ${capitalizeTitleCase(addr.neighborhood)}` : '';
  const cityName = capitalizeTitleCase(addr.city);
  const stateCode = addr.state_province.toUpperCase();
  const zip = addr.postal_code ? `, ${addr.postal_code}` : '';
  const country = addr.country_code.toUpperCase();

  // Resultado limpio de dobles comas o guiones huérfanos
  return `${streetName} ${houseNumber}${apt}${block}, ${cityName} - ${stateCode}${zip}, ${country}`;
}
6. Estándar de Exportabilidad y Consumo Externo (Export Patterns)
Para permitir que los datos residenciales sean consumidos por bases de datos externas, agencias de turismo gubernamentales o sistemas de facturación fiscal, la API proveerá las direcciones bajo tres formatos de salida unificados:
A. Formato JSON Anidado (Estándar Google/Stripe)
code
JSON
{
  "personal_address": {
    "line1": "Avenida das Nações, 375",
    "line2": "Apto 101",
    "neighborhood": "Canasvieiras",
    "city": "Florianópolis",
    "state": "SC",
    "postal_code": "88054010",
    "country": "BR",
    "coordinates": {
      "latitude": -27.426244,
      "longitude": -48.455212
    }
  },
  "work_address": null
}
B. Formato de Texto Plano Unificado (Concatenated String)
Generado a través del algoritmo de concatenación segura de la sección 5:
Avenida das Nações 375, Apto 101 - Canasvieiras, Florianópolis - SC, 88054010, BR
C. Formato Plano CSV (Flat Database Pattern)
Nomenclatura unificada para la migración e importación masiva de bases de datos:
street,number,apartment,neighborhood,city,state_province,country_code,postal_code,latitude,longitude,work_street,work_number,work_apartment,work_neighborhood,work_city,work_state_province,work_country_code,work_postal_code,work_latitude,work_longitude
7. Lógica de Conversión e Interfaz de País (ISO 3166-1 alpha-2)
Mapeo Localizado de Países:
code
JSON
{
  "BR": { "es": "Brasil", "pt": "Brasil", "en": "Brazil" },
  "AR": { "es": "Argentina", "pt": "Argentina", "en": "Argentina" },
  "CL": { "es": "Chile", "pt": "Chile", "en": "Chile" },
  "UY": { "es": "Uruguay", "pt": "Uruguay", "en": "Uruguay" },
  "PY": { "es": "Paraguay", "pt": "Paraguay", "en": "Paraguay" },
  "PE": { "es": "Perú", "pt": "Peru", "en": "Peru" },
  "CO": { "es": "Colombia", "pt": "Colômbia", "en": "Colombia" }
}
Predeterminación y Ordenamiento: El selector se inicializa en BR (Brasil). Los países de Sudamérica se ordenan alfabéticamente al principio de la lista para evitar fatiga de scroll.
8. Integración JIT con Google Places y Fallback por Nulidad
Captura del Autocomplete: Se asignan los valores de address_components directamente al esquema desglosado de la sección 2.
Mitigación de Crasheos por Nulidad:
Si los campos de coordenadas geográficas (latitude, longitude) persisten como NULL (debido a fallas del API de geocodificación o entradas manuales), la aplicación frontend del cliente prohíbe de forma síncrona la renderización dinámica de mapas interactivos o de marcadores para ese registro específico.
Fallback de contingencia: Se sustituirá el mapa dinámico por un enlace plano de hipertexto que redirige de forma externa al usuario hacia la consulta de búsqueda de Google Maps basada en la dirección de texto plano concatenado:
https://www.google.com/maps/search/?api=1&query=[Dirección_Texto_Plano]
Esto garantiza tolerancia total a fallos, velocidad de carga instantánea O(1) en caso de coordenadas ausentes y protección frente a consumo ocioso de créditos de Google Cloud.


---

