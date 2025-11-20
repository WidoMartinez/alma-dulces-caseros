# Implementación de Opción de Unidad Completa

## Resumen

Se ha implementado la funcionalidad de **unidad completa** para productos, permitiendo que un mismo producto pueda venderse tanto por porción como en su versión completa, cada uno con precio diferente y configurables desde el panel de administración.

## Cambios en Base de Datos

### Nueva Migración: `0005_add_whole_unit_option.sql`

Se añadieron los siguientes campos:

#### Tabla `products`:
- **`hasWholeOption`** (tinyint): Indica si el producto tiene opción de unidad completa (0 = No, 1 = Sí)
- **`wholePrice`** (int): Precio de la unidad completa en centavos
- **`wholeName`** (varchar): Nombre descriptivo para la unidad completa (ej: "Torta Completa", "Bandeja Completa")

#### Tabla `orderItems`:
- **`isWholeUnit`** (tinyint): Indica si el item comprado es unidad completa (0 = Porción, 1 = Completo)

#### Tabla `reservationItems`:
- **`isWholeUnit`** (tinyint): Para reservas, siempre debe ser 1 (solo se permiten reservas de unidades completas)

## Cambios en Backend

### Schema de Drizzle (`drizzle/schema.ts`)
- Añadidos nuevos campos a los tipos `Product`, `OrderItem` y `ReservationItem`
- Documentación actualizada para cada campo

### Base de Datos (`server/db.ts`)
- Actualizada función `createOrder` para manejar el campo `isWholeUnit` en items

### Routers (`server/routers.ts`)
- Actualizado esquema de validación para `orders.create` para incluir `isWholeUnit`
- Actualizado esquema de validación para `admin.products.create` y `admin.products.update` para incluir los nuevos campos de unidad completa

## Cambios en Frontend

### Panel de Administración (`client/src/pages/Admin.tsx`)
Se añadió una nueva sección en el formulario de productos:

1. **Toggle "¿Tiene opción completa?"**: Habilita/deshabilita la funcionalidad
2. **Campo "Nombre de Unidad Completa"**: Permite personalizar el nombre (ej: "Torta Completa")
3. **Campo "Precio Unidad Completa"**: Define el precio para la unidad completa
4. **Tabla actualizada**: Ahora muestra tanto "Precio Porción" como "Precio Completo"

### Catálogo de Productos (`client/src/components/sections/ProductsSection.tsx`)
- Añadido selector de opción (Porción vs Completo) para productos con `hasWholeOption` habilitado
- El precio se actualiza dinámicamente según la opción seleccionada
- Estado `isWholeUnit` se rastrea por producto

### Carrito de Compras (`client/src/components/Cart.tsx`)
- Ahora muestra si un item es "Porción" o "Completo"
- Calcula el precio correcto según la opción seleccionada
- Permite tener el mismo producto en ambas modalidades en el carrito

### Checkout (`client/src/pages/Checkout.tsx`)
- Calcula el total usando el precio correcto (porción o completo)
- Envía `isWholeUnit` al backend al crear la orden

### Módulo de Reservas (`client/src/components/sections/ReservationSection.tsx`)

**Cambio importante**: Las reservas ahora están **restringidas solo a productos completos**

1. Se filtra la lista de productos para mostrar solo aquellos con `hasWholeOption` habilitado
2. Los precios mostrados son siempre de unidad completa
3. Se añadió mensaje informativo: "Las reservas solo están disponibles para productos completos"
4. Al agregar al carrito de reservas, siempre se usa `wholePrice`

## Flujo de Usuario

### Compra Regular (Catálogo)
1. Usuario ve un producto con opción completa
2. Puede elegir entre "Porción" y "Completo" (o el nombre personalizado)
3. El precio se actualiza automáticamente
4. Al agregar al carrito, se guarda la opción seleccionada
5. En el checkout se procesa con el precio correcto

### Reservas
1. Usuario accede a la sección de reservas
2. Solo ve productos que tienen opción completa habilitada
3. Los productos se muestran con su precio completo
4. No puede seleccionar porciones (solo completos)
5. La reserva se crea con `isWholeUnit = 1`

## Migración de Base de Datos

Para aplicar los cambios en la base de datos:

```bash
# Generar y aplicar migraciones
npm run db:push
```

O ejecutar manualmente el archivo SQL:
```bash
mysql -u [usuario] -p [nombre_base_datos] < drizzle/0005_add_whole_unit_option.sql
```

## Consideraciones

1. **Productos Existentes**: Por defecto, todos los productos existentes tendrán `hasWholeOption = 0`, por lo que no se verán afectados
2. **Compatibilidad Hacia Atrás**: Los productos sin opción completa funcionan exactamente igual que antes
3. **Validación**: Si `hasWholeOption = 1`, se requiere que `wholePrice` tenga un valor
4. **Reservas**: Solo productos con `hasWholeOption = 1` y `wholePrice` definido aparecerán en el módulo de reservas

## Testing

Para probar la funcionalidad:

1. **Crear un producto con opción completa**:
   - Ir al panel de administración
   - Crear/editar un producto
   - Habilitar "¿Tiene opción completa?"
   - Definir nombre y precio de unidad completa
   - Guardar

2. **Verificar en catálogo**:
   - El producto debe mostrar el selector Porción/Completo
   - El precio debe cambiar al seleccionar cada opción

3. **Verificar en carrito**:
   - Agregar ambas opciones del mismo producto
   - Deben aparecer como items separados
   - Precios deben calcularse correctamente

4. **Verificar en reservas**:
   - Solo el producto con opción completa debe aparecer
   - Debe mostrar el precio completo
   - Al reservar, debe usar el precio completo

## Próximos Pasos

- [ ] Añadir validación de stock separado para porciones y unidades completas (opcional)
- [ ] Añadir estadísticas en admin sobre ventas de porciones vs completos
- [ ] Permitir configurar ratio de conversión (ej: 1 completo = 8 porciones)
