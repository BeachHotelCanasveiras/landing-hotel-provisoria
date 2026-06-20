Busqueda
    campo para insert de busqueda de funcionalidades de la plataforma

Vision General
	Diaria
	Semanal
	Mensual

Check In
    interfaz intuitiva de checkinque permite ingresar lso datos para crear el cliente en la base de datos o lo toma si ya existe (previene duplicados) y permite crear acompanantes con nombre apellidos fecha de nscimiento, bnacionalidad documento de viaje email y whatsapp creando una asociacion con los pasajeros de vaije (relacion), este checkin deberia crearse al momento de la venta online o rellenarse manualmente en caso de reserva manual

Reservas/Quartos
	Inventario de quartos
	Buscador Reservas
	Resumen Diario
	Resumen Semanal
	Resumen Mensual
	Disponibles (busqueda por tipos y fechas)
	Ocupados
	Reservados
	Bloqueos (bloqueos por fechas)
	En Mantencion

Tarifas
	Tarifas Base Mayoristas
	Tarifas Venta Publico
	Tarifas Flexibles (paquetes y porcentaje descuentos)
	Tarifas Ultimo Minuto

Base de datos de huespedes (crud)
    nombres y apellidos (separados)
    fecha nascimiento
    email
    telefono (se elije codigo pais) + numero
    nacionalidad
    calle, numero, apto, barrio, pais origen
    derivado de  agencia de viajes, internet, directo


Housekiping(en espanol)
	Listado de habitaciones x hacer diario (con cheklist desplegable x habitacion)
	Listado de faxinera (con horario)
	Listado de mensajes huespedes (alerta mensaje)
	Inventario de compras
	Listado de productos faltantes
	

Contabilidad (ingreso de nota fiscal x centro de costos)
    centro de costos aseo
    centro de costos desayuno
    centro de costos bar
    centro de costos restaurante
    centro de costos aseo y lavanderia

*al ingresarse las compras se calculan los usos x ejemplo si se compran 500 jabones y se cambia 1xdia x 60 huespedes deben durar x dias, asi con todo

Inventario y Stock (admin y developer puede hacer crud)
    Cantidad de sabanas 1 plaza
    cantidad sabanas 2 plazas
    Cantidad de Televisores
    Cantidad de frigobares
    Cabtidad de Toallas
    Cantidad de Platos bajos
    Cantidad de platos hondosd
    Cantidad de Tazas
    Cantidad de jabones
    Cantidad de shampoo
    Cantidad de cuchillos
    Cantidad de tenedores
    Cantidad de cucharas
    cantidad cucharas de te
    Cabtidad de rollos papel higienico



Lavanderia (ropa sucia a lavar reportada x faxinera diariamente)
    Cantidad de sabanas
    Cantidad de cobertires
    Cantidad toallas 


Cafe/desayuno
    Numero de huespedes
    Pedidos especiales de huespedes (a traves de la app guest)
    Encargado dia
    Menu dia (cafe proyectado, leche agua, panes, huevos, frutas, jugos, etcetera)

Recursos Humanos (crud de admin y developer)
    debe poder agregar, editar y guardar registro de funcionarios (nunca eliminar)
    Nombre y apellidos en celdas separadas
    nacionalidad
    fecha de nacimiento
    profesion
    cargo o funciones
    salario base clt
    carga trabajo mensual
    dias de trabajo (calendario mensual)
    email personal
    email corporativo (nombre.apellido@beach)
    direccion calle, barrio, ciudad
    contacto emergencia (nombre y telefono)
    hora ingreso ( a traves de sesion propia) y salida
    calculo de horas trabajadas
    calculo de horas extras
    calculo de asicional nocturno 
    calculo feriados

Promociones y vouchers

        AGREGAR Y MODIFICAR PAQUETES PROMOCIONES Y ENVIAR POR EMAIL, WHATSAPP

        AGREGAR Y MODIFICAR INFORMACIONES DE COMPROBANTES DE PAGO

        AGREGAR Y ENVIAR PROMOCIONES Y CUPONES DESCUENTO


Configuraciones
        DE DASHBOARD
        DE PLANTILLAS
