# Manifiesto de Convenciones de Amenities de Propiedad (SaaS Multi-Tenant)
> Estandarización y mapeo de instalaciones a nivel de hotel basados en los parámetros de carga de Booking.com, Airbnb, Expedia y Despegar.com para optimizar el posicionamiento B2C.

Este documento rige la estructura de base de datos, el mapeo de registros `jsonb` y el comportamiento de la interfaz de usuario para las comodidades y servicios globales del hotel (Inquilino/Tenant). Garantiza la sincronización de las características del establecimiento con los motores de búsqueda de las OTAs.

---

## 1. Mapeo de Amenities de Propiedad por OTA (Property Level)

Para evitar la discrepancia en la transmisión de datos, clasificamos las instalaciones críticas que las OTAs evalúan para otorgar estrellas o destacar propiedades en sus filtros de búsqueda:

| Código Interno | Booking.com (v3.2) | Airbnb (Core) | Expedia (L0) | Despegar / Decolar | Categoría |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `has_restaurant`| `restaurant` | `Kitchen / Dining`| `Restaurant` | `Restaurante` | Alimentos y Bebidas |
| `has_bar` | `bar` | `Bar` | `Bar` | `Bar` | Alimentos y Bebidas |
| `has_cafe` | `coffee_house` | `Coffee maker` | `Coffee shop` | `Cafeteria` | Alimentos y Bebidas |
| `has_pool` | `swimming_pool` | `Pool` | `Outdoor pool` | `Piscina` | Recreación |
| `has_reception_24`| `24_hour_front_desk` | `Self check-in` | `24-hour front desk`| `Recepção 24h` | Seguridad y Acceso |
| `has_smart_lock`| `key_card_access` | `Smart lock` | `Smart lock` | `Fechadura digital` | Seguridad y Acceso |
| `has_parking_free`| `free_private_parking`| `Free parking` | `Free self parking` | `Estacionamento grátis`| Movilidad |
| `has_parking_paid`| `paid_private_parking`| `Paid parking` | `Paid self parking` | `Estacionamento pago` | Movilidad |
| `has_ev_charger` | `electric_vehicle_station`| `EV charger` | `EV charging station`| `Carga de carro elétrico`| Sostenibilidad |
| `has_elevator` | `elevator` | `Elevator` | `Elevator` | `Elevador` | Accesibilidad |
| `has_gym` | `fitness_center` | `Gym` | `Fitness center` | `Academia` | Bienestar |

---

## 2. Estructura de Datos y Persistencia (Database Schema)

El estado físico de los servicios generales del hotel se almacena en la tabla maestra de configuración del inquilino (`tenants`), encapsulado en una columna estructurada de tipo `JSONB` para permitir una evolución ágil sin alterar el esquema plano de Postgres:

*   **Columna `property_amenities` (`jsonb`):** Almacena un mapa de claves booleanas indexadas en texto.
    *   *Formato físico:*
        ```json
        {
          "has_restaurant": true,
          "has_bar": true,
          "has_cafe": true,
          "has_pool": true,
          "has_reception_24": true,
          "has_smart_lock": true,
          "has_parking_free": false,
          "has_parking_paid": true,
          "has_ev_charger": false,
          "has_elevator": true,
          "has_gym": false
        }
        ```
*   **Índice de Búsqueda Concurrente GIN:** Para agilizar el filtrado de hoteles por amenities (en el caso de consultas multi-hotel en consorcios o marcas blancas), se define un índice GIN sobre la columna estructurada:

    $$\text{CREATE INDEX idx\_tenants\_amenities ON public.tenants USING GIN (property\_amenities)}$$

---

## 3. Lógica de Integración JIT y Fallbacks por Categoría

1.  **Frontera de Configuración:** Al registrar un nuevo hotel inquilino, el sistema inicializa el mapa de amenities con valores `false` por defecto, permitiendo al administrador encender o apagar las instalaciones activas desde la pestaña de configuraciones generales.
2.  **Mapeo de Coordenadas de Estacionamiento:** Si `has_parking_free` o `has_parking_paid` están activos, el PMS requerirá opcionalmente guardar las coordenadas del parking utilizando el tipo de dato decimal $\text{DECIMAL}(10, 8)$ para latitud y $\text{DECIMAL}(11, 8)$ para longitud, facilitando instrucciones precisas por WhatsApp para huéspedes que viajan en coche.
3.  **Higiene y Control de Estado de Cerraduras Inteligentes:** Si `has_smart_lock` está activo, las asignaciones de Check-In del PMS dispararán llamadas de red automatizadas para emitir llaves virtuales basadas en el periodo inmutable de la reserva, deshabilitando el código de acceso al momento exacto del Check-Out.

---

