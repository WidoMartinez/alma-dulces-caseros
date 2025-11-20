# Diagrama de Cambios - Módulo de Pedidos

## Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────┐
│                     PANEL ADMIN (/admin)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Productos │  │ Pedidos  │  │ Reservas │  │Despachos │   │
│  │          │  │  (NUEVO) │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                      │                                       │
│                      ▼                                       │
│            ┌──────────────────┐                             │
│            │OrdersManagement  │                             │
│            │   Component      │                             │
│            └──────────────────┘                             │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │ tRPC
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (tRPC)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  admin.orders.list (useQuery)                                │
│  ├─ Auth: adminProcedure ✓                                  │
│  ├─ Handler: getAllOrders() (NUEVO)                         │
│  └─ Returns: Order[] with items & users                     │
│                                                               │
│  admin.orders.updateStatus (useMutation)                     │
│  ├─ Auth: adminProcedure ✓                                  │
│  ├─ Handler: updateOrderStatus()                            │
│  └─ Input: { orderId, status }                              │
│                                                               │
└──────────────────────┬───────────────────────────────────────┘
                       │ Drizzle ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  orders                                                       │
│  ├─ id (PK)                                                  │
│  ├─ userId (FK, nullable)                                   │
│  ├─ trackingNumber (unique)                                 │
│  ├─ customerEmail                                            │
│  ├─ customerName                                             │
│  ├─ customerPhone                                            │
│  ├─ isGuest (0/1)                                           │
│  ├─ totalPrice                                               │
│  ├─ status (enum)                                            │
│  ├─ deliveryDate                                             │
│  ├─ deliveryAddress                                          │
│  ├─ notes                                                    │
│  ├─ createdAt                                                │
│  └─ updatedAt                                                │
│                                                               │
│  orderItems                                                   │
│  ├─ id (PK)                                                  │
│  ├─ orderId (FK)                                            │
│  ├─ productId (FK)                                          │
│  ├─ quantity                                                 │
│  └─ priceAtPurchase                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Carga Inicial de Pedidos

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │  useQuery()    │          │  SQL Query     │          │
│ Frontend ├───────────────►│ Backend  ├───────────────►│ Database │
│          │                │          │                │          │
│          │◄───────────────┤          │◄───────────────┤          │
│          │  Order[]       │          │  Rows          │          │
└──────────┘                └──────────┘                └──────────┘
     │
     │ React Query
     │ Cache
     ▼
┌──────────────────┐
│  Table           │
│  ├─ Tracking #   │
│  ├─ Cliente      │
│  ├─ Total        │
│  ├─ Items        │
│  ├─ Fecha        │
│  └─ Estado       │
└──────────────────┘
```

### 2. Actualización de Estado

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│          │  useMutation() │          │  UPDATE SQL    │          │
│ Frontend ├───────────────►│ Backend  ├───────────────►│ Database │
│          │  {orderId,     │          │                │          │
│          │   status}      │          │                │          │
│          │◄───────────────┤          │◄───────────────┤          │
│          │  {success}     │          │  OK            │          │
└──────────┘                └──────────┘                └──────────┘
     │
     │ invalidate()
     ▼
┌──────────────────┐
│ React Query      │
│ ├─ Clear cache   │
│ └─ Refetch data  │
└──────────────────┘
     │
     ▼
┌──────────────────┐
│ Table updates    │
│ automatically    │
└──────────────────┘
```

## Antes vs Después

### ANTES ❌

```typescript
// server/routers.ts
admin: router({
  orders: router({
    list: adminProcedure.query(async () => {
      // Por ahora retorna un array vacío, se puede implementar más adelante
      return [];  // ❌ No funcional
    }),
  }),
});

// Panel Admin
┌──────────────────────┐
│  Productos           │ ✅
├──────────────────────┤
│  Reservas            │ ✅
├──────────────────────┤
│  Despachos           │ ✅
├──────────────────────┤
│  Fechas Bloqueadas   │ ✅
└──────────────────────┘
        ❌ No hay gestión de pedidos
```

### DESPUÉS ✅

```typescript
// server/db.ts
export async function getAllOrders() {
  const db = await getDb();
  const allOrders = await db.select().from(orders);
  
  const ordersWithItems = await Promise.all(
    allOrders.map(async order => {
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      
      let user = null;
      if (order.userId) {
        user = await getUserById(order.userId);
      }

      return { ...order, items, user };
    })
  );

  return ordersWithItems;
}

// server/routers.ts
admin: router({
  orders: router({
    list: adminProcedure.query(async () => {
      return await getAllOrders();  // ✅ Funcional
    }),
  }),
});

// Panel Admin
┌──────────────────────┐
│  Productos           │ ✅
├──────────────────────┤
│  Pedidos (NUEVO)     │ ✅ ⭐
├──────────────────────┤
│  Reservas            │ ✅
├──────────────────────┤
│  Despachos           │ ✅
├──────────────────────┤
│  Fechas Bloqueadas   │ ✅
└──────────────────────┘
        ✅ Gestión completa de pedidos
```

