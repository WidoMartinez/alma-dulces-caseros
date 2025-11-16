# Guía de Usuario - Sistema de Compras

## 📋 Contenido

- [Registro de Cliente](#registro-de-cliente)
- [Iniciar Sesión](#iniciar-sesión)
- [Realizar una Compra](#realizar-una-compra)
- [Compra como Invitado](#compra-como-invitado)
- [Seguimiento de Pedidos](#seguimiento-de-pedidos)
- [Gestión de Perfil](#gestión-de-perfil)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Registro de Cliente

### Crear una Cuenta

1. **Acceder al Registro**
   - Desde la página principal, haz clic en "Registrarse" en la navegación
   - O accede directamente a `/register`

2. **Completar el Formulario**
   - **Nombre Completo** *: Tu nombre y apellido
   - **Nombre de Usuario** *: Único, mínimo 3 caracteres
   - **Email** *: Dirección de correo válida
   - **Teléfono**: Opcional, para contacto
   - **Contraseña** *: Mínimo 6 caracteres
   - **Confirmar Contraseña** *: Debe coincidir con la contraseña

3. **Completar Registro**
   - Haz clic en "Crear Cuenta"
   - Serás redirigido al login
   - Inicia sesión con tus credenciales

### Beneficios de Tener una Cuenta

- ✅ Checkout más rápido con datos guardados
- ✅ Historial completo de pedidos
- ✅ Seguimiento fácil de todos tus pedidos
- ✅ Dirección de entrega guardada
- ✅ Gestión de perfil

---

## Iniciar Sesión

### Acceso a tu Cuenta

1. **Página de Login**
   - Haz clic en "Ingresar" en la navegación
   - O accede a `/login`

2. **Credenciales**
   - Ingresa tu **Usuario o Email**
   - Ingresa tu **Contraseña**
   - Haz clic en "Iniciar Sesión"

3. **Roles de Usuario**
   - **Cliente**: Acceso a perfil y compras
   - **Administrador**: Acceso al panel de administración

### Problemas de Acceso

- Si olvidas tu contraseña, contacta al soporte
- Verifica que tus credenciales sean correctas
- Espera 15 minutos si excedes los intentos permitidos

---

## Realizar una Compra

### Proceso de Compra (Cliente Registrado)

#### 1. Agregar Productos al Carrito

- Navega por los productos en la sección "Productos"
- Haz clic en "Agregar al Carrito"
- El contador del carrito se actualizará

#### 2. Revisar el Carrito

- Haz clic en el ícono del carrito
- Revisa los productos agregados
- Puedes eliminar productos si lo deseas
- Verifica el total

#### 3. Proceder al Checkout

- Haz clic en "Proceder al Pago"
- Serás llevado a la página de checkout

#### 4. Información de Entrega

El formulario se pre-llenará con tus datos guardados:

- **Nombre Completo**: Verificar/editar
- **Email**: Tu email de contacto
- **Teléfono**: Para coordinar la entrega
- **Dirección de Entrega**: Dirección completa
- **Fecha de Entrega Deseada**: Opcional
- **Notas Adicionales**: Instrucciones especiales

#### 5. Confirmar Pedido

- Revisa el resumen del pedido
- Verifica el total
- Haz clic en "Confirmar Pedido"

#### 6. Confirmación

- Recibirás un **número de seguimiento** único
- Formato: `ALMA-XXXXX-YYYY`
- Guarda este número para seguimiento
- Serás redirigido a la página de seguimiento

---

## Compra como Invitado

### Proceso sin Registro

Si no deseas crear una cuenta, puedes comprar como invitado:

#### 1. Agregar Productos
- Igual que un cliente registrado

#### 2. Checkout como Invitado
- En la página de checkout, completa todos los campos manualmente:
  - Nombre completo
  - Email (para confirmación)
  - Teléfono (opcional)
  - Dirección de entrega completa
  - Fecha de entrega deseada (opcional)
  - Notas (opcional)

#### 3. Confirmar y Seguimiento
- Recibirás tu número de seguimiento
- Guárdalo para consultar el estado
- Recibirás un email de confirmación

### Nota Importante
Como invitado:
- ❌ No tendrás historial de pedidos guardado
- ❌ Deberás ingresar datos en cada compra
- ✅ Puedes seguir tu pedido con el número de seguimiento

---

## Seguimiento de Pedidos

### Consultar Estado del Pedido

#### Acceso al Seguimiento

**Opción 1: Desde el Footer**
- En la página principal, busca "Enlaces Rápidos" en el footer
- Haz clic en "Seguir mi pedido"

**Opción 2: URL Directa**
- Accede a `/track-order`

**Opción 3: Desde tu Perfil**
- Si estás registrado, ve a "Mi Cuenta"
- Haz clic en cualquier pedido de tu historial

#### Búsqueda por Número de Seguimiento

1. Ingresa tu número de seguimiento
   - Formato: `ALMA-XXXXX-YYYY`
   - No distingue mayúsculas/minúsculas

2. Haz clic en "Buscar"

3. Verás la información completa:
   - **Estado actual** del pedido
   - Fecha de creación
   - Detalles del pedido
   - Productos y cantidades
   - Total pagado
   - Dirección de entrega
   - Notas del pedido

### Estados del Pedido

| Estado | Descripción | Icono |
|--------|-------------|-------|
| **Pendiente** | Tu pedido ha sido recibido y está siendo procesado | ⏱️ |
| **Confirmado** | Tu pedido ha sido confirmado y está en preparación | ✅ |
| **En Camino** | Tu pedido está en camino a tu dirección | 🚚 |
| **Entregado** | Tu pedido ha sido entregado exitosamente | ✅ |
| **Cancelado** | Este pedido ha sido cancelado | ❌ |

### Notificaciones

- Recibirás emails cuando cambie el estado de tu pedido
- Puedes consultar el estado en cualquier momento con tu número de seguimiento

---

## Gestión de Perfil

### Acceso a tu Perfil

- Haz clic en "Mi Cuenta" en la navegación
- O accede a `/profile`

### Información del Perfil

#### Datos no Editables
- **Nombre de Usuario**: Fijo después del registro
- **Rol**: Asignado por el sistema

#### Datos Editables

1. **Haz clic en "Editar Perfil"**

2. **Actualiza la información:**
   - Nombre completo
   - Email
   - Teléfono
   - Dirección de entrega predeterminada

3. **Guarda los cambios:**
   - Haz clic en "Guardar"
   - Los datos se actualizarán inmediatamente
   - Se usarán en tus próximas compras

### Historial de Pedidos

En tu perfil verás:
- Lista completa de todos tus pedidos
- Número de seguimiento de cada pedido
- Fecha de creación
- Estado actual
- Total pagado
- Número de productos

**Haz clic en cualquier pedido** para ver los detalles completos.

### Cerrar Sesión

- En la parte inferior del perfil
- Haz clic en "Cerrar Sesión"
- Serás desconectado de forma segura

---

## Preguntas Frecuentes

### General

**¿Necesito crear una cuenta para comprar?**
No, puedes comprar como invitado. Sin embargo, crear una cuenta te da beneficios adicionales.

**¿Es seguro mi información?**
Sí, todas las contraseñas están encriptadas y tu información está protegida.

### Compras

**¿Cómo funcionan los pagos?**
Actualmente los pagos se coordinan directamente con el equipo de Alma. Recibirás instrucciones por email.

**¿Puedo modificar mi pedido después de confirmarlo?**
Contacta lo antes posible para ver si es posible hacer cambios.

**¿Cuánto tarda la entrega?**
Varía según tu ubicación y disponibilidad. Se te informará al confirmar el pedido.

### Seguimiento

**Perdí mi número de seguimiento, ¿qué hago?**
- Si tienes cuenta, revisa tu perfil en el historial
- Si compraste como invitado, revisa el email de confirmación
- Contacta al soporte con tu email y fecha de compra

**¿Con qué frecuencia se actualiza el estado?**
El estado se actualiza manualmente por el equipo de Alma cuando hay cambios en tu pedido.

### Cuenta

**¿Cómo cambio mi contraseña?**
Esta funcionalidad estará disponible próximamente. Contacta al soporte si necesitas cambiarla.

**¿Puedo eliminar mi cuenta?**
Contacta al soporte para solicitar la eliminación de tu cuenta.

**¿Puedo tener múltiples cuentas?**
No es necesario ni recomendado. Una cuenta es suficiente para todas tus compras.

---

## Contacto y Soporte

### Información de Contacto

- **Email**: info@alma-dulces.cl
- **Ubicación**: Temuco, Araucanía, Chile
- **Horario**: Consulta disponibilidad por email

### Redes Sociales

- Instagram: [Instagram de Alma]
- Facebook: [Facebook de Alma]

---

## Consejos y Recomendaciones

### Para una Mejor Experiencia

✅ **Crea una cuenta** para hacer el checkout más rápido
✅ **Guarda tu número de seguimiento** en un lugar seguro
✅ **Verifica tu email** después de cada compra
✅ **Actualiza tu perfil** con datos correctos para facilitar la entrega
✅ **Revisa los estados** de tus pedidos regularmente

### Antes de Confirmar tu Pedido

- ✅ Verifica la dirección de entrega
- ✅ Confirma que el email sea correcto
- ✅ Revisa las cantidades de productos
- ✅ Lee las notas de entrega si las agregaste

---

**Última actualización**: 16 de Noviembre, 2024
**Versión del documento**: 1.0

*Alma - Dulces Caseros Artesanales*  
*Hecho con amor en Temuco, Chile* 🍰
