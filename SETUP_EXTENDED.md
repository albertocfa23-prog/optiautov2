# Configuración Extendida de PocketBase

## Colecciones Adicionales Necesarias

### 1. Actualizar colección `users`

Agregar campo adicional:

| Campo | Tipo   | Opciones                                           |
|-------|--------|----------------------------------------------------|
| role  | Select | Required: ✓, Values: client, admin, workshop, Default: client |

### 2. Actualizar colección `vehicles`

Agregar campos adicionales:

| Campo           | Tipo   | Opciones/Validaciones                    |
|-----------------|--------|------------------------------------------|
| km              | Number | Required: ✓, Min: 0                      |
| user_id         | Relation | Collection: users, Single, Cascade Delete: ✓ |
| tech_sheet_url  | File   | Max Select: 1, Max Size: 10MB, Types: application/pdf, image/* |
| insurance_url   | File   | Max Select: 1, Max Size: 10MB, Types: application/pdf, image/* |
| itv_url         | File   | Max Select: 1, Max Size: 10MB, Types: application/pdf, image/* |

**API Rules para vehicles:**

```javascript
// List/Search: Solo el dueño o admin
@request.auth.id != "" && (@request.auth.id = user_id || @request.auth.role = "admin")

// View: Solo el dueño o admin
@request.auth.id != "" && (@request.auth.id = user_id || @request.auth.role = "admin")

// Create: Solo el propio usuario o admin
@request.auth.id != "" && (@request.auth.id = @request.data.user_id || @request.auth.role = "admin")

// Update: Solo el dueño o admin
@request.auth.id != "" && (@request.auth.id = user_id || @request.auth.role = "admin")

// Delete: Solo el dueño o admin
@request.auth.id != "" && (@request.auth.id = user_id || @request.auth.role = "admin")
```

### 3. Crear colección `maintenances`

**Tipo:** Base collection

| Campo      | Tipo     | Opciones/Validaciones                                                    |
|------------|----------|--------------------------------------------------------------------------|
| vehicle_id | Relation | Collection: vehicles, Single, Required: ✓, Cascade Delete: ✓            |
| type       | Select   | Required: ✓, Values: Cambio de aceite y filtros, Inspección de frenos, Correas, ITV, Neumáticos, Batería, Bujías |
| date       | Date     | Required: ✓                                                              |
| km         | Number   | Required: ✓, Min: 0                                                      |
| status     | Select   | Required: ✓, Values: pendiente, realizado, Default: pendiente           |
| notes      | Text     | Max: 500                                                                 |

**API Rules:**

```javascript
// List/Search: Solo el dueño del vehículo o admin
@request.auth.id != "" && (@request.auth.id = vehicle_id.user_id || @request.auth.role = "admin")

// View: Solo el dueño del vehículo o admin
@request.auth.id != "" && (@request.auth.id = vehicle_id.user_id || @request.auth.role = "admin")

// Create: Solo el dueño del vehículo o admin
@request.auth.id != "" && (@request.auth.id = vehicle_id.user_id || @request.auth.role = "admin")

// Update: Solo el dueño del vehículo o admin
@request.auth.id != "" && (@request.auth.id = vehicle_id.user_id || @request.auth.role = "admin")

// Delete: Solo el dueño del vehículo o admin
@request.auth.id != "" && (@request.auth.id = vehicle_id.user_id || @request.auth.role = "admin")
```

### 4. Crear colección `workshops`

**Tipo:** Base collection

| Campo     | Tipo     | Opciones/Validaciones                        |
|-----------|----------|----------------------------------------------|
| name      | Text     | Required: ✓, Min: 3, Max: 100                |
| address   | Text     | Required: ✓, Max: 200                        |
| phone     | Text     | Max: 20                                      |
| email     | Email    |                                              |
| available | Bool     | Default: true                                |
| user_id   | Relation | Collection: users, Single, Cascade Delete: ✓ |

**API Rules:**

```javascript
// List/Search: Todos autenticados
@request.auth.id != ""

// View: Todos autenticados
@request.auth.id != ""

// Create: Solo admin o workshop
@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.role = "workshop")

// Update: Solo el dueño o admin
@request.auth.id != "" && (@request.auth.id = user_id || @request.auth.role = "admin")

// Delete: Solo admin
@request.auth.role = "admin"
```

### 5. Crear colección `appointments`

**Tipo:** Base collection

| Campo    | Tipo     | Opciones/Validaciones                                              |
|----------|----------|--------------------------------------------------------------------|
| user     | Relation | Collection: users, Single, Required: ✓                             |
| vehicle  | Relation | Collection: vehicles, Single, Required: ✓                          |
| workshop | Relation | Collection: workshops, Single, Required: ✓, Cascade Delete: ✓     |
| date     | Date     | Required: ✓                                                        |
| time     | Text     | Required: ✓                                                        |
| reason   | Text     | Max: 300                                                           |
| status   | Select   | Required: ✓, Values: solicitada, confirmada, completada, cancelada, Default: solicitada |

**API Rules:**

```javascript
// List/Search: Cliente ve sus citas, taller ve sus citas, admin ve todo
@request.auth.id != "" && (@request.auth.id = user || @request.auth.id = workshop.user_id || @request.auth.role = "admin")

// View: Cliente ve sus citas, taller ve sus citas, admin ve todo
@request.auth.id != "" && (@request.auth.id = user || @request.auth.id = workshop.user_id || @request.auth.role = "admin")

// Create: Solo clientes
@request.auth.id != "" && @request.auth.id = @request.data.user

// Update: Cliente puede cancelar, taller puede confirmar/completar, admin puede todo
@request.auth.id != "" && (@request.auth.id = user || @request.auth.id = workshop.user_id || @request.auth.role = "admin")

// Delete: Solo admin
@request.auth.role = "admin"
```

## Resumen de Cambios

1. **users**: Agregar campo `role` con valores: client, admin, workshop
2. **vehicles**: Agregar campos `km`, `user_id`, `tech_sheet_url`, `insurance_url`, `itv_url`
3. **maintenances**: Nueva colección completa
4. **workshops**: Nueva colección completa
5. **appointments**: Nueva colección completa

## Orden de Creación Recomendado

1. Modificar `users` (agregar role)
2. Modificar `vehicles` (agregar campos nuevos)
3. Crear `maintenances`
4. Crear `workshops`
5. Crear `appointments`