## Estructura del Componente OrdersManagement

```
OrdersManagement.tsx
│
├─ Estado
│  ├─ searchTerm (búsqueda)
│  └─ statusFilter (filtro)
│
├─ Queries & Mutations
│  ├─ useQuery: admin.orders.list
│  └─ useMutation: admin.orders.updateStatus
│
├─ UI Components
│  ├─ Filtros
│  │  ├─ Input de búsqueda (tracking, cliente, email)
│  │  └─ Select de estado (all, pending, confirmed, etc.)
│  │
│  ├─ Tabla
│  │  ├─ TableHeader
│  │  │  ├─ Tracking Number
│  │  │  ├─ Cliente
│  │  │  ├─ Total
│  │  │  ├─ Items
│  │  │  ├─ Fecha Pedido
│  │  │  ├─ Fecha Entrega
│  │  │  ├─ Estado
│  │  │  └─ Acciones
│  │  │
│  │  └─ TableBody
│  │     └─ TableRow (por cada pedido)
│  │        ├─ Tracking (monospace)
│  │        ├─ Info Cliente (con badge si es invitado)
│  │        ├─ Total (formateado CLP)
│  │        ├─ Cantidad items
│  │        ├─ Fechas (con formato español)
│  │        ├─ Badge de estado (con color)
│  │        └─ Select para cambiar estado
│  │
│  └─ Resumen
│     ├─ Total filtrado / Total general
│     └─ Estadísticas por estado
│
└─ Lógica
   ├─ Filtrado (búsqueda + estado)
   ├─ Formateo de precios (CLP)
   ├─ Formateo de fechas (español)
   └─ Manejo de actualizaciones (toast + invalidate)
```

## Tipos de Datos

```typescript
// Orden completa retornada por getAllOrders()
type OrderWithDetails = {
  // Datos de la orden
  id: number;
  userId: number | null;
  trackingNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  isGuest: number; // 0 o 1
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  deliveryDate: Date | null;
  deliveryAddress: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Items del pedido
  items: OrderItem[];
  
  // Usuario (si no es invitado)
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
}
```

## Estados del Sistema

```
Estados de Pedido:
┌─────────────┬──────────────────────────┬─────────┐
│ Estado      │ Descripción              │ Color   │
├─────────────┼──────────────────────────┼─────────┤
│ pending     │ Pendiente confirmación   │ Amarillo│
│ confirmed   │ Confirmado por admin     │ Azul    │
│ shipped     │ Enviado al cliente       │ Púrpura │
│ delivered   │ Entregado exitosamente   │ Verde   │
│ cancelled   │ Cancelado                │ Rojo    │
└─────────────┴──────────────────────────┴─────────┘

Flujo típico:
pending → confirmed → shipped → delivered

Alternativo:
pending → cancelled
confirmed → cancelled
```

## Permisos y Seguridad

```
┌──────────────────────────────────────────┐
│         Middleware: adminProcedure       │
├──────────────────────────────────────────┤
│                                          │
│  1. Verificar autenticación              │
│     ├─ Usuario autenticado? ✓           │
│     └─ Token JWT válido? ✓              │
│                                          │
│  2. Verificar rol                        │
│     ├─ user.role === "admin"? ✓         │
│     └─ Si no, lanzar TRPCError ✗        │
│                                          │
│  3. Validar input (Zod)                  │
│     ├─ orderId: number ✓                │
│     └─ status: enum ✓                   │
│                                          │
│  4. Ejecutar operación                   │
│     └─ getAllOrders() o                 │
│        updateOrderStatus()               │
│                                          │
└──────────────────────────────────────────┘
```

## Resumen de Cambios

### Archivos Nuevos (2)
1. `client/src/components/OrdersManagement.tsx` - Componente UI
2. `VERIFICACION_MODULOS_ADMIN.md` - Documentación detallada

### Archivos Modificados (4)
1. `server/db.ts` - Función getAllOrders()
2. `server/routers.ts` - Endpoint admin.orders.list
3. `client/src/pages/Admin.tsx` - Tab de Pedidos
4. `README.md` - Documentación actualizada

### Líneas de Código
- **Backend**: ~45 líneas agregadas
- **Frontend**: ~280 líneas agregadas
- **Documentación**: ~650 líneas agregadas
- **Total**: ~975 líneas agregadas

### Impacto
- ✅ Funcionalidad crítica implementada
- ✅ Sin breaking changes
- ✅ Compatible con código existente
- ✅ Mejora significativa en gestión administrativa

---

**Versión**: 1.0.0  
**Autor**: GitHub Copilot  
**Fecha**: 2025-11-20
