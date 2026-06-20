# Manifiesto de Convenciones de Comunicaciones Telefónicas y WhatsApp (SaaS Multi-Tenant)
> Estandarización de la gobernanza de datos telefónicos, validación internacional JIT mediante libphonenumber-js y habilitación omnicanal de WhatsApp Business.

Este documento rige el diseño de base de datos, las reglas de validación en el cliente y el comportamiento de la consola de comunicaciones para el tratamiento de números telefónicos (Huéspedes, Acompañantes, Personal Laboral y Agencias), garantizando un canal de comunicación directo, libre de errores y completamente automatizado.

---

## 1. Estructura Relacional y Atributos (Database Schema)

Para simplificar las transacciones, aislar números secundarios opcionales (tales como teléfonos fijos residenciales o de oficinas) y marcar proactivamente la disponibilidad de WhatsApp, se establece la siguiente topología de columnas:

| Nombre de Columna | Tipo de Datos | Restricción | Propósito / Estándar |
| :--- | :--- | :--- | :--- |
| `phone_country_code` | `VARCHAR(2)` | NOT NULL DEFAULT 'BR' | Código de país estándar **ISO 3166-1 alpha-2** para inicializar el selector en la UI. |
| `phone_number` | `VARCHAR(20)` | NOT NULL | Número de contacto principal en formato estricto **E.164** (solo dígitos con prefijo `+`). |
| `is_whatsapp_active` | `BOOLEAN` | NOT NULL DEFAULT TRUE | Toggle de confirmación. Si es `true`, habilita el envío automatizado en el dashboard. 
|
| `home_phone` | `VARCHAR(20)` | NULL DEFAULT NULL | Teléfono residencial fijo, completamente opcional y anulable. | debe incluir campo ddi_home_phone separado.

| `business_phone` | `VARCHAR(20)` | NULL DEFAULT NULL | Teléfono laboral/oficina, de carácter opcional y anulable. | debe incluir campo ddi_bussiness_phone separado.

---

## 2. Validación Internacional con `libphonenumber-js` (Client-Side)

Para impedir el ingreso de números corruptos o con extensiones insuficientes, el PMS consumirá la biblioteca de código abierto **`libphonenumber-js`** en sus formularios de registro. El algoritmo de validación operará de la siguiente manera:

1.  **Selector de País (Country Picker):** El formulario del PMS inicializará por defecto el selector en `BR` (Brasil), posicionando los códigos sudamericanos en la cabecera.

2.  **Captura y Parseo en Caliente:** Al digitar el número, se procesará junto al código de país seleccionado utilizando el motor de parseo:

```typescript
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface ValidationResult {
  isValid: boolean;
  formattedNumber: string | null;
}

export function validateAndFormatPhoneNumber(
  inputNumber: string, 
  countryCode: string
): ValidationResult {
  const cleanInput = inputNumber.trim();
  // Prepend del prefijo '+' de forma condicional si no se ingresó de forma manual
  const phoneToParse = cleanInput.startsWith('+') ? cleanInput : `+${cleanInput}`;

  const parsedPhone = parsePhoneNumberFromString(phoneToParse, countryCode as any);

  if (parsedPhone && parsedPhone.isValid()) {
    // Retorna el formato internacional estricto E.164 (Ej: +5548998126650)
    return {
      isValid: true,
      formattedNumber: parsedPhone.number // Formato de base de datos plana
    };
  }

  // Si falla, se intenta evaluar omitiendo el '+' para números locales sin DDI
  const localParsed = parsePhoneNumberFromString(cleanInput, countryCode as any);
  if (localParsed && localParsed.isValid()) {
    return {
      isValid: true,
      formattedNumber: localParsed.number
    };
  }

  return {
    isValid: false,
    formattedNumber: null
  };
}

Límite de Caracteres: El validador exige longitudes de dígitos dentro del rango internacional establecido:
Longitud del Numero (excluyendo el +) ∈ [10,15] digitos Longitud del Numero (excluyendo el +)∈[10,15] digitos

3. Integración con el Dashboard de Comunicaciones (WhatsApp Gate)

La combinación de las columnas phone_number e is_whatsapp_active actuará como un activo de comunicación inmediato dentro del PMS de la siguiente forma:

Filtro Activo de Mensajería: Si is_whatsapp_active = true, la consola del recepcionista o el supervisor hoteleiro mostrará una burbuja interactiva de color verde al lado del teléfono del pasajero.

Generación de Enlaces Directos (API Bypass): Al presionar la burbuja, el sistema invocará de forma instantánea el envío de plantillas transaccionales normalizadas (como confirmaciones de check-in, cobros de restaurante o consumos de frigobar) utilizando la ruta de redirección nativa:

URL de WhatsApp←https://wa.me/+phone_number+?text=+encodeURIComponent(plantilla)

Desactivación del Botón: Si el toggle se encuentra inactivo (is_whatsapp_active = false), la burbuja verde se degradará a un color gris opaco y deshabilitará las redirecciones de la API, mitigando rebotes por números fijos u operadores sin soporte de chat.

---

