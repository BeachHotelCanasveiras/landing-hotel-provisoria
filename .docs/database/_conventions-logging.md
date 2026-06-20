# Manifiesto de Convenciones de Registro, Telemetría y Auditoría (SaaS Multi-Tenant)
> Estandarización de la gobernanza de registros de sistema, telemetría de rendimiento y pistas de auditoría transaccional bajo la norma de seguridad ISO 27001 y cumplimiento de la LGPD.

Este documento rige la arquitectura de captura, persistencia y visualización de logs en la plataforma, dividiendo la información en dos capas independientes para optimizar el rendimiento de la base de datos y evitar cargos redundantes de almacenamiento.

---

## 1. Filosofía de Registro Dual (Double-Layer Logging)

Para evitar la saturación de espacio en disco en Supabase, los logs se segregan estrictamente según su volumen de transacciones y necesidades de análisis:

### Capa 1: Telemetría y Rendimiento (Volumen Alto - No Relacional)
*   **Propósito:** Monitorear la salud del servidor, latencias de llamadas API, tiempos de respuesta de base de datos y errores de ejecución.

*   **Destino de Persistencia:** Flujo estándar de salida (`stdout` y `stderr`) en formato JSON estructurado. Vercel captura estos flujos de forma asíncrona y los redirige sin coste de latencia hacia integraciones externas de análisis con planes gratuitos robustos (ej: **Axiom** o **Logflare**).

*   **Regla de Latencia:** Todo endpoint API de lectura debe apuntar a una latencia:
    $$\Delta t_{\text{API}} < 1500 \text{ ms}$$

### Capa 2: Auditoría Transaccional y Seguridad (Volumen Medio/Bajo - Relacional)
*   **Propósito:** Pista de auditoría inmutable de las operaciones de negocio del hotel (quién hizo check-in, cuándo se modificó una tarifa, quién eliminó un funcionario). Exigido para el cumplimiento de las normativas de seguridad de la información **ISO 27001**.

*   **Destino de Persistencia:** Tabla relacional indexada en Supabase (`public.transactional_audits`). Permite que el administrador consulte el histórico de auditoría directamente desde el panel PMS.

---

## 2. Esquema Relacional de Auditoría (Capa 2 Schema)

Toda modificación crítica de datos hoteleiros debe generar una inserción inmutable en la tabla de auditoría, estructurada bajo el siguiente esquema SQL:

```sql
CREATE TABLE IF NOT EXISTS public.transactional_audits (
    -- Identificadores de Seguridad (SaaS Isolation)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Actor (Quién realiza la acción)
    actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    actor_role VARCHAR(30) NOT NULL, -- Ej: 'admin', 'receptionist'
    
    -- Acción Realizada
    action_type VARCHAR(30) NOT NULL, -- Enum: 'check_in', 'check_out', 'rate_change', 'staff_delete'
    entity_type VARCHAR(30) NOT NULL, -- Tabla afectada: 'bookings', 'rooms', 'staff_profiles'
    entity_id VARCHAR(50) NOT NULL, -- ID del registro alterado (UUID o entero)
    
    -- Estado Histórico (Análisis Delta)
    before_state JSONB NULL, -- Estado del registro antes de la modificación
    after_state JSONB NOT NULL, -- Estado del registro después de la modificación
    
    -- Origen de Conexión
    ip_address VARCHAR(45) NOT NULL, -- IPv4 o IPv6 para geolocalización de auditoría
    user_agent TEXT NOT NULL, -- Navegador o dispositivo de origen
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```
-- Habilitar RLS estricto para evitar alteraciones de logs por usuarios comunes ALTER TABLE public.transactional_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_admin_audits ON public.transactional_audits
    FOR SELECT TO authenticated
    USING (public.get_user_role(auth.uid()) IN ('admin', 'developer'));

3. Esquema de Telemetría JSON (Capa 1 Schema)
Los logs dirigidos a stdout se serializarán en caliente en una sola línea de texto utilizando el siguiente esquema estructurado de propiedades:

```JSON
{
  "event": "API_SUCCESS",
  "traceId": "7415c180-8fe8-4c85-875d-e04c7997741a",
  "timestamp": "2026-06-20T16:29:12.887Z",
  "method": "POST",
  "path": "/api/checkout/session",
  "latencyMs": 142.235,
  "status": 200,
  "clientIp": "186.228.45.10"
}
```

4. Control de Redundancia de Almacenamiento (Auto-Purge)
Para asegurar que los logs de la Capa 2 (transactional_audits) no consuman la cuota de disco de la base de datos de forma indefinida:

Historial Activo: El hotel mantendrá acceso en tiempo real a las transacciones de auditoría de los últimos 180 días.

Depuración Automática (Cron Job): Un disparador semanal programado ejecutará la eliminación automática de los registros que superen el límite de retención:

Eliminar Registros←created_at<(now()−180 dias)

---

