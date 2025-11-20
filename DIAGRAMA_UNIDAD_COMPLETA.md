# Diagrama de Flujo - Opción Unidad Completa

## Estructura de Base de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                      TABLA: products                         │
├─────────────────────────────────────────────────────────────┤
│ • id                                                         │
│ • name                                                       │
│ • price (precio porción/unidad)              ← EXISTENTE   │
│ • hasWholeOption (0/1)                       ← NUEVO ✨     │
│ • wholePrice (precio unidad completa)        ← NUEVO ✨     │
│ • wholeName (nombre personalizado)           ← NUEVO ✨     │
│ • ... otros campos                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│   orderItems         │              │  reservationItems    │
├──────────────────────┤              ├──────────────────────┤
│ • productId          │              │ • productId          │
│ • quantity           │              │ • quantity           │
│ • priceAtPurchase    │              │ • isWholeUnit (=1)   │
│ • isWholeUnit (0/1)  │◄─ NUEVO ✨   │   SIEMPRE COMPLETO   │
└──────────────────────┘              └──────────────────────┘
```

## Flujo de Compra Regular

```
┌─────────────────────────────────────────────────────────────┐
│                    CATÁLOGO DE PRODUCTOS                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ¿Producto tiene hasWholeOption = 1?
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   SÍ                  NO
                    │                   │
                    ▼                   ▼
        ┌────────────────────┐    Mostrar solo
        │  Mostrar Selector  │    precio normal
        │  ┌──────────────┐  │
        │  │   Porción    │  │
        │  ├──────────────┤  │
        │  │   Completo   │  │
        │  └──────────────┘  │
        └────────────────────┘
                    │
                    ▼
        Usuario selecciona opción
                    │
                    ▼
        ┌────────────────────────┐
        │   Añadir al Carrito    │
        │                        │
        │  productId: 123        │
        │  quantity: 2           │
        │  isWholeUnit: true/    │
        │               false    │
        └────────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │       CARRITO          │
        │                        │
        │  ✓ Porción: $5 x 2     │
        │  ✓ Completo: $30 x 1   │
        │  (mismo producto puede │
        │   estar en ambas       │
        │   modalidades)         │
        └────────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │      CHECKOUT          │
        │                        │
        │  Cálculo correcto      │
        │  de precios según      │
        │  isWholeUnit           │
        └────────────────────────┘
```

## Flujo de Reservas (SOLO Completos)

```
┌─────────────────────────────────────────────────────────────┐
│                  MÓDULO DE RESERVAS                          │
│  ⚠️  Solo productos completos pueden ser reservados         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────┐
        │   Filtrar Productos            │
        │   WHERE hasWholeOption = 1     │
        │   AND wholePrice IS NOT NULL   │
        └────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────┐
        │  Lista de Productos Completos  │
        │                                │
        │  • Torta Completa - $30        │
        │  • Bandeja Galletas - $25      │
        │  (Solo opciones completas)     │
        └────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────┐
        │  Usuario Selecciona Producto   │
        │  + Cantidad                    │
        │  + Fecha de Entrega            │
        └────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────┐
        │  Crear Reserva                 │
        │                                │
        │  reservationItems:             │
        │  - productId: 123              │
        │  - quantity: 1                 │
        │  - isWholeUnit: 1 (SIEMPRE)   │
        └────────────────────────────────┘
