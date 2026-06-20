# Manifiesto de Convenciones de Integración con FNRH Digital (Brasil / MTur)
> Estandarización de la gobernanza de datos identitarios de huéspedes, flujos de check-in y auditoría de accesos síncronos bajo la Portaria MTur nº 41/2025 y la LGPD (Lei Geral de Proteção de Dados).

Este documento rige la estructura de mapeo, persistencia y despacho automatizado de los datos de pasajeros hacia la plataforma unificada de la FNRH Digital desarrollada por el SERPRO (Serviço Federal de Processamento de Dados), asegurando el cumplimiento legal ineludible de la operación hoteleira en Brasil.

---

## 1. Contexto Legal y Obligatoriedad (Compliance)

*   **Marco Regulatorio:** Portaria MTur nº 41 de 14 de noviembre de 2025. El plazo nacional de adecuación obligatoria expiró el **20 de abril de 2026**. Todo registro físico de pasajeros ha quedado desprovisto de validez legal.
*   **Requisito de Entrada (CADASTUR):** El establecimiento hoteleiro (inquilino / propiedad) debe mantener un registro regularizado y activo en el Cadastur.
*   **Identificación del Operador (Auditoría LGPD):** En cumplimiento de la LGPD, toda consulta o inserción en la base de datos de la FNRH debe registrar de forma síncrona el $\text{CPF}$ (catastrado como una cadena de 11 dígitos numéricos $\text{VARCHAR}(11)$) del recepcionista u operador que ejecuta la transacción.

---

## 2. Topología del Esquema de Datos Requerido por FNRH

Para alimentar síncronamente los payloads de la API del SERPRO, las tablas `guests` (huésped principal) y `booking_companions` (acompañantes) deben mapear sus columnas de forma exacta a los siguientes tipos contractuales:

| Atributo FNRH API | Columna Relacional PMS | Tipo de Datos | Validación / Estándar |
| :--- | :--- | :--- | :--- |
| `nome_completo` | Concatenación de nombres | `TEXT` | Reconstruido mediante algoritmo de capitalización inteligente. |
| `documento_tipo` | `document_type` | `VARCHAR(20)` | `PASSPORT` \| `RG` \| `CPF` \| `DNI` |
| `documento_numero` | `document_number` | `VARCHAR(30)` | Alfanumérico limpio de espacios y guiones. |
| `celular` | `phone_whatsapp` | `VARCHAR(20)` | Formato internacional estricto **E.164**. |
| `email` | `email` / `user_email` | `TEXT` | Dirección de correo válida (LOWER). |
| `origem_pais` | `country_code` | `VARCHAR(2)` | Código de país estándar **ISO 3166-1 alpha-2**. |
| `origem_cidade` | `city` | `TEXT` | Ciudad residencial de origen (LOWER). |
| `destino_pais` | `next_country_code` | `VARCHAR(2)` | Código de país de próximo destino (ISO alpha-2). |
| `destino_cidade` | `next_city` | `TEXT` | Próxima ciudad de destino (LOWER). |
| `motivo_viagem` | `travel_reason` | `VARCHAR(30)` | `tourism` \| `business` \| `event` \| `health` \| `study` |
| `meio_transporte` | `transport_mode` | `VARCHAR(30)` | `plane` \| `car` \| `bus` \| `boat` \| `train` \| `other` |

---

## 3. Arquitectura de Integración de APIs (SERPRO / MTur REST Spec)

La comunicación entre nuestro PMS y la pasarela FNRH Digital se realiza de forma segura mediante HTTPS utilizando tokens de autenticación de larga duración (Bearer Token o API-Key generada en el portal oficial).

### A. Cabeceras de Seguridad y Auditoría (Headers)
Toda llamada hacia los endpoints del gobierno debe inyectar el token del hotel y el $\text{CPF}$ del funcionario que realiza la acción en recepción para auditoría de accesos:

```http
POST /FNRH_API/rest/v1/pessoas
Authorization: Bearer <pms_token_oauth2>
cpf_solicitante: 01234567890
Content-Type: application/json; charset=utf-8
```

B. Flujo de Transacciones del Ciclo de Vida del Huésped

