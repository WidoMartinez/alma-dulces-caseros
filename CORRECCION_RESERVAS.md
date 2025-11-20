# Corrección de Problemas con Reservas

## Problema Reportado

Se identificaron tres problemas principales con el sistema de reservas:

1. **Las reservas se generan para un día anterior a la fecha seleccionada**
2. **No se respeta el día bloqueado configurado en el panel de administración**
3. **Las reservas no se guardan en la base de datos**

## Análisis de la Causa Raíz

### Problema 1: Fecha incorrecta (día anterior)

**Causa**: Manejo incorrecto de zonas horarias al convertir fechas de string a Date.

Cuando se usa `new Date("2024-01-15")` en JavaScript:
- La fecha se interpreta como UTC (2024-01-15 00:00:00 UTC)
- En Chile (UTC-3 o UTC-4), esto se convierte a 2024-01-14 21:00:00 (día anterior)

**Ejemplo del problema**:
```typescript
// ❌ Código problemático
const selectedDate = "2024-01-15"; // Del input type="date"
const date = new Date(selectedDate); // Se interpreta como UTC
// Resultado en Chile: 2024-01-14 21:00:00 (¡día anterior!)
```

### Problema 2: Fechas bloqueadas no se respetan

**Causa**: No existía endpoint para crear reservas, por lo que la validación nunca se ejecutaba.

La función `isDateAvailableForDispatch` ya existía y funciona correctamente, pero nunca se llamaba porque:
- El componente `ReservationSection.tsx` solo mostraba un toast
- No había endpoint `reservations.create` en el backend

### Problema 3: Reservas no se guardan

**Causa**: El botón "Confirmar Reserva" solo mostraba un mensaje de éxito, pero no llamaba a ninguna API.

```typescript
// ❌ Código original (línea 27 de ReservationSection.tsx)
const handleReserve = () => {
  // ... validaciones ...
  // Here we would submit the reservation  ← Comentario indicando que faltaba implementar
  toast.success("Reserva realizada exitosamente");  ← Solo mensaje, sin API
};
```

## Soluciones Implementadas

### 1. Corrección de Zonas Horarias

Se implementó un parser correcto en todos los lugares donde se procesan fechas:

```typescript
// ✅ Solución correcta
const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
const date = new Date(year, month - 1, day, 12, 0, 0);
// Se crea la fecha al mediodía local, evitando problemas de timezone
```

**Lugares corregidos**:
- ✅ `server/routers.ts` - endpoint `reservations.create`
- ✅ `server/routers.ts` - endpoint `orders.create` (deliveryDate)
- ✅ `server/routers.ts` - endpoint `addBlockedDate`
- ✅ `client/src/components/BlockedDatesManager.tsx`

### 2. Implementación de Endpoint de Creación de Reservas

**Backend (`server/db.ts`)**:
```typescript
export async function createReservation(reservationData: {
  userId: number;
  productId: number;
  quantity: number;
  reservedDate: Date;
  notes?: string;
}) {
  // Validación automática de fecha disponible
  const isAvailable = await isDateAvailableForDispatch(reservationData.reservedDate);
  if (!isAvailable) {
    throw new Error("La fecha seleccionada no está disponible para reservas");
  }
  
  // Insertar en base de datos
  // ...
}
```

**Router (`server/routers.ts`)**:
```typescript
reservations: router({
  create: protectedProcedure
    .input(z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      reservedDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Parsear fecha correctamente
      const [year, month, day] = input.reservedDate.split('T')[0].split('-').map(Number);
      const reservedDate = new Date(year, month - 1, day, 12, 0, 0);
      
      // Crear reserva con validación automática
      const reservation = await createReservation({
        userId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
        reservedDate,
        notes: input.notes,
      });
      
      return { success: true, reservation };
    }),
}),
```

### 3. Actualización del Componente ReservationSection

**Cambios principales**:

1. **Selección de producto**: Ahora se puede elegir qué producto reservar
2. **Integración con API**: Usa tRPC para crear la reserva
3. **Configuración dinámica**: Lee `minAdvanceDays` y `maxAdvanceDays` del servidor
4. **Estados de carga**: Muestra loading durante la creación
5. **Manejo de errores**: Muestra mensajes apropiados si algo falla

```typescript
// Frontend (client/src/components/sections/ReservationSection.tsx)
const createReservationMutation = trpc.reservations.create.useMutation({
  onSuccess: () => {
    toast.success("Reserva realizada exitosamente");
    // Limpiar formulario
  },
  onError: (error) => {
    toast.error(error.message || "Error al crear la reserva");
  },
});

const handleReserve = () => {
  createReservationMutation.mutate({
    productId: parseInt(selectedProductId),
    quantity,
    reservedDate: selectedDate,
    notes: notes.trim() || undefined,
  });
};
```

### 4. Validación de Fechas Bloqueadas

La función `isDateAvailableForDispatch` verifica:

1. **Fechas bloqueadas**: Consulta la tabla `blockedDates`
2. **Días de la semana**: Verifica que el día esté en `availableDays`
3. **Rango de anticipación**: Valida `minAdvanceDays` y `maxAdvanceDays`

