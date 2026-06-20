# Manifiesto de Convenciones de Nombres Personales (SaaS Multi-Tenant)
> Estandarización de la gobernanza, persistencia y renderizado de identidades bajo normas internacionales de interoperabilidad (OACI Doc 9303 / ISO 7812).

Este documento rige la estructura de almacenamiento y visualización de nombres de personas naturales en todas las tablas de la base de datos (Huéspedes, Acompañantes y Personal Operativo), garantizando consistencia, indexación veloz y la eliminación total de discrepancias ortográficas.

---

## 1. Topología del Esquema de Nombres (Database Schema)

Toda tabla que registre la identidad de una persona física deberá desglosar el nombre de forma atómica en las siguientes columnas de base de datos:

| Nombre de Columna | Tipo de Datos | Restricción | Propósito / Formato |
| :--- | :--- | :--- | :--- |
| `first_name` | `VARCHAR(50)` | NOT NULL | Primer nombre de la persona (en minúsculas). |
| `middle_name` | `VARCHAR(50)` | NULL | Segundos nombres o nombres compuestos (en minúsculas). |
| `paternal_last_name`| `VARCHAR(50)` | NOT NULL | Apellido paterno principal (en minúsculas). |
| `maternal_last_name`| `VARCHAR(50)` | NULL | Apellido materno (en minúsculas). |

*Nota: Esta estructura atómica de 4 campos garantiza la compatibilidad nativa con la zona de lectura mecánica (MRZ) de pasaportes bajo el estándar internacional **OACI Doc 9303**.*

---

## 2. Regla de Almacenamiento en Minúsculas (Lowercase SSoT)

1.  **Persistencia en Disco:** 
    Todos los campos de nombres (`first_name`, `middle_name`, `paternal_last_name`, `maternal_last_name`) se guardarán estrictamente en **minúsculas** en la base de datos física.
2.  **Mitigación de Colación:**
    Esto elimina la sensibilidad a mayúsculas y minúsculas (*case-sensitivity*) al realizar búsquedas textuales o indexaciones en PostgreSQL. Toda consulta de búsqueda de huéspedes se ejecutará en tiempo constante $\mathcal{O}(1)$ o logarítmico $\mathcal{O}(\log N)$ sobre índices planos, sin la sobrecarga de funciones de transformación en tiempo de ejecución como `LOWER()`.
3.  **Sanitización de Caracteres Especiales:**
    Los nombres se almacenarán conservando sus tildes y diacríticos nativos (ej: `gonçalves`, `román`) en formato **UTF-8**, pero se desinfectarán preventivamente de caracteres de control, números o símbolos especiales.

---

## 3. Algoritmo de Capitalización Inteligente en Recobro (Restore & Format)

Cuando el cliente (frontend), los componentes de la interfaz de usuario o los motores de exportación de reportes consuman los datos residenciales de la base de datos, deberán reconstruir la capitalización ortográfica correcta mediante la aplicación síncrona del siguiente algoritmo:

### A. Algoritmo de Capitalización de Campo Individual
1.  Se divide el string del campo en palabras utilizando el espacio en blanco como separador.
2.  Se capitaliza la primera letra de cada palabra (ej: `pedro` $\rightarrow$ `Pedro`).
3.  Se exceptúan de la capitalización los conectores de apellidos y preposiciones cuando no inicien la palabra:
    *   *Conectores excluidos:* `de`, `del`, `la`, `las`, `y`, `e`, `dos`, `da`, `do`, `das`, `von`, `van`.
    *   *Ejemplo:* `martínez de la rosa` $\rightarrow$ `Martínez de la Rosa`.

### B. Algoritmo de Concatenación Segura (Failsafe Concatenation)
Para evitar la renderización de espacios en blanco duplicados o comas huérfanas al concatenar nombres donde el segundo nombre o el apellido materno sean nulos (`NULL`), los aparatos de visualización utilizarán la siguiente lógica de renderizado condicional:

```typescript
// Algoritmo de reconstrucción e interpolación de identidades
function formatFullName(
  firstName: string,
  middleName: string | null,
  paternalLastName: string,
  maternalLastName: string | null
): string {
  const first = capitalizeNameField(firstName);
  const middle = middleName ? ` ${capitalizeNameField(middleName)}` : '';
  const paternal = capitalizeNameField(paternalLastName);
  const maternal = maternalLastName ? ` ${capitalizeNameField(maternalLastName)}` : '';

  // Resultado limpio de dobles espacios o valores vacíos interpolados
  return `${first}${middle} ${paternal}${maternal}`.trim();
}
```

4. Estándar de Interoperabilidad (Formatos de Exportación)
Al transferir información del personal o huéspedes hacia integraciones externas (contabilidad, auditoría, migración), los nombres se formatearán bajo las siguientes estructuras:
Formato de Registro Policial (FNRH/SENASP):
paternal_last_name.toUpperCase(), first_name.toUpperCase()
Ejemplo: MARTINEZ, Pedro
Formato de Base de Datos Plana (CSV/TSV):
first_name,middle_name,paternal_last_name,maternal_last_name
Ejemplo: pedro,jose,martinez,silva