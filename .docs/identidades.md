Manifiesto de Identidades Inteligentes: Arquitectura de Enlace por Email (SSoT)
En un Property Management System (PMS) moderno e integrado con pasarelas de pago de mínima fricción, el paradigma clásico de "Registro obligatorio antes de comprar" destruye las tasas de conversión (CRO) [1.1.2].
La próxima generación de software hotelero exige el principio de "Transacción Fluida y Registro Diferido". Para lograr esto de forma robusta y con integridad absoluta de datos, establecemos que la dirección de correo electrónico (Email) es el SSoT (Single Source of Truth) inmutable del ecosistema.
code
Code
[ EMAIL: El Enlace Inmutable ]
                                         │
       ┌─────────────────────────────────┼────────────────────────────────┐
       ▼                                 ▼                                ▼
[ Stripe Checkout ]              [ Supabase Auth ]               [ Ecosistema Operativo ]
  • Compra como Invitado           • auth.users                    • public.users (RBAC)
  • Retorno Seguro                 • Confirmación Síncrona         • public.guests (Perfil)
1. Los Tres Pilares de la Identidad Unificada
Pilar A: El Enlace Dual (Id-Email Link)
Para garantizar la máxima velocidad de consulta (índices en constante de tiempo 
O
(
1
)
O(1)
) y el cumplimiento de la integridad referencial, el ecosistema implementa una topología de enlace dual:
Identificación por Sesión (id): public.users.id y public.guests.id coinciden exactamente con el UUID generado en el esquema privado auth.users.id. Esto permite resolver perfiles en tiempo real utilizando funciones de base de datos como auth.uid() con políticas RLS de alto rendimiento.
Identificación de Negocio (email): El correo electrónico actúa como la clave de unificación lógica. Si un huésped realiza múltiples reservas como "invitado" en Stripe o mediante OTAs (Booking, Decolar), el sistema busca y consolida sus consumos históricos bajo el mismo correo, previniendo perfiles fragmentados o duplicados.
Pilar B: "Venta Primero, Registro Después" (Frictionless Conversion)
Checkout: El usuario introduce su email en la pasarela de Stripe. No se requiere contraseña.
Webhook: Stripe concilia el pago. El servidor procesa la reserva. En esta fase, el huésped es un "perfil fantasma" en public.guests identificado únicamente por su email.
Diferimiento: Al aterrizar en /success, el sistema extrae su email de los metadatos de Stripe. El huésped introduce solo una contraseña para activar su cuenta. Al llamar a signUp(), el Trigger de la base de datos reclama el perfil fantasma de public.guests, fusionándolo con su nuevo UUID de autenticación.
Pilar C: Onboarding Coherente de Personal
Cuando un administrador crea un empleado (api/admin/create-staff.ts), el Trigger de la base de datos automatiza la propagación desde auth.users hacia public.users y public.guests utilizando el nombre corporativo. El empleado inicia sesión y es forzado a cambiar su contraseña temporal e hidratar sus datos de contacto reales bajo una validación telefónica industrial.

---

