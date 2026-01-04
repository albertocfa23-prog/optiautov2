# Configuración de PocketBase para OPTIAUTO

## 1. Instalación de PocketBase

### Descargar PocketBase

1. Ve a https://pocketbase.io/docs/
2. Descarga la versión para Windows
3. Extrae el archivo `pocketbase.exe` en la carpeta `pocketbase/` del proyecto

### Iniciar PocketBase

```bash
cd pocketbase
./pocketbase serve
```

PocketBase se ejecutará en `http://127.0.0.1:8090`

## 2. Configuración Inicial (Admin UI)

1. Abre tu navegador en `http://127.0.0.1:8090/_/`
2. Crea tu cuenta de administrador (primera vez)
3. Accederás al panel de administración

## 3. Crear Colección: vehicles

### Paso a paso:

1. En el panel admin, ve a **Collections** → **New Collection**
2. Nombre: `vehicles`
3. Tipo: **Base collection**
4. Haz clic en **Create**

### Campos a agregar:

| Campo    | Tipo      | Opciones/Validaciones                                      |
|----------|-----------|------------------------------------------------------------|
| marca    | Text      | Required: ✓, Min: 2, Max: 50                              |
| modelo   | Text      | Required: ✓, Min: 2, Max: 50                              |
| año      | Number    | Required: ✓, Min: 1900, Max: 2030                         |
| tipo     | Select    | Required: ✓, Values: auto, moto, camión, SUV, van         |
| placa    | Text      | Required: ✓, Unique: ✓, Pattern: ^[A-Z0-9-]+$            |
| estado   | Select    | Required: ✓, Values: disponible, vendido, en mantenimiento|
| precio   | Number    | Required: ✓, Min: 0                                       |
| imagen   | File      | Max Select: 1, Max Size: 5MB, Types: image/jpeg, image/png|
| owner    | Relation  | Collection: users, Single, Cascade Delete: ✓              |

### Reglas de Acceso (API Rules)

En la pestaña **API Rules** de la colección `vehicles`:

#### List/Search Rule:
```javascript
// Todos pueden ver los vehículos (autenticados)
@request.auth.id != ""
```

#### View Rule:
```javascript
// Todos pueden ver un vehículo específico
@request.auth.id != ""
```

#### Create Rule:
```javascript
// Solo admins pueden crear
@request.auth.role = "admin"
```

#### Update Rule:
```javascript
// Solo admins pueden editar
@request.auth.role = "admin"
```

#### Delete Rule:
```javascript
// Solo admins pueden eliminar
@request.auth.role = "admin"
```

## 4. Modificar Colección: users

### Agregar campo custom "role"

1. Ve a **Collections** → **users**
2. Haz clic en **Edit**
3. Agrega un nuevo campo:

| Campo | Tipo   | Opciones                                    |
|-------|--------|---------------------------------------------|
| role  | Select | Required: ✓, Values: user, admin, Default: user |

4. Guarda los cambios

### Reglas de Acceso para users

Deja las reglas por defecto, o ajústalas si necesitas:

- **List/Search**: Solo el propio usuario puede verse
- **View**: Solo el propio usuario
- **Create**: Público (para registro)
- **Update**: Solo el propio usuario (excepto role)
- **Delete**: Solo admins

## 5. Crear Usuario Admin de Prueba

### Opción 1: Desde el Admin UI
1. Ve a **Collections** → **users** → **New record**
2. Completa:
   - username: `admin`
   - email: `admin@optiauto.com`
   - password: `admin123456`
   - role: `admin`
3. Guarda

### Opción 2: Desde la aplicación
1. Registra un usuario normal
2. Ve al Admin UI → **users**
3. Edita el usuario y cambia role a `admin`

## 6. Configuración de CORS (opcional para desarrollo)

Si trabajas con diferentes puertos, PocketBase maneja CORS automáticamente, pero puedes ajustarlo en:

**Settings** → **Application** → Allowed Origins

Agrega: `http://localhost:3000` o el puerto que uses.

## 7. Verificar Instalación

### Endpoints disponibles:

- Admin UI: `http://127.0.0.1:8090/_/`
- API Base: `http://127.0.0.1:8090/api/`
- Collections:
  - `http://127.0.0.1:8090/api/collections/users/records`
  - `http://127.0.0.1:8090/api/collections/vehicles/records`

### Probar API (opcional):

```bash
# Listar vehículos (requiere autenticación)
curl http://127.0.0.1:8090/api/collections/vehicles/records
```

## 8. Ejecutar el Proyecto

1. Asegúrate de que PocketBase esté corriendo:
   ```bash
   cd pocketbase
   ./pocketbase serve
   ```

2. Abre `public/index.html` en tu navegador, o usa un servidor local:
   ```bash
   # Opción 1: Python
   cd public
   python -m http.server 3000

   # Opción 2: Node.js (npx)
   npx serve public -p 3000

   # Opción 3: VS Code Live Server extension
   ```

3. Accede a `http://localhost:3000`

## 9. Datos de Prueba (opcional)

Puedes crear vehículos de prueba desde el Admin UI o desde la aplicación una vez logueado como admin.

## Resumen de URLs

| Servicio           | URL                              |
|--------------------|----------------------------------|
| PocketBase Admin   | http://127.0.0.1:8090/_/        |
| PocketBase API     | http://127.0.0.1:8090/api/      |
| Frontend App       | http://localhost:3000           |

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que PocketBase esté corriendo
- Revisa que la URL en `app.js` sea correcta (`http://127.0.0.1:8090`)

### Error: "Forbidden"
- Verifica las API Rules de las colecciones
- Asegúrate de estar autenticado
- Verifica que el usuario tenga el rol correcto

### Imágenes no se suben
- Verifica el tamaño máximo (5MB)
- Verifica el formato (solo JPEG/PNG)
- Verifica los permisos del campo `imagen`

---

**Próximos pasos**: Lee [README.md](README.md) para entender cómo funciona la aplicación.
