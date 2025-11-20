# Instrucciones para Aplicar Migraciones - Panel de Administración

## ⚠️ IMPORTANTE - Ejecutar Antes de Usar el Panel

Para que el nuevo panel de administración de reservas funcione correctamente, debes generar y aplicar las migraciones de base de datos.

## Pasos a Seguir

### 1. Asegúrate de tener configurada la base de datos

Verifica que tu archivo `.env` tenga la variable `DATABASE_URL` correctamente configurada:

```env
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces
```

### 2. Genera y aplica las migraciones

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm run db:push
```

Este comando hará lo siguiente:
- Generará las migraciones SQL para las nuevas tablas
- Aplicará las migraciones a la base de datos MySQL

### 3. Verifica que las tablas se crearon correctamente

Conéctate a tu base de datos MySQL y verifica que existan las siguientes tablas:

```sql
-- Verificar tabla dispatchSettings
SHOW TABLES LIKE 'dispatchSettings';

-- Verificar tabla blockedDates
SHOW TABLES LIKE 'blockedDates';

-- Ver estructura de las tablas
DESCRIBE dispatchSettings;
DESCRIBE blockedDates;
```

### 4. Inicia la aplicación

Una vez aplicadas las migraciones, puedes iniciar la aplicación:

```bash
# Modo desarrollo
npm run dev

# O modo producción
npm run build
npm start
```

## Tablas Creadas

### `dispatchSettings`
Almacena la configuración global de días y horarios de despacho.

**Campos:**
- `id`: ID autoincremental
- `availableDays`: JSON con días disponibles [0-6]
- `startTime`: Hora de inicio (HH:mm)
- `endTime`: Hora de fin (HH:mm)
- `minAdvanceDays`: Días mínimos de anticipación
- `maxAdvanceDays`: Días máximos de anticipación
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### `blockedDates`
Almacena fechas específicas bloqueadas para despacho (feriados, vacaciones).

**Campos:**
- `id`: ID autoincremental
- `date`: Fecha bloqueada
- `reason`: Razón del bloqueo
- `createdAt`: Fecha de creación

## Problemas Comunes

### Error: "DATABASE_URL is required"

**Solución**: Asegúrate de tener un archivo `.env` en la raíz del proyecto con la variable `DATABASE_URL` configurada.

### Error: "Access denied for user"

**Solución**: Verifica que el usuario y contraseña en `DATABASE_URL` sean correctos y tengan permisos para crear tablas.

### Error: "Can't connect to MySQL server"

**Solución**: 
1. Verifica que MySQL esté ejecutándose
2. Verifica que el host y puerto sean correctos en `DATABASE_URL`
3. Verifica que el firewall permita la conexión

## Configuración Inicial Automática

Cuando inicies el panel de administración por primera vez, se creará automáticamente una configuración predeterminada:

- **Días disponibles**: Lunes a Viernes (1-5)
- **Horario**: 09:00 - 18:00
- **Anticipación mínima**: 1 día
- **Anticipación máxima**: 30 días

Puedes modificar esta configuración desde el panel de administración en `/admin` → pestaña "Despachos".

## Verificación del Sistema

Para verificar que todo funciona correctamente:

1. Inicia sesión con una cuenta de administrador
2. Navega a `/admin`
3. Cambia a la pestaña "Despachos"
4. Deberías ver la configuración predeterminada
5. Cambia a la pestaña "Fechas Bloqueadas"
6. Intenta agregar una fecha bloqueada
7. Cambia a la pestaña "Reservas"
8. Deberías ver una lista vacía (o las reservas existentes)

## Soporte

Si encuentras problemas al aplicar las migraciones, contacta al equipo de desarrollo.

---

**Fecha**: Noviembre 2025
