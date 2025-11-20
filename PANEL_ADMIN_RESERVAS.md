# Panel de Administración - Gestión de Reservas y Configuración de Despachos

## Descripción

Este documento describe las nuevas funcionalidades implementadas en el panel de administración para gestionar reservas y configurar días/horarios de despacho.

## Funcionalidades Implementadas

### 1. Gestión de Reservas

Ubicación: `/admin` → Pestaña "Reservas"

**Características:**
- Visualización de todas las reservas con información detallada del cliente y producto
- Filtros por estado: Pendiente, Confirmada, Cancelada, Completada
- Búsqueda por nombre de cliente, email o producto
- Actualización de estado de reservas
- Resumen de estadísticas de reservas

**Estados disponibles:**
- **Pendiente**: Reserva recién creada
- **Confirmada**: Reserva aprobada por el administrador
- **Completada**: Despacho realizado exitosamente
- **Cancelada**: Reserva cancelada

### 2. Configuración de Despachos

Ubicación: `/admin` → Pestaña "Despachos"

**Características:**
- Selección de días de la semana disponibles para despacho
- Configuración de horario de inicio y fin de despachos
- Definición de días de anticipación mínima y máxima para reservas

**Ejemplo de configuración:**
- Días disponibles: Lunes a Viernes
- Horario: 09:00 - 18:00
- Anticipación mínima: 1 día
- Anticipación máxima: 30 días

### 3. Gestión de Fechas Bloqueadas

Ubicación: `/admin` → Pestaña "Fechas Bloqueadas"

**Características:**
- Agregar fechas específicas no disponibles para despacho (feriados, vacaciones, etc.)
- Visualización de fechas bloqueadas ordenadas cronológicamente
- Eliminación de fechas bloqueadas
- Indicador visual de fechas pasadas

**Casos de uso:**
- Bloquear feriados nacionales
- Marcar días de vacaciones del negocio
- Cerrar fechas por eventos especiales

## Instalación y Configuración

### Paso 1: Generar Migraciones de Base de Datos

Las nuevas tablas `dispatchSettings` y `blockedDates` necesitan ser creadas en la base de datos.

```bash
# Generar y aplicar migraciones
npm run db:push
```

Este comando:
1. Genera las migraciones SQL basadas en el esquema de Drizzle
2. Aplica las migraciones a la base de datos MySQL

### Paso 2: Verificar Conexión a Base de Datos

Asegúrate de que el archivo `.env` tenga configurada correctamente la variable `DATABASE_URL`:

```env
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces
```

### Paso 3: Iniciar la Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Acceso al Panel

1. Inicia sesión con una cuenta de administrador
2. Navega a `/admin`
3. Utiliza las pestañas superiores para acceder a cada funcionalidad

**Nota**: Solo usuarios con rol `admin` pueden acceder al panel de administración.

## Estructura de Base de Datos

### Tabla `dispatchSettings`

```sql
CREATE TABLE dispatchSettings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  availableDays TEXT NOT NULL,        -- JSON array de días [0-6]
  startTime VARCHAR(5) NOT NULL,       -- Formato HH:mm
  endTime VARCHAR(5) NOT NULL,         -- Formato HH:mm
  minAdvanceDays INT NOT NULL,         -- Días mínimos de anticipación
  maxAdvanceDays INT NOT NULL,         -- Días máximos de anticipación
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### Tabla `blockedDates`

```sql
CREATE TABLE blockedDates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date TIMESTAMP NOT NULL,             -- Fecha bloqueada
  reason VARCHAR(255) NOT NULL,        -- Razón del bloqueo
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints (tRPC)

### Administrador

**Reservas:**
- `admin.reservations.list` - Listar todas las reservas
- `admin.reservations.updateStatus` - Actualizar estado de reserva

**Configuración de Despachos:**
- `admin.dispatchSettings.get` - Obtener configuración actual
- `admin.dispatchSettings.update` - Actualizar configuración
- `admin.dispatchSettings.getBlockedDates` - Listar fechas bloqueadas
- `admin.dispatchSettings.addBlockedDate` - Agregar fecha bloqueada
- `admin.dispatchSettings.removeBlockedDate` - Eliminar fecha bloqueada

### Público

**Validación de Disponibilidad:**
- `dispatch.checkAvailability` - Verificar si una fecha está disponible para despacho

## Validación de Disponibilidad

La función `isDateAvailableForDispatch` valida automáticamente:

1. ✅ Que la fecha no esté en la lista de fechas bloqueadas
2. ✅ Que el día de la semana esté en los días disponibles
3. ✅ Que esté dentro del rango de anticipación mínima y máxima

## Seguridad

- Todos los endpoints administrativos requieren autenticación
- Solo usuarios con rol `admin` pueden acceder a las funcionalidades
- Middleware `adminProcedure` valida permisos en cada request
- Validación de datos de entrada con Zod

## Componentes React

**Componentes creados:**
- `ReservationsManagement.tsx` - Gestión de reservas
- `DispatchSettings.tsx` - Configuración de despachos
- `BlockedDatesManager.tsx` - Gestión de fechas bloqueadas

**Componentes utilizados:**
- Radix UI para componentes accesibles
- date-fns para manejo de fechas (locale español)
- Tailwind CSS para estilos
- Sonner para notificaciones toast

## Desarrollo Futuro

Posibles mejoras:
- [ ] Notificaciones por email cuando cambia el estado de una reserva
- [ ] Exportación de reservas a CSV/Excel
- [ ] Dashboard con estadísticas y gráficos
- [ ] Calendario visual para gestión de reservas
- [ ] Validación de disponibilidad al crear reservas desde el frontend público
- [ ] Límite de reservas por día/horario

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

---

**Implementado por**: GitHub Copilot  
**Fecha**: Noviembre 2025  
**Versión**: 1.0.0
