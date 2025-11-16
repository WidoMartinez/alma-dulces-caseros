# Sistema Administrativo - Alma Dulces Caseros

## Descripción General

El sistema administrativo permite gestionar el catálogo de productos de manera segura y eficiente. Solo usuarios con rol de **administrador** pueden acceder a estas funcionalidades.

## Acceso al Panel Administrativo

### URL de Acceso
```
https://tu-dominio.com/admin
```

### Requisitos de Acceso
1. **Autenticación obligatoria**: Debes iniciar sesión con una cuenta válida
2. **Rol de administrador**: Tu cuenta debe tener el rol `admin` en la base de datos
3. **Configuración del primer admin**: El primer usuario administrador se configura mediante la variable de entorno `OWNER_OPEN_ID`

### Configurar el Primer Administrador

En el archivo `.env`, configura:
```env
OWNER_OPEN_ID=tu-open-id-aqui
```

Cuando un usuario con este `openId` inicie sesión por primera vez, automáticamente se le asignará el rol de administrador.

## Funcionalidades del Panel

### 1. Listado de Productos
- Visualiza todos los productos registrados en el sistema
- Información mostrada:
  - ID del producto
  - Nombre
  - Categoría
  - Precio (formato CLP)
  - Cantidad disponible
  - Si es orgánico o no

### 2. Crear Nuevo Producto

Haz clic en el botón **"Nuevo Producto"** y completa el formulario:

**Campos obligatorios (*):**
- **Nombre del Producto**: Máximo 150 caracteres
- **Categoría**: Selecciona una categoría existente
- **Precio**: En pesos chilenos (CLP), solo números enteros
- **Disponibles**: Cantidad de unidades disponibles
- **Orgánico**: Indica si el producto es orgánico (Sí/No)

**Campos opcionales:**
- **Descripción**: Texto descriptivo del producto
- **Ingredientes**: Lista de ingredientes
- **URL de Imagen**: Enlace a la imagen del producto

### 3. Editar Producto

1. Haz clic en el botón de editar (ícono de lápiz) junto al producto
2. Modifica los campos necesarios
3. Guarda los cambios

### 4. Eliminar Producto

1. Haz clic en el botón de eliminar (ícono de papelera) junto al producto
2. Confirma la eliminación en el diálogo de confirmación
3. **Nota**: Esta acción es irreversible

## Seguridad

### Protección de Rutas
- La ruta `/admin` está protegida por autenticación
- Solo usuarios con rol `admin` pueden acceder
- Usuarios no autenticados son redirigidos al login
- Usuarios autenticados sin rol admin ven un mensaje de "Acceso Denegado"

### Protección de API
Todos los endpoints administrativos están protegidos:

```typescript
// Backend (server/routers.ts)
admin: router({
  products: router({
    create: adminProcedure.mutation(...),
    update: adminProcedure.mutation(...),
    delete: adminProcedure.mutation(...),
  }),
})
```

El middleware `adminProcedure` verifica:
1. Que el usuario esté autenticado
2. Que el usuario tenga rol `admin`
3. Retorna error 403 (FORBIDDEN) si no cumple los requisitos

## Arquitectura Técnica

### Stack Utilizado
- **Frontend**: React + TypeScript
- **Routing**: Wouter
- **API**: tRPC (type-safe API)
- **Base de datos**: MySQL con Drizzle ORM
- **UI Components**: Radix UI + Tailwind CSS
- **Notificaciones**: Sonner (toast)

### Estructura de Archivos

```
client/src/pages/Admin.tsx          # Página principal del admin
server/routers.ts                   # Rutas tRPC (incluye admin)
server/db.ts                        # Funciones CRUD de base de datos
server/_core/trpc.ts                # Middleware de autenticación
drizzle/schema.ts                   # Esquema de base de datos
```

### API Endpoints (tRPC)

#### Crear Producto
```typescript
trpc.admin.products.create.mutate({
  categoryId: number,
  name: string,
  description?: string,
  ingredients?: string,
  price: number,
  imageUrl?: string,
  available: number,
  organic: number,
})
```

#### Actualizar Producto
```typescript
trpc.admin.products.update.mutate({
  id: number,
  // Todos los campos son opcionales excepto id
  categoryId?: number,
  name?: string,
  ...
})
```

#### Eliminar Producto
```typescript
trpc.admin.products.delete.mutate(productId: number)
```

## Flujo de Datos

```
Frontend (Admin.tsx)
    ↓
tRPC Client
    ↓
Server (routers.ts)
    ↓
adminProcedure (verifica rol)
    ↓
Database Functions (db.ts)
    ↓
MySQL Database
```

## Manejo de Errores

### En el Frontend
- Notificaciones toast para feedback inmediato
- Mensajes de éxito/error claros
- Validación de formularios

### En el Backend
- Validación con Zod schemas
- Manejo de errores de base de datos
- Logs de errores en consola
- Respuestas HTTP apropiadas

## Casos de Uso Comunes

### Agregar un producto estacional
1. Ir a `/admin`
2. Clic en "Nuevo Producto"
3. Completar información del producto
4. Establecer cantidad disponible
5. Guardar

### Actualizar precio de producto
1. Buscar el producto en la tabla
2. Clic en botón de editar
3. Modificar el campo de precio
4. Guardar cambios

### Marcar producto como agotado
1. Buscar el producto
2. Editar
3. Establecer "Disponibles" en 0
4. Guardar

### Eliminar producto descontinuado
1. Buscar el producto
2. Clic en botón eliminar
3. Confirmar eliminación

## Mejoras Futuras Sugeridas

1. **Gestión de Categorías**: CRUD completo de categorías
2. **Carga de Imágenes**: Subir imágenes directamente (AWS S3, Cloudinary)
3. **Estadísticas**: Dashboard con métricas y gráficos
4. **Gestión de Pedidos**: Administrar pedidos de clientes
5. **Gestión de Reservas**: Administrar reservas de productos
6. **Historial de Cambios**: Auditoría de modificaciones
7. **Búsqueda y Filtros**: Filtrar productos por categoría, disponibilidad
8. **Exportar Datos**: Exportar catálogo a CSV/Excel
9. **Múltiples Administradores**: Gestión de usuarios admin
10. **Modo Borrador**: Productos en borrador antes de publicar

## Solución de Problemas

### No puedo acceder a /admin
- Verifica que estés autenticado
- Verifica que tu usuario tenga rol `admin` en la base de datos
- Revisa la configuración de `OWNER_OPEN_ID` en `.env`

### Error al crear/editar producto
- Verifica la conexión a la base de datos
- Revisa los logs del servidor para detalles del error
- Asegúrate de que todos los campos obligatorios estén completos

### Error "Database not available"
- Verifica que `DATABASE_URL` esté configurado correctamente en `.env`
- Verifica que la base de datos MySQL esté en ejecución
- Verifica las credenciales de conexión

## Contacto y Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0.0