[ CHECK-IN / REGISTRO ]
       │
       ├── 1. POST /pessoas ──────► Registra datos demográficos del pasajero.
       │                            Retorna: 'pessoa_id' (UUID)
       │
       └── 2. POST /hospedes ─────► Vincula 'pessoa_id' al cuarto y reserva.
                                    Retorna: 'hospede_id' (UUID de control estatal)
[ CHECK-OUT / SALIDA ]
       │
       └── PATCH /v2/hospedes/{hospede_id}/checkout ──► Finaliza estadía con fecha/hora UTC.

Registro de Identidad (POST /pessoas): Envía la información demográfica del huésped y de cada acompañante de forma individual. El servidor de SERPRO valida y devuelve un pessoa_id único.
Apertura de Estancia (POST /hospedes): Crea el registro de hospedaje activo en el hotel asociando el pessoa_id, número de habitación, fecha y hora de check-in. Devuelve el hospede_id.

Cierre de Estancia (PATCH /v2/hospedes/{hospede_id}/checkout): Al realizar el Check-Out en el PMS, se dispara esta petición síncrona enviando el sello temporal en formato ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ), actualizando el estado de la ficha a finalizado.
Registro de No-Presentación (PATCH /v2/hospedes/{hospede_id}/noshow): Si el huésped no se presenta, se envía esta petición para cambiar el estatus a noshow de forma reglamentaria.

## 4. Estructura de Resiliencia y Monitoreo de Sincronización
Latencia Objetivo: Toda llamada hacia la API de FNRH debe resolverse de forma asíncrona mediante colas de fondo, con una latencia transaccional ideal de latency <1000 ms para no bloquear el hilo de ejecución de la recepción.
Auditoría de Errores: En caso de que el validador del gobierno rechace la ficha por campos inválidos, el error se capturará y se registrará de forma estructurada en la tabla ota_sync_logs (o fnrh_sync_logs), permitiendo al recepcionista corregir el campo y re-intentar el envío con un solo clic desde el panel de control.

---

## 5. Gobernanza de Sesión de Operador (RBAC Audit) y Flujo del Check-In

Para cumplir con las auditorías de trazabilidad de la Policía Federal (FNRH) y prevenir accesos no autorizados al momento de realizar transacciones físicas de ingreso, se establece el siguiente estándar de persistencia y flujo:

### A. Trazabilidad del Operador de Guardia (Staff Session Link)
*   **Aislamiento de Firma:** El sistema prohíbe realizar un Check-In síncrono si no se cuenta con un identificador de operador activo en la sesión.
*   **Captura de Auditoría:** Al procesar un ingreso, el PMS extraerá el `auth.uid()` del recepcionista desde el JWT cifrado y registrará de forma inmutable su rol y nombre corporativo (`sender_name`) en el campo `sender_id` de la transacción, permitiendo auditar la autoría de cada alocación física.

### B. Flujo del Check-In Digital (Walk-In / OTA Dispatch)

Al momento de realizar el ingreso de un pasajero a una habitación física, el PMS ejecutará un algoritmo de tres pasos para garantizar la consistencia del inventario:

```text
       [ RECEPCIONISTA INICIA CHECK-IN ] 
                       │
                       ▼
       [ Validar Estatus de Limpieza (Rooms) ]
         • Verifica que housekeeping_status = 'clean'
         • Si es 'dirty' o 'cleaning' $\rightarrow$ Alerta y bloquea el paso.
                       │
                       ▼
       [ Asignación Heurística de Habitación ]
         • Se asocia un room_id (físico) libre a la reserva.
         • Se actualiza el estado de la habitación a 'occupied'.
                       │
                       ▼
       [ Hidratación FNRH (booking_companions) ]
         • Registro síncrono de documentos de identidad de acompañantes.
         • Dispatch de metadatos de origen (atribución de canal).

C. Desacoplamiento de Fichas de Consumos (Restaurant / Bar Folio)
Las comandas de alimentos y bebidas se registrarán con su respectivo booking_id en las tablas restaurant_orders y bar_orders.
Si una comanda se carga como "cargo a la habitación", la consulta validará síncronamente que el estado de la reserva asociada en bookings sea estrictamente checked_in, bloqueando cargos automáticos a reservas que ya se encuentren en estado checked_out o cancelled para mitigar mermas financieras.

```

---

