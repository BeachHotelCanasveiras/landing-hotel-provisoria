# Manifiesto de Convenciones de Metadatos del Huésped (SaaS Multi-Tenant)
> Estandarización de atributos de identidad adicionales, canales de comunicación interactivos y compatibilidad con lectores ópticos de pasaportes bajo la norma OACI Doc 9303.

Este documento rige el diseño de campos, restricciones y validación de los metadatos críticos asociados a un huésped (Documento, Teléfono, Nacionalidad y Fecha de Nacimiento). Está optimizado para permitir la futura integración de un escáner/lector de Zona de Lectura Mecánica (MRZ) en la recepción para acelerar el Check-In sin fricciones.

---

## 1. Mapeo de Atributos Adicionales de Identidad

Toda tabla que registre perfiles físicos (Huéspedes, Acompañantes y Personal) deberá acompañar la convención de nombres con las siguientes columnas de metadatos:

| Nombre de Columna | Tipo de Datos | Restricción | Formato / Estándar | Propósito Operativo |
| :--- | :--- | :--- | :--- | :--- |
| `document_type` | `VARCHAR(20)` | NOT NULL | `passport` \| `rg` \| `cpf` \| `cnh` \| `dni` | Clasificación del documento de viaje. |
| `document_number` | `VARCHAR(30)` | NOT NULL | Alfanumérico limpio | Número identificador del documento. | 

 **telefonos segun convencion adicional**  

| `nationality` | `VARCHAR(2)` | NOT NULL | **ISO 3166-1 alpha-2** | Código de nacionalidad del pasajero. |
| `birth_date` | `DATE` | NOT NULL | **ISO 8601** (`YYYY-MM-DD`) | Fecha de nacimiento para cálculo de edad. |
| `gender` | `VARCHAR(1)` | NULL | `M` \| `F` \| `X` | Género del pasajero (según pasaporte). |

---

## 2. Alineación y Compatibilidad con MRZ (OACI Doc 9303)

Para garantizar que el sistema pueda integrar en el futuro un lector de pasaportes y cédulas de identidad mercosur sin reescribir el esquema de datos, el almacenamiento se alinea con la estructura de la Zona de Lectura Mecánica (MRZ) de Tipo 3 (Pasaportes):

```text
Línea 1 MRZ: P<BRARECO_ALVES<<BERNARDO<<<<<<<<<<<<<<<<<<<
Línea 2 MRZ: FT999999<2BRA8506203M2606206<<<<<<<<<<<<<<06
```

El PMS procesará e hidratará de forma automática las columnas utilizando los siguientes intervalos de caracteres de la Línea 2 del bloque MRZ:

Número de Documento (document_number): Extraído del rango de caracteres [1,9] (ej: FT999999).

Nacionalidad (nationality): Extraído del rango [11,13]  en formato de 3 letras (ISO alpha-3), convertido síncronamente a nuestro estándar de 2 letras de la sección 4 (ej: BRA → BR).

Fecha de Nacimiento (birth_date): Extraído del rango [14,19] en formato YYMMDD (ej: 850620 → 1985-06-20), persistiendo en la columna bajo la norma ISO 8601.
Género (gender): Extraído de la posición [21] (ej: M → Masculino).

## 3. Gobernanza Telefónica y Canal de WhatsApp
Sanitización Dinámica: Al ingresar un número (sea manual o vía API), el PMS depurará caracteres no numéricos, conservando únicamente el prefijo de suma + y los dígitos.

Bandera de Canal Activo (is_whatsapp): Durante el Check-In, el sistema presentará un interruptor de confirmación. Si está activo (true), el motor de mensajería asíncrona habilitará el envío automático de notificaciones de consumo de bar, restaurante y encuestas de satisfacción.

## 4. Control de Minoría de Edad (ECA Compliance)
Cálculo de Edad: Al registrar la fecha de nacimiento (birth_date), el PMS calculará dinámicamente la edad del pasajero al momento del check-in:
Edad= (formula matematica desde el checkin)
Validación de Bloqueo (Estatuto da Criança e do Adolescente - Brasil): Si el cálculo de edad resulta menor a 18 años ( Edad<18 ) y el pasajero se registra sin la compañía de sus tutores en la misma reserva (bookings), el sistema emitirá una alerta crítica en recepción y bloqueará el Check-In síncrono hasta que se cargue la autorización judicial digital correspondiente, cumpliendo con la legislación brasileña.

---


