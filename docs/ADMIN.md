# Sistema Administrativo - Alma Dulces Caseros

## Descripción General

El sistema administrativo permite gestionar el catálogo de productos de manera segura y eficiente. Solo usuarios con rol de **administrador** pueden acceder a estas funcionalidades.

## Acceso al Panel Administrativo

### URLs de Acceso
- **Login**: `https://tu-dominio.com/login`
- **Panel Admin**: `https://tu-dominio.com/admin`

### Requisitos de Acceso
1. **Cuenta de administrador**: Debes tener una cuenta creada con rol `admin`
2. **Autenticación local**: Login con usuario/email y contraseña
3. **Sin OAuth**: El sistema ya NO depende de servicios externos de autenticación

### Crear el Primer Administrador

Usa el script `create-admin.mjs` para crear tu primer usuario administrador:

```bash
# Sintaxis
node create-admin.mjs <username> <email> <password> [nombre]

# Ejemplo
node create-admin.mjs admin admin@alma-dulces.cl MiPassword123 "Administrador Principal"
```

**Requisitos previos:**
- Base de datos configurada y conectada
- Variable `DATABASE_URL` en el archivo `.env`
- Variable `JWT_SECRET` en el archivo `.env`

### Iniciar Sesión

1. Navega a `/login` en tu navegador
2. Ingresa tu **username o email**
3. Ingresa tu **contraseña**
4. Haz clic en "Iniciar Sesión"
5. Serás redirigido automáticamente al panel de administración

### Cerrar Sesión

Haz clic en el botón "Cerrar Sesión" en la esquina superior derecha del panel administrativo.

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

### Sistema de Autenticación Local
- ✅ **Sin dependencias externas**: No requiere OAuth ni servicios de terceros
- ✅ **Hash seguro de contraseñas**: Bcrypt con 12 salt rounds
- ✅ **Tokens JWT**: Sesiones firmadas con clave secreta (algoritmo HS256)
- ✅ **Sesiones persistentes**: Duración de 1 año por defecto
- ✅ **Rate limiting**: Máximo 5 intentos de login cada 15 minutos
- ✅ **Protección contra fuerza bruta**: Límite de intentos por IP

### Protección de Rutas
- La ruta `/admin` está protegida por autenticación
- Solo usuarios con rol `admin` pueden acceder
- Usuarios no autenticados son redirigidos a `/login`
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
1. Que el usuario esté autenticado (token JWT válido)
2. Que el usuario tenga rol `admin`
3. Retorna error 403 (FORBIDDEN) si no cumple los requisitos

### Variables de Entorno Necesarias

```env
# Requeridas para autenticación
DATABASE_URL=mysql://usuario:pass@host:3306/base_datos
JWT_SECRET=tu-secreto-jwt-muy-seguro-aqui

# Opcional
PORT=3000
NODE_ENV=production
```

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
- Verifica que hayas iniciado sesión en `/login`
- Verifica que tu usuario tenga rol `admin` en la base de datos
- Limpia las cookies del navegador y vuelve a iniciar sesión
- Revisa los logs del servidor para errores de autenticación

### "Credenciales inválidas" al hacer login
- Verifica que el username/email sea correcto
- Verifica que la contraseña sea correcta (distingue mayúsculas)
- Asegúrate de haber creado el usuario con el script `create-admin.mjs`
- Revisa que `JWT_SECRET` esté configurado en `.env`

### "Demasiados intentos de inicio de sesión"
- El sistema tiene protección contra fuerza bruta
- Espera 15 minutos antes de intentar nuevamente
- O reinicia el servidor para resetear el contador

### No puedo crear el primer admin
- Verifica que `DATABASE_URL` esté configurado correctamente
- Verifica que la base de datos esté en ejecución
- Asegúrate de haber ejecutado las migraciones con `npm run db:push`
- Revisa que el username/email no exista ya en la base de datos

### Error al crear/editar producto
- Verifica la conexión a la base de datos
- Revisa los logs del servidor para detalles del error
- Asegúrate de que todos los campos obligatorios estén completos
- Verifica que el usuario tenga rol `admin`

### Error "Database not available"
- Verifica que `DATABASE_URL` esté configurado correctamente en `.env`
- Verifica que la base de datos MySQL esté en ejecución
- Verifica las credenciales de conexión
- Ejecuta `npm run db:push` para aplicar migraciones

### Sesión expirada
- Las sesiones duran 1 año por defecto
- Si la sesión expira, simplemente vuelve a iniciar sesión
- Limpia las cookies del navegador si tienes problemas

## Contacto y Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

## Cambios en el Sistema de Autenticación

### ⚠️ Migración desde OAuth

Este sistema anteriormente usaba OAuth externo (Manus). Ahora utiliza autenticación local.

**Cambios principales:**
- ❌ Ya NO se usa `OWNER_OPEN_ID`
- ❌ Ya NO se usa `OAUTH_SERVER_URL`
- ❌ Ya NO se usa `VITE_APP_ID` 
- ❌ Ya NO se usa `VITE_OAUTH_PORTAL_URL`
- ✅ Ahora se usa `JWT_SECRET`
- ✅ Usuarios creados localmente con username/password
- ✅ Login en `/login` en lugar de redirección externa

---

**Última actualización**: Noviembre 2024
**Versión**: 2.0.0 (Sistema de autenticación renovado)
