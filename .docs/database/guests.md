# Especificación de Tabla: `public.guests` (Huéspedes / CRM Master)
> Ficha única relacional de clientes B2C / B2B para la gobernanza de identidades, atribución omnicanal, cumplimiento fiscal, FNRH Digital (SERPRO) y políticas de protección de datos (LGPD).

Esta tabla es la fuente única de verdad (SSoT) para almacenar la información demográfica, residencial, laboral y de atribución de los huéspedes del hotel. Se encuentra completamente desacoplada de la tabla `users` (RBAC) y del personal del hotel (`staff_profiles`).

---

## 1. Declaración de Estructura de Datos (DDL en PostgreSQL)

Todo registro de huésped en el ecosistema debe ser persistido bajo las especificaciones técnicas del siguiente esquema relacional:

```sql
CREATE TABLE IF NOT EXISTS public.guests (
    -- Identificadores y Seguridad SaaS (Multi-Tenancy)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,

    -- Identificación Atómica (Norma OACI Doc 9303 / LOWER SSoT)
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50) NULL,
    paternal_last_name VARCHAR(50) NOT NULL,
    maternal_last_name VARCHAR(50) NULL,

    -- Documentación de Viaje (FNRH & Mercosur Compliant)
    document_type VARCHAR(20) NOT NULL, -- Enum: 'passport', 'rg', 'cpf', 'cnh', 'dni', 'other'
    document_number VARCHAR(30) NOT NULL,
    document_issuing_country VARCHAR(2) NOT NULL, -- Código ISO 3166-1 alpha-2

    -- Contacto, Comunicación y Consentimiento (LGPD Compliance)
    user_email VARCHAR(100) NOT NULL,
    phone_whatsapp VARCHAR(20) NOT NULL, -- Formato E.164 (limpio)
    has_active_whatsapp BOOLEAN NOT NULL DEFAULT TRUE, -- Flag de canal de comunicación activo
    is_marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE, -- Consentimiento para campañas

    -- Domicilio Particular (Residencial - Standard _conventions-address.md)
    street TEXT NOT NULL,
    number VARCHAR(15) NOT NULL,
    apartment VARCHAR(15) NULL,
    neighborhood TEXT NULL,
    city TEXT NOT NULL,
    state_province VARCHAR(50) NOT NULL,
    country_code VARCHAR(2) NOT NULL, -- Código ISO 3166-1 alpha-2
    postal_code VARCHAR(15) NULL,
    latitude DECIMAL(10, 8) NULL, -- Rango [-90, 90]
    longitude DECIMAL(11, 8) NULL, -- Rango [-180, 180]

    -- Domicilio Laboral (Opcional - 100% Anulable)
    work_street TEXT NULL,
    work_number VARCHAR(15) NULL,
    work_apartment VARCHAR(15) NULL,
    work_neighborhood TEXT NULL,
    work_city TEXT NULL,
    work_state_province VARCHAR(50) NULL,
    work_country_code VARCHAR(2) NULL, -- Código ISO 3166-1 alpha-2
    work_postal_code VARCHAR(15) NULL,

    -- Motor de Atribución Comercial y Origen de Venta (Marketing Spec)
    referral_source VARCHAR(30) NOT NULL, -- Enum: 'direct_web', 'direct_walk_in', 'agency_retail', 'agency_wholesale', 'marketing_campaign'
    referred_by_agency_retail_id UUID NULL REFERENCES public.agency_retail(id) ON DELETE SET NULL,
    referred_by_agency_wholesale_id UUID NULL REFERENCES public.agency_wholesale(id) ON DELETE SET NULL,
    specific_agent_name VARCHAR(100) NULL, -- Nombre del agente de viajes físico que cerró la venta
    promo_coupon_id UUID NULL REFERENCES public.promotions_coupons(id) ON DELETE SET NULL,
    agency_promo_id UUID NULL REFERENCES public.agency_promotions(id) ON DELETE SET NULL,

    -- Metadatos de Auditoría Temporales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Restricciones de Integridad y Deduplicación por Hotel (Tenant)
    CONSTRAINT uq_guests_email_per_tenant UNIQUE (tenant_id, user_email),
    CONSTRAINT uq_guests_document_per_tenant UNIQUE (tenant_id, document_type, document_number)
);

-- Índices de Alta Densidad para velocidad de consulta constante O(1) o O(log N)
CREATE INDEX IF NOT EXISTS idx_guests_tenant_email ON public.guests (tenant_id, user_email);
CREATE INDEX IF NOT EXISTS idx_guests_document ON public.guests (tenant_id, document_type, document_number);
CREATE INDEX IF NOT EXISTS idx_guests_referral ON public.guests (tenant_id, referral_source);

2. Definición del Escopo de Atribución y Origen (Marketing Spec)
Para asegurar la trazabilidad del retorno de inversión (ROAS) de marketing y auditar la procedencia comercial de cada huésped, el PMS gestiona el origen mediante cinco canales de atribución:
A. Canal 1: Direct Web (direct_web)
Definición: El huésped compró de forma autónoma a través del motor de reservas de la landing page.
Lógica: referred_by_agency_retail_id y referred_by_agency_wholesale_id se mantienen como NULL. Si utilizó un cupón de descuento, se inyecta su clave relacional en promo_coupon_id.
B. Canal 2: Direct Walk-In (direct_walk_in)
Definición: Pasajero de ingreso directo en la recepción del hotel sin reserva previa.
Lógica: Atribución local directa por el operador de guardia.
C. Canal 3: Agencia Minorista / Retail (agency_retail)
Definición: Venta cerrada por una agencia de viajes física o web de la cartera de partners.
Lógica:
Se requiere guardar la clave de la agencia en referred_by_agency_retail_id.
Identificación del Agente: Se registra el nombre o código del agente físico en specific_agent_name para reportes de incentivos o comisiones individuales.
Si aplica, se asocia la campaña específica de la agencia en agency_promo_id.
D. Canal 4: Agencia Mayorista / Consolidador (agency_wholesale)
Definición: Reservas de alto volumen o cupos bloqueados por turoperadores.
Lógica: Vinculado estrictamente a referred_by_agency_wholesale_id para facturación corporativa por lote (invoice billing).
E. Canal 5: Campañas de Marketing / Leads (marketing_campaign)
Definición: Huésped captado a través de anuncios pagados en redes sociales (Instagram, Facebook), correo o landing pages promocionales específicas.
Lógica: referral_source se marca como marketing_campaign e inyecta la promoción de captura correspondiente en promo_coupon_id.
3. Reglas de Normalización de Nombres, Documentos y Teléfono
Lowercase SSoT (Almacenamiento en Minúsculas):
Todos los campos de texto correspondientes a nombres (first_name, middle_name, paternal_last_name, maternal_last_name), correos y direcciones postales se guardan en minúsculas en disco.
Restore & Capitalization (Recobro de Nombres):
Al consultar un huésped, la capa de visualización PMS aplicará capitalización de primera letra exceptuando preposiciones como de, da, do, das, dos, e, y, of para evitar faltas ortográficas.
Gobernanza Telefónica (E.164):
El campo phone_whatsapp se sanitiza de guiones, espacios y paréntesis, guardando únicamente el formato numérico internacional limpio de 12 a 15 dígitos. El campo has_active_whatsapp determina si este número tiene capacidad confirmada de recibir llamados API automatizados del hotel.
4. Gobernanza del Domicilio Laboral (Opcional y Desacoplado)
Para evitar la redundancia de perfiles, los datos residenciales de la empresa o lugar de trabajo se consolidan de forma opcional dentro del mismo expediente del huésped mediante los campos prefijados con work_.
Si la pestaña comercial en el PMS se deja vacía, el motor de Supabase insertará valores NULL de forma transversal en las 8 columnas work_*, garantizando una base de datos ligera y libre de registros huérfanos.

---