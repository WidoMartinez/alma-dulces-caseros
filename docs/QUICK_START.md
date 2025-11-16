# Guía Rápida - Panel Administrativo

## 🚀 Inicio Rápido

### Acceder al Panel Administrativo

1. **Inicia sesión en el sistema** (si no lo has hecho)
   - Dirígete a la página de login
   - Ingresa con tu cuenta autorizada

2. **Navega al panel administrativo**
   ```
   https://tu-dominio.com/admin
   ```

3. **Verifica tu acceso**
   - Si eres administrador, verás el panel completo
   - Si no tienes permisos, verás un mensaje de "Acceso Denegado"

### Configurar el Primer Administrador

Si eres el propietario y necesitas configurar tu cuenta como administrador:

1. Obtén tu `openId` del sistema de autenticación
2. Agrega la siguiente variable a tu archivo `.env`:
   ```env
   OWNER_OPEN_ID=tu-open-id-aqui
   ```
3. Reinicia el servidor
4. Inicia sesión nuevamente
5. Tu cuenta ahora tiene rol de administrador

## 📦 Gestionar Productos

### Crear un Nuevo Producto

1. Clic en el botón **"Nuevo Producto"** (esquina superior derecha)
2. Completa el formulario:
   - **Nombre**: Nombre del producto (requerido)
   - **Categoría**: Selecciona de la lista (requerido)
   - **Descripción**: Descripción detallada (opcional)
   - **Ingredientes**: Lista de ingredientes (opcional)
   - **Precio**: Precio en CLP (requerido)
   - **Disponibles**: Cantidad en stock (requerido)
   - **Orgánico**: Sí/No (requerido)
   - **URL Imagen**: Link a la imagen (opcional)
3. Clic en **"Crear Producto"**
4. Verás una notificación de éxito

### Editar un Producto

1. Encuentra el producto en la tabla
2. Clic en el botón **editar** (ícono de lápiz)
3. Modifica los campos necesarios
4. Clic en **"Actualizar Producto"**
5. Los cambios se reflejan inmediatamente

### Eliminar un Producto

1. Encuentra el producto en la tabla
2. Clic en el botón **eliminar** (ícono de papelera)
3. Confirma la eliminación en el diálogo
4. El producto se elimina permanentemente

⚠️ **Nota**: La eliminación es irreversible

## 💡 Consejos Prácticos

### Gestión de Inventario

**Marcar como agotado:**
- Edita el producto
- Establece "Disponibles" en `0`
- Guarda los cambios

**Reabastecer:**
- Edita el producto
- Aumenta el número en "Disponibles"
- Guarda los cambios

### Precios

- Los precios se ingresan en **pesos chilenos (CLP)**
- Usa solo números enteros (sin decimales)
- Ejemplo: 15000 = $15.000 CLP

### Imágenes

- Usa URLs de imágenes ya alojadas en internet
- Formatos recomendados: JPG, PNG
- Tamaño recomendado: 800x800 px
- Ejemplo: `https://ejemplo.com/producto.jpg`

### Categorías

Las categorías actuales son:
- Tartas
- Galletas
- Brownies
- Mermeladas

Para agregar nuevas categorías, contacta al equipo de desarrollo.

## 🔍 Solución Rápida de Problemas

### No puedo acceder a /admin
✅ **Solución**: Verifica que estés autenticado y tengas rol de admin

### Error al crear producto
✅ **Solución**: Asegúrate de completar todos los campos obligatorios

### La imagen no se muestra
✅ **Solución**: Verifica que la URL sea correcta y accesible públicamente

### Cambios no se guardan
✅ **Solución**: Revisa tu conexión a internet y la consola del navegador

## 📞 Soporte

¿Necesitas ayuda adicional?

- Consulta la [Guía Completa del Administrador](./ADMIN.md)
- Revisa el [README del Proyecto](../README.md)
- Contacta al equipo de desarrollo

## 🎯 Flujo de Trabajo Recomendado

### Agregar Producto Nuevo

```
1. Preparar información del producto
   ├─ Nombre
   ├─ Descripción
   ├─ Ingredientes
   ├─ Precio
   └─ Foto

2. Subir foto a servicio de hosting
   └─ Obtener URL pública

3. Ingresar a /admin

4. Clic en "Nuevo Producto"

5. Completar formulario

6. Guardar

7. Verificar en catálogo público
```

### Actualizar Precios Masivamente

```
1. Hacer lista de productos a actualizar

2. Para cada producto:
   ├─ Buscar en tabla
   ├─ Clic en editar
   ├─ Actualizar precio
   └─ Guardar

3. Verificar cambios en sitio público
```

### Preparar Productos Estacionales

```
1. Crear productos con stock en 0

2. Cuando sea la temporada:
   ├─ Editar producto
   ├─ Aumentar stock a cantidad disponible
   └─ Guardar

3. Cuando termine la temporada:
   ├─ Editar producto
   ├─ Reducir stock a 0
   └─ Guardar

(O eliminar el producto si no volverá)
```

## 🎨 Interfaz del Panel

### Barra Superior
- Logo y título del panel
- Tu nombre/email
- Botón "Inicio" (volver al sitio público)
- Botón "Cerrar Sesión"

### Tabla de Productos
- **ID**: Identificador único
- **Nombre**: Nombre del producto
- **Categoría**: Categoría asignada
- **Precio**: Precio formateado en CLP
- **Disponibles**: Cantidad en stock
- **Orgánico**: Sí/No
- **Acciones**: Botones editar y eliminar

### Botones de Acción
- 🟦 **Nuevo Producto**: Azul, esquina superior
- ✏️ **Editar**: Ícono de lápiz
- 🗑️ **Eliminar**: Ícono de papelera

### Notificaciones
- ✅ Verde: Operación exitosa
- ❌ Rojo: Error o problema

## 📊 Ejemplo de Caso de Uso

### Caso: Nueva Tarta de Temporada

**Contexto**: Quieres agregar una "Tarta de Fresas de Verano" al catálogo.

**Pasos**:

1. **Preparar información**
   ```
   Nombre: Tarta de Fresas de Verano
   Categoría: Tartas
   Descripción: Deliciosa tarta con fresas frescas de temporada
   Ingredientes: Fresas, crema, masa artesanal, azúcar
   Precio: 28000 (CLP)
   Disponibles: 5
   Orgánico: Sí
   ```

2. **Subir imagen**
   - Tomar foto del producto
   - Subir a servicio (Cloudinary, Imgur, etc.)
   - Copiar URL: `https://ejemplo.com/tarta-fresas.jpg`

3. **Crear en el sistema**
   - Ir a `/admin`
   - Clic "Nuevo Producto"
   - Llenar formulario con datos preparados
   - Pegar URL de imagen
   - Clic "Crear Producto"

4. **Verificar**
   - Ver notificación de éxito
   - Producto aparece en tabla
   - Ir al sitio público
   - Verificar que aparezca en catálogo

5. **Gestionar durante temporada**
   - Cuando se vendan unidades, reducir stock
   - Cuando termine temporada, reducir a 0 o eliminar

✅ **¡Listo!** Tu nuevo producto está disponible para los clientes.

---

**¿Tienes dudas?** Consulta la documentación completa o contacta soporte.
