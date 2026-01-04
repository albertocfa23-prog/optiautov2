# OPTIAUTO - Sistema de Gestión de Vehículos

Sistema web para gestión de vehículos construido con **HTML, CSS, JavaScript vanilla** y **PocketBase**.

## Características

- Autenticación de usuarios (registro e inicio de sesión)
- Roles de usuario: **admin** y **user**
- CRUD completo de vehículos (crear, leer, actualizar, eliminar)
- Carga de imágenes para vehículos
- Búsqueda y filtrado en tiempo real
- Interfaz responsive y moderna
- Gestión de permisos por rol

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Modules)
- **Backend**: PocketBase (API REST + SQLite)
- **Base de datos**: SQLite (integrada en PocketBase)
- **Autenticación**: PocketBase Auth

## Estructura del Proyecto

```
OPTIAUTO/
├── pocketbase/
│   └── pocketbase.exe          # Ejecutable de PocketBase
├── pb_data/                    # Datos y base de datos (generado automáticamente)
├── public/                     # Frontend
│   ├── index.html              # Página principal
│   ├── styles.css              # Estilos globales
│   ├── js/
│   │   ├── app.js              # Punto de entrada principal
│   │   ├── auth.js             # Módulo de autenticación
│   │   ├── vehicles.js         # Módulo CRUD de vehículos
│   │   └── utils.js            # Funciones auxiliares
│   └── assets/                 # Recursos estáticos
├── README.md                   # Este archivo
└── SETUP.md                    # Guía de configuración
```

## Instalación y Configuración

### 1. Requisitos Previos

- Windows (para el ejecutable de PocketBase)
- Navegador web moderno (Chrome, Firefox, Edge)
- Editor de código (VS Code recomendado)

### 2. Descargar PocketBase

1. Ve a https://pocketbase.io/docs/
2. Descarga la versión para Windows
3. Extrae `pocketbase.exe` en la carpeta `pocketbase/` del proyecto

### 3. Configurar PocketBase

Lee el archivo [SETUP.md](./SETUP.md) para instrucciones detalladas sobre:
- Cómo crear las colecciones
- Configurar los campos
- Establecer las reglas de acceso
- Crear usuarios de prueba

### 4. Iniciar PocketBase

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd pocketbase
./pocketbase serve
```

PocketBase estará disponible en:
- Admin UI: http://127.0.0.1:8090/_/
- API: http://127.0.0.1:8090/api/

### 5. Ejecutar la Aplicación

Puedes abrir `public/index.html` directamente en el navegador, pero es **recomendado usar un servidor local** para evitar problemas de CORS:

#### Opción 1: Python
```bash
cd public
python -m http.server 3000
```

#### Opción 2: Node.js (npx)
```bash
npx serve public -p 3000
```

#### Opción 3: VS Code Live Server
1. Instala la extensión "Live Server"
2. Click derecho en `public/index.html`
3. Selecciona "Open with Live Server"

Accede a: http://localhost:3000

## Uso de la Aplicación

### Registro e Inicio de Sesión

1. Al abrir la aplicación, verás la pantalla de login
2. Si no tienes cuenta, haz clic en "Regístrate"
3. Completa el formulario de registro
4. Inicia sesión con tu email y contraseña

**Nota**: Los usuarios registrados tienen el rol `user` por defecto. Para convertir un usuario en `admin`, edítalo desde el Admin UI de PocketBase.

### Dashboard

#### Usuario Normal (role: user)
- Ver listado de todos los vehículos
- Buscar vehículos por marca, modelo o placa
- Ver detalles de cada vehículo

#### Administrador (role: admin)
- Todas las funciones de usuario normal +
- Crear nuevos vehículos
- Editar vehículos existentes
- Eliminar vehículos

### Crear/Editar Vehículo (Solo Admin)

1. Haz clic en "Nuevo Vehículo"
2. Completa el formulario:
   - **Marca**: Toyota, Ford, etc.
   - **Modelo**: Corolla, Mustang, etc.
   - **Año**: Entre 1900 y 2030
   - **Tipo**: auto, moto, camión, SUV, van
   - **Placa**: Formato alfanumérico (ej: ABC-123)
   - **Estado**: disponible, vendido, en mantenimiento
   - **Precio**: Número decimal
   - **Imagen**: (Opcional) JPG o PNG, máx 5MB
3. Haz clic en "Guardar"

### Buscar Vehículos

Usa la barra de búsqueda para filtrar por:
- Marca
- Modelo
- Placa
- Tipo

La búsqueda es en tiempo real (con debounce de 300ms).

## Arquitectura

### Autenticación

- PocketBase maneja la autenticación con JWT
- El token se almacena automáticamente en `localStorage`
- La sesión persiste al recargar la página
- El SDK de PocketBase maneja automáticamente la renovación del token

### Permisos

Los permisos se gestionan mediante **API Rules** en PocketBase:

#### Colección `vehicles`

| Operación | Regla |
|-----------|-------|
| List/View | `@request.auth.id != ""` (cualquier usuario autenticado) |
| Create    | `@request.auth.role = "admin"` (solo admin) |
| Update    | `@request.auth.role = "admin"` (solo admin) |
| Delete    | `@request.auth.role = "admin"` (solo admin) |

### Módulos JavaScript

#### app.js
- Inicializa PocketBase
- Gestiona el enrutamiento entre pantallas (auth/dashboard)
- Maneja eventos globales

#### auth.js
- Login y registro
- Logout
- Verificación de sesión
- Helpers de autenticación (isAdmin, getCurrentUser)

#### vehicles.js
- CRUD de vehículos
- Renderizado de la tabla
- Búsqueda y filtrado
- Gestión de modales

#### utils.js
- Funciones auxiliares reutilizables
- Formateo de datos
- Manejo de errores
- Helpers de UI

## API de PocketBase

### Endpoints Principales

#### Autenticación
```javascript
// Login
POST /api/collections/users/auth-with-password
Body: { identity: "email", password: "..." }

