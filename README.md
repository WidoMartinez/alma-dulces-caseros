# Alma - Dulces Caseros Artesanales 🍰

Sitio web para Alma Dulces Caseros, una tienda de repostería artesanal en Temuco, Araucanía, Chile.

## Características Principales

### Para Clientes
- 🛍️ **Catálogo de Productos**: Explora productos organizados por categorías
- 🛒 **Carrito de Compras**: Agrega productos y gestiona tu pedido
- 📅 **Sistema de Reservas**: Reserva productos para fechas específicas
- 💳 **Proceso de Pago**: Sistema de pago integrado
- 📧 **Notificaciones por Email**: Confirmaciones y actualizaciones

### Para Administradores
- 🔐 **Panel Administrativo Seguro**: Acceso protegido con autenticación
- ➕ **Gestión de Productos**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- 📊 **Visualización de Inventario**: Control de stock en tiempo real
- 🏷️ **Gestión por Categorías**: Organiza productos eficientemente

## Tecnologías Utilizadas

### Frontend
- **React 19** con TypeScript
- **Wouter** - Routing ligero
- **TanStack Query** - Gestión de estado del servidor
- **Radix UI** - Componentes UI accesibles
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones
- **Sonner** - Notificaciones toast

### Backend
- **Node.js** con Express
- **tRPC** - API type-safe
- **Drizzle ORM** - ORM TypeScript-first
- **MySQL** - Base de datos
- **Jose** - Autenticación JWT
- **PHPMailer** (externo) - Sistema de emails

### DevOps
- **Vite** - Build tool y dev server
- **TypeScript** - Type safety
- **Prettier** - Formateo de código
- **Vitest** - Testing

## Estructura del Proyecto

```
alma-dulces-caseros/
├── client/               # Frontend React
│   └── src/
│       ├── components/   # Componentes reutilizables
│       ├── pages/        # Páginas de la aplicación
│       │   ├── Home.tsx      # Página principal
│       │   └── Admin.tsx     # Panel administrativo
│       └── hooks/        # Custom hooks
├── server/               # Backend Node.js
│   ├── _core/           # Núcleo del servidor
│   ├── db.ts            # Funciones de base de datos
│   └── routers.ts       # Definiciones de rutas tRPC
├── drizzle/             # Migraciones y esquemas DB
│   └── schema.ts        # Esquema de base de datos
├── shared/              # Código compartido cliente/servidor
└── docs/                # Documentación
    └── ADMIN.md         # Guía del panel administrativo
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- MySQL 8.0 o superior
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/WidoMartinez/alma-dulces-caseros.git
cd alma-dulces-caseros

# Instalar dependencias
npm install --legacy-peer-deps
# o con pnpm
pnpm install
```

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces

# Autenticación (JWT)
JWT_SECRET=tu-secreto-jwt-muy-seguro-aqui

# Producción
NODE_ENV=production

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# APIs (opcional)
BUILT_IN_FORGE_API_URL=url-api
BUILT_IN_FORGE_API_KEY=api-key
```

**Nota:** El sistema ya NO requiere OAuth. La autenticación se maneja localmente con usuario/contraseña.

### Configurar Base de Datos

```bash
# Generar migraciones y aplicarlas
npm run db:push
```

### Crear Usuario Administrador

Después de configurar la base de datos, crea el primer usuario administrador:

```bash
# Sintaxis: node create-admin.mjs <username> <email> <password> [nombre]
node create-admin.mjs admin admin@alma-dulces.cl MiPassword123 "Administrador"
```

Este script creará un usuario con rol de administrador que podrá acceder al panel de administración.

### Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

### Compilar para Producción

```bash
# Construir aplicación
npm run build

