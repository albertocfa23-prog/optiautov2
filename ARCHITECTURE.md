# Arquitectura OPTIAUTO v2

## Estructura Completa del Proyecto

```
OPTIAUTO/
├── pocketbase/
│   └── pocketbase.exe
├── pb_data/                    # Base de datos (generado automáticamente)
├── public/
│   ├── index.html              # UI principal
│   ├── styles.css              # Estilos globales
│   ├── js/
│   │   ├── app.js              # Inicialización
│   │   ├── auth.js             # Autenticación
│   │   ├── utils.js            # Utilidades
│   │   ├── vehicles.js         # CRUD vehículos básico
│   │   ├── maintenances.js     # Sistema de mantenimientos ⭐ NUEVO
│   │   ├── documents.js        # Gestión de documentos ⭐ NUEVO
│   │   ├── workshops.js        # Talleres y citas ⭐ NUEVO
│   │   └── workshop-portal.js  # Portal de talleres ⭐ NUEVO
│   └── assets/
├── README.md
├── SETUP.md
├── DEPLOYMENT.md
└── ARCHITECTURE.md             # Este archivo
```

## Colecciones de PocketBase

### 1. users (existente - expandida)
- username (text)
- email (email)
- password (password)
- **role** (select: "client", "admin", "workshop")

### 2. vehicles (existente - expandida)
- user_id (relation → users)
- make (text)
- modelo (text)
- año (number)
- tipo (select)
- placa (text, unique)
- estado (select)
- precio (number)
- **km** (number) - Kilometraje actual ⭐ NUEVO
- imagen (file)
- **tech_sheet_url** (file) - Ficha técnica ⭐ NUEVO
- **insurance_url** (file) - Seguro ⭐ NUEVO
- **itv_url** (file) - ITV ⭐ NUEVO

### 3. maintenances ⭐ NUEVA
- vehicle_id (relation → vehicles, cascade delete)
- type (select: "Cambio de aceite y filtros", "Inspección de frenos", "Correas", "ITV", "Neumáticos", "Batería", "Bujías")
- date (date)
- km (number) - Kilometraje cuando se realizó
- status (select: "pendiente", "realizado")
- notes (text)

### 4. workshops ⭐ NUEVA
- name (text)
- address (text)
- phone (text)
- email (email)
- available (bool) - Si acepta nuevas citas
- user_id (relation → users) - Usuario que gestiona el taller

### 5. appointments ⭐ NUEVA
- user (relation → users) - Cliente
- vehicle (relation → vehicles)
- workshop (relation → workshops)
- date (date)
- time (text)
- reason (text)
- status (select: "solicitada", "confirmada", "completada", "cancelada")

## Funcionalidades por Módulo

### maintenances.js
- **Alertas inteligentes** según km recorridos
- Intervalos configurables por tipo de mantenimiento
- Estados visuales (verde, amarillo, rojo)
- Historial completo por vehículo
- CRUD de mantenimientos

### documents.js
- Subida de documentos (PDF, imágenes)
- Visualización inline o descarga
- Eliminación de documentos
- Validación de tipos y tamaños

### workshops.js
- Listado de talleres disponibles
- Reserva de citas con selección de vehículo
- Calendario de disponibilidad
- Estados de citas

### workshop-portal.js
- Vista dedicada para talleres
- Gestión de citas recibidas
- Aceptar/rechazar/completar citas
- Ver información de clientes y vehículos

## Flujo de Usuario

### Cliente:
1. Login → Dashboard
2. Agregar vehículo (con documentos opcionales)
3. Ver vehículo → Gestionar mantenimientos
4. Ver alertas de mantenimiento
5. Reservar cita en taller

### Taller:
1. Login → Workshop Portal
2. Ver citas pendientes
3. Confirmar/rechazar citas
4. Marcar citas como completadas

### Admin:
- Todas las funcionalidades de cliente
- CRUD de talleres
- CRUD de vehículos de cualquier usuario

## APIs y Endpoints

Todos los endpoints son manejados automáticamente por PocketBase:

```
/api/collections/users/records
/api/collections/vehicles/records
/api/collections/maintenances/records
/api/collections/workshops/records
/api/collections/appointments/records
```

## Permisos y Reglas

Ver SETUP.md para configuración detallada de reglas de acceso.

## Próximas Mejoras

- [ ] Notificaciones por email (usando PocketBase hooks)
- [ ] Exportar historial de mantenimientos a PDF
- [ ] Sistema de valoraciones para talleres
- [ ] Chat entre cliente y taller
- [ ] Recordatorios automáticos de mantenimientos