// Registro
POST /api/collections/users/records
Body: { username, email, password, passwordConfirm, role }

// Refresh
POST /api/collections/users/auth-refresh
```

#### Vehículos
```javascript
// Listar todos
GET /api/collections/vehicles/records

// Obtener uno
GET /api/collections/vehicles/records/:id

// Crear
POST /api/collections/vehicles/records
Body: FormData { marca, modelo, año, tipo, placa, estado, precio, imagen?, owner }

// Actualizar
PATCH /api/collections/vehicles/records/:id
Body: FormData { ...campos a actualizar }

// Eliminar
DELETE /api/collections/vehicles/records/:id
```

### Ejemplos con JavaScript

```javascript
// Crear vehículo
const formData = new FormData();
formData.append('marca', 'Toyota');
formData.append('modelo', 'Corolla');
formData.append('año', 2023);
formData.append('tipo', 'auto');
formData.append('placa', 'ABC-123');
formData.append('estado', 'disponible');
formData.append('precio', 25000);
formData.append('owner', pb.authStore.model.id);

const record = await pb.collection('vehicles').create(formData);

// Listar con filtros
const vehicles = await pb.collection('vehicles').getList(1, 50, {
    filter: 'marca ~ "Toyota"',
    sort: '-created'
});

// Actualizar
await pb.collection('vehicles').update('RECORD_ID', {
    precio: 26000,
    estado: 'vendido'
});

// Eliminar
await pb.collection('vehicles').delete('RECORD_ID');
```

## Seguridad

### Validaciones

- **Frontend**: Validación de formularios con HTML5 y JavaScript
- **Backend**: PocketBase valida automáticamente según los tipos de campo
- **Permisos**: Las API Rules aseguran que solo usuarios autorizados puedan modificar datos

### Buenas Prácticas Implementadas

- Sanitización de inputs para prevenir XSS
- Validación de tipos de archivo y tamaño de imágenes
- Autenticación requerida para todas las operaciones
- Permisos basados en roles
- Manejo seguro de errores sin exponer información sensible

## Escalabilidad

Este proyecto está diseñado para escalar:

### Frontend
- Fácil migración a React, Vue o Angular (módulos separados)
- Estructura lista para PWA
- Código modular y reutilizable

### Backend
- PocketBase puede manejar miles de usuarios
- Fácil migración a otras bases de datos (PostgreSQL, MySQL)
- API REST estándar compatible con cualquier cliente

### Móvil
- La API ya está lista para consumir desde React Native, Flutter, etc.
- Frontend responsive funciona en móviles web

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que PocketBase esté corriendo
- Revisa que la URL en `app.js` sea correcta
- Comprueba la consola del navegador para más detalles

### Error: "Forbidden" o "Unauthorized"
- Verifica las API Rules en PocketBase
- Asegúrate de estar autenticado
- Verifica que el usuario tenga el rol correcto

### Imágenes no se cargan
- Verifica que el archivo sea JPG o PNG
- Verifica que sea menor a 5MB
- Comprueba la URL generada en la consola

### La sesión no persiste
- PocketBase guarda el token en localStorage automáticamente
- Verifica que el navegador permita localStorage
- Revisa la consola para errores de autenticación

## Próximas Mejoras

- [ ] Paginación de vehículos
- [ ] Filtros avanzados (por rango de precio, año, etc.)
- [ ] Exportar listado a CSV/PDF
- [ ] Historial de cambios
- [ ] Notificaciones en tiempo real con PocketBase Realtime
- [ ] Modo oscuro
- [ ] Multiidioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Tests unitarios y E2E

## Licencia

Este proyecto es de código abierto para fines educativos.

## Soporte

Para dudas o problemas:
1. Revisa [SETUP.md](./SETUP.md)
2. Consulta la [documentación de PocketBase](https://pocketbase.io/docs/)
3. Revisa la consola del navegador para errores

---

**Desarrollado con HTML, CSS, JavaScript y PocketBase**