```

## Panel de Administración

```
┌─────────────────────────────────────────────────────────────┐
│                  FORMULARIO DE PRODUCTO                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Nombre:         [____________________]                      │
│  Precio Porción: [____________________]                      │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  ¿Tiene opción completa?  [ ] No  [✓] Sí      │         │
│  │                                                 │         │
│  │  (Si está habilitado) ↓                        │         │
│  │                                                 │         │
│  │  Nombre Unidad Completa:                       │         │
│  │  [Torta Completa_____________]                 │         │
│  │                                                 │         │
│  │  Precio Unidad Completa:                       │         │
│  │  [30000__________________] CLP                 │         │
│  │                                                 │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│             [Cancelar]  [Guardar Producto]                  │
└─────────────────────────────────────────────────────────────┘
```

## Tabla de Productos (Admin)

```
┌─────┬──────────────┬────────────┬─────────────────┬─────────────────┐
│ ID  │ Nombre       │ Categoría  │ Precio Porción  │ Precio Completo │
├─────┼──────────────┼────────────┼─────────────────┼─────────────────┤
│ 1   │ Tarta Frutos │ Tartas     │ $5.00           │ $30.00          │
│ 2   │ Galletas     │ Galletas   │ $1.50           │ -               │
│ 3   │ Brownie      │ Brownies   │ $3.00           │ $20.00          │
└─────┴──────────────┴────────────┴─────────────────┴─────────────────┘
```

## Ejemplo de Producto en Catálogo

```
┌───────────────────────────────────────────────────┐
│            🍓 Tarta de Frutos Rojos               │
│                                                   │
│  Deliciosa tarta con frutos rojos frescos...     │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │  [ Porción ]  [ Unidad Completa ]       │     │
│  │  ────────────  ─────────────────        │     │
│  │   Activo         Inactivo               │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│         $5.00                                     │
│         Por porción                               │
│                                                   │
│  Cantidad: [−] 1 [+]                             │
│                                                   │
│  [🛒 Agregar al Carrito]                         │
└───────────────────────────────────────────────────┘

Usuario selecciona "Unidad Completa" ↓

┌───────────────────────────────────────────────────┐
│            🍓 Tarta de Frutos Rojos               │
│                                                   │
│  Deliciosa tarta con frutos rojos frescos...     │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │  [ Porción ]  [ Unidad Completa ]       │     │
│  │  ────────────  ─────────────────        │     │
│  │   Inactivo         Activo               │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│         $30.00                                    │
│         Unidad completa                           │
│                                                   │
│  Cantidad: [−] 1 [+]                             │
│                                                   │
│  [🛒 Agregar al Carrito]                         │
└───────────────────────────────────────────────────┘
```

## Resumen de Cambios por Archivo

```
📁 drizzle/
  └─ 0005_add_whole_unit_option.sql ✨ NUEVO
  └─ schema.ts                       ✏️  MODIFICADO

📁 server/
  └─ db.ts                           ✏️  MODIFICADO
  └─ routers.ts                      ✏️  MODIFICADO

📁 client/src/
  └─ pages/
     └─ Admin.tsx                    ✏️  MODIFICADO
     └─ Checkout.tsx                 ✏️  MODIFICADO
     └─ Home.tsx                     ✏️  MODIFICADO
  └─ components/
     └─ Cart.tsx                     ✏️  MODIFICADO
     └─ sections/
        └─ ProductsSection.tsx       ✏️  MODIFICADO
        └─ ReservationSection.tsx    ✏️  MODIFICADO

📁 docs/
  └─ IMPLEMENTACION_UNIDAD_COMPLETA.md ✨ NUEVO
  └─ DIAGRAMA_UNIDAD_COMPLETA.md       ✨ NUEVO
```

## Estados de Producto

```
Estado 1: Producto Tradicional (Sin opción completa)
┌────────────────────────────┐
│ hasWholeOption = 0         │
│ wholePrice = null          │
│ wholeName = null           │
│                            │
│ → Solo se vende por        │
│   porción/unidad           │
│ → NO aparece en reservas   │
└────────────────────────────┘

Estado 2: Producto con Opción Completa
┌────────────────────────────┐
│ hasWholeOption = 1         │
│ wholePrice = 30000         │
│ wholeName = "Completo"     │
│                            │
│ → Se vende por porción     │
│   O completo               │
│ → SÍ aparece en reservas   │
└────────────────────────────┘
```