# Iniciar en producción
npm start
```

## Panel Administrativo

El sistema incluye un panel administrativo completo para gestionar productos con autenticación local segura.

### Acceso
- **URL de Login**: `/login`
- **URL del Panel**: `/admin`
- **Requisitos**: Usuario con rol `admin` creado con el script `create-admin.mjs`

### Sistema de Autenticación
- 🔐 **Login Local**: Sin dependencias de OAuth externos
- 🔑 **Contraseñas Seguras**: Hash con bcrypt (12 salt rounds)
- 🛡️ **Protección contra Fuerza Bruta**: Rate limiting (5 intentos cada 15 minutos)
- 🎫 **Sesiones JWT**: Tokens firmados con clave secreta
- ⏱️ **Sesiones Persistentes**: Duración de 1 año

### Funcionalidades
- ✅ Ver todos los productos
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Gestionar inventario
- ✅ Asignar categorías

### Primer Inicio de Sesión

1. Crea un usuario administrador con el script:
   ```bash
   node create-admin.mjs admin admin@alma-dulces.cl MiPassword123 "Administrador"
   ```

2. Accede a `/login` en tu navegador

3. Ingresa las credenciales creadas

4. Serás redirigido al panel de administración en `/admin`

Para más detalles, consulta la [Guía del Panel Administrativo](./docs/ADMIN.md)

## Base de Datos

### Esquema Principal

**Tablas:**
- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `products` - Productos del catálogo
- `orders` - Pedidos de clientes
- `orderItems` - Ítems de cada pedido
- `reservations` - Reservas de productos

### Roles de Usuario
- **user** - Usuario normal (cliente)
- **admin** - Administrador del sistema

## API (tRPC)

### Endpoints Públicos
```typescript
// Productos
trpc.products.list.useQuery()
trpc.products.getById.useQuery(id)

// Categorías
trpc.categories.list.useQuery()

// Autenticación
trpc.auth.me.useQuery()              // Obtener usuario actual
trpc.auth.login.mutate({             // Iniciar sesión
  usernameOrEmail: "admin",
  password: "password123"
})
trpc.auth.logout.mutate()            // Cerrar sesión
```

### Endpoints Protegidos (Requieren autenticación)
```typescript
// Pedidos
trpc.orders.list.useQuery()

// Reservas
trpc.reservations.list.useQuery()
```

### Endpoints Administrativos (Requieren rol admin)
```typescript
// Productos
trpc.admin.products.create.mutate(data)
trpc.admin.products.update.mutate(data)
trpc.admin.products.delete.mutate(id)
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm start            # Iniciar servidor en producción

# Calidad de código
npm run check        # Verificar tipos TypeScript
npm run format       # Formatear código con Prettier
npm run test         # Ejecutar tests

# Base de datos
npm run db:push      # Aplicar migraciones
```

## Despliegue

### Backend (Render.com)
El backend está configurado para desplegarse en Render.com. Asegúrate de:
1. Configurar las variables de entorno en Render
2. Conectar la base de datos MySQL
3. El sistema de emails (PHPMailer) debe estar configurado en Hostinger

### Frontend
El frontend se despliega automáticamente como activo estático junto con el backend.

## Seguridad

- ✅ **Autenticación Local**: Sin dependencias externas de OAuth
- ✅ **Hash de Contraseñas**: Bcrypt con 12 salt rounds
- ✅ **Sesiones JWT**: Tokens firmados con clave secreta (HS256)
- ✅ **Rate Limiting**: Protección contra fuerza bruta (5 intentos/15 min)
- ✅ **Protección de Rutas por Rol**: Middleware de autorización
- ✅ **Validación de Entrada**: Zod para validar datos
- ✅ **Sanitización de Datos**: Prevención de inyección SQL con Drizzle ORM
- ✅ **HTTPS en Producción**: Comunicación encriptada
- ✅ **Cookies Seguras**: httpOnly, secure, sameSite

## Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles

## Contacto

**Alejandra Sáez** - Alma Dulces Caseros  
📍 Temuco, Araucanía, Chile  
📧 Email: info@alma-dulces.cl  

---

Hecho con ❤️ por Alejandra Sáez en Temuco, Chile
