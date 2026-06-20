# Manifiesto de Convenciones de Amenities de Habitaciones (SaaS Multi-Tenant)
> Estandarización y mapeo de comodidades de habitación basadas en las especificaciones de Booking.com, Airbnb, Expedia y Despegar.com para distribución libre de fricción.

Este documento rige la estructura de base de datos, mapeo JSON e interfaz de usuario para configurar las comodidades internas de las habitaciones físicas. Permite una paridad de inventario directa con los canales de venta externos y define la lógica de aprovisionamiento por lotes.

---

## 1. Mapeo de Amenities por OTA (Frontera de Distribución)

Para garantizar que los amenities guardados en la base de datos coincidan con las taxonomías de los canales de venta externos, mapeamos las especificaciones más populares de cada OTA en un catálogo unificado:

| Código Interno | Booking.com (v3.2) | Airbnb (Core) | Expedia (L0) | Despegar / Decolar | Categoría Operativa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `has_ac` | `air_conditioning` | `Air conditioning` | `Air conditioning` | `Ar condicionado` | Climatización |
| `has_wifi` | `free_wifi` | `Wifi` | `Free WiFi` | `Wi-Fi no quarto` | Conectividad |
| `has_minibar` | `minibar` | `Refrigerator` | `Minibar` | `Frigobar` | Alimentos y Bebidas |
| `has_tv` | `flat_screen_tv` | `TV` | `Flat-screen TV` | `TV por cabo` | Entretenimiento |
| `has_bathtub` | `bathtub` | `Bathtub` | `Private bathtub` | `Banheira` | Higiene |
| `has_balcony` | `balcony` | `Balcony` | `Balcony` | `Varanda` | Vistas y Exteriores |
| `has_ocean_view`| `ocean_view` | `Waterfront` | `Ocean view` | `Vista para o mar` | Vistas y Exteriores |
| `has_safe` | `safety_deposit_box` | `Laptop-friendly safe`| `In-room safe` | `Cofre de segurança` | Seguridad |
| `has_hairdryer` | `hairdryer` | `Hair dryer` | `Hair dryer` | `Secador de cabelo` | Higiene |
| `has_coffee` | `tea_coffee_maker` | `Coffee maker` | `Coffee/tea maker` | `Cafeteira` | Alimentos y Bebidas |
| `double_beds` | `double_bed` | `Double bed` | `Double bed` | `Cama de casal` | Capacidad / Camas |
| `single_beds` | `single_bed` | `Single bed` | `Twin bed` | `Cama de solteiro` | Capacidad / Camas |

---
## 2. Estructura de Datos y Persistencia (Database Schema)

En lugar de almacenar múltiples columnas booleanas independientes que harían rígida la base de datos ante nuevos canales, se implementa una topología híbrida en la tabla `room_amenities`:

*   **Atributos Dinámicos (`jsonb`):** Los amenities binarios o cliqueables se guardan dentro de una columna indexada de tipo `JSONB` llamada `amenities_map`.
*   *Formato físico:* `{"has_ac": true, "has_wifi": true, "has_minibar": false}`
*   **Atributos Métricos:** Los datos de capacidad o dimensiones físicas que restringen el motor de reservas se persisten en columnas numéricas para indexaciones de rango rápido:
    *   `double_beds_count` ($\text{INTEGER}$): Rango $[0, 5]$.
    *   `single_beds_count` ($\text{INTEGER}$): Rango $[0, 10]$.
    *   `max_guests` ($\text{INTEGER}$): Capacidad máxima de ocupación calculada mediante la constante:  
        $$\text{max\_guests} = (2 \times \text{double\_beds\_count}) + (1 \times \text{single\_beds\_count})$$

---

## 3. Paquete Base de Aprovisionamiento (Standard Room Bundle)

Para simplificar la creación de nuevas habitaciones físicas en el PMS (SaaS-Ready), se define un paquete estándar de comodidades básicas que se inyectará de forma automática al registrar una habitación, reduciendo la entrada manual de datos:

```json
{
  "standard_room_bundle": {
    "has_wifi": true,
    "has_ac": true,
    "has_tv": true,
    "has_safe": true,
    "has_minibar": true,
    "has_hairdryer": true,
    "has_bathtub": false,
    "has_balcony": false,
    "has_ocean_view": false,
    "has_coffee": false
  }
}
```
Flujo del Formulario (UX): Al agregar una habitación en la pestaña RoomManagement.tsx, el sistema aplica por defecto este set de variables en estado activo. El recepcionista o administrador solo deberá desmarcar o añadir aquellas comodidades específicas de la suite.
4. Estándar de Interfaz Gráfica (SaaS Clickable UI)
Píldoras Interactivas (Toggles): Los amenities se renderizan en el panel de control como botones o píldoras con un fondo translúcido y su icono de Lucide correspondiente.

Interactividad: Al hacer clic, el valor conmuta de forma asíncrona entre {0,1} (o true y false), guardando de forma atómica en base de datos.
Visualización en la Landing Page: En la web pública (Rooms.tsx), solo se listan de forma elegante los amenities que tengan valor true, inyectando el micro-icono respectivo según las directivas del manifiesto de diseño.

---