```typescript
export async function isDateAvailableForDispatch(date: Date): Promise<boolean> {
  // 1. Verificar fechas bloqueadas
  const blockedDate = await db.select().from(blockedDates)
    .where(and(
      gte(blockedDates.date, dateStart),
      lte(blockedDates.date, dateEnd)
    ))
    .limit(1);
  
  if (blockedDate.length > 0) return false;
  
  // 2. Verificar día de la semana
  const settings = await getDispatchSettings();
  const availableDays = JSON.parse(settings.availableDays);
  const dayOfWeek = date.getDay();
  
  if (!availableDays.includes(dayOfWeek)) return false;
  
  // 3. Verificar rango de anticipación
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < settings.minAdvanceDays || diffDays > settings.maxAdvanceDays) {
    return false;
  }
  
  return true;
}
```

Esta función se llama automáticamente en `createReservation`, por lo que **todas las reservas respetan las fechas bloqueadas y la configuración de despachos**.

## Endpoint Público para Configuración

Se agregó un endpoint público para que usuarios no autenticados puedan ver las restricciones de fechas:

```typescript
dispatch: router({
  getSettings: publicProcedure.query(async () => {
    return await getDispatchSettings();
  }),
}),
```

Esto permite que el formulario de reservas muestre correctamente:
- Fecha mínima para reservar
- Fecha máxima para reservar
- Mensajes apropiados al usuario

## Cómo Probar la Corrección

### Prueba 1: Crear una reserva

1. Iniciar sesión en la aplicación
2. Ir a la sección "Reservas" en la página principal
3. Seleccionar un producto del dropdown
4. Seleccionar una fecha (debe estar entre minAdvanceDays y maxAdvanceDays)
5. Especificar cantidad
6. Hacer clic en "Confirmar Reserva"

**Verificar**:
- ✅ La reserva se guarda en la base de datos
- ✅ La fecha almacenada es la correcta (no el día anterior)
- ✅ El estado inicial es "pending"
- ✅ Se puede ver la reserva en el panel de admin

### Prueba 2: Fechas bloqueadas se respetan

1. Como admin, ir a "Fechas Bloqueadas"
2. Agregar una fecha futura (ej: mañana)
3. Salir del panel de admin
4. Intentar crear una reserva para esa fecha bloqueada

**Verificar**:
- ✅ La reserva falla con mensaje: "La fecha seleccionada no está disponible para reservas"

### Prueba 3: Días de la semana no laborables

1. Como admin, ir a "Configuración de Despachos"
2. Configurar solo Lunes-Viernes como disponibles (días 1-5)
3. Salir del panel de admin
4. Intentar crear una reserva para un sábado o domingo

**Verificar**:
- ✅ La reserva falla con mensaje de fecha no disponible

### Prueba 4: Rango de anticipación

1. Como admin, configurar `minAdvanceDays = 2` y `maxAdvanceDays = 30`
2. Intentar crear una reserva para mañana (solo 1 día de anticipación)

**Verificar**:
- ✅ La reserva falla porque no cumple el mínimo de 2 días

### Prueba 5: Pedidos con deliveryDate

1. Agregar productos al carrito
2. Ir a Checkout
3. Seleccionar una fecha de entrega
4. Completar el pedido

**Verificar**:
- ✅ La fecha de entrega en la base de datos es correcta
- ✅ No hay desfase de un día

## Consultas SQL para Verificar

```sql
-- Ver todas las reservas con sus fechas
SELECT 
  r.id, 
  r.reservedDate,
  DATE(r.reservedDate) as fecha_solo,
  u.name as usuario,
  p.name as producto,
  r.quantity,
  r.status
FROM reservations r
JOIN users u ON r.userId = u.id
JOIN products p ON r.productId = p.id
ORDER BY r.reservedDate DESC;

-- Ver fechas bloqueadas
SELECT 
  id,
  date,
  DATE(date) as fecha_solo,
  reason,
  createdAt
FROM blockedDates
ORDER BY date;

-- Ver configuración de despachos
SELECT * FROM dispatchSettings;

-- Ver pedidos con fecha de entrega
SELECT 
  id,
  trackingNumber,
  customerName,
  deliveryDate,
  DATE(deliveryDate) as fecha_solo,
  status
FROM orders
WHERE deliveryDate IS NOT NULL
ORDER BY deliveryDate DESC;
```

## Archivos Modificados

### Backend
1. `server/db.ts` - Agregada función `createReservation`
2. `server/routers.ts` - Tres cambios:
   - Nuevo endpoint `reservations.create`
   - Corrección de `orders.create` (deliveryDate)
   - Corrección de `addBlockedDate`
   - Nuevo endpoint público `dispatch.getSettings`

### Frontend
3. `client/src/components/sections/ReservationSection.tsx` - Reescrito completamente:
   - Agregada selección de producto
   - Integración con API tRPC
   - Configuración dinámica de fechas
   - Manejo de estados y errores
4. `client/src/components/BlockedDatesManager.tsx` - Corrección de envío de fecha

## Conclusión

Los tres problemas reportados han sido resueltos:

1. ✅ **Fechas correctas**: Se parsean correctamente evitando desfase de zona horaria
2. ✅ **Fechas bloqueadas respetadas**: La validación se ejecuta automáticamente en `createReservation`
3. ✅ **Reservas se guardan**: Endpoint completo implementado con toda la funcionalidad

Además, se agregaron mejoras:
- ✅ Selección de productos en reservas
- ✅ Configuración dinámica de fechas
- ✅ Validación robusta de fechas disponibles
- ✅ Manejo de errores apropiado
- ✅ Loading states en la UI
- ✅ Corrección preventiva en pedidos y fechas bloqueadas
