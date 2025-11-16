# Integración de Pasarela de Pago Flow

## 📋 Descripción General

Sistema completo de pagos online integrado con Flow, la pasarela de pagos líder en Chile. Permite a los clientes realizar compras seguras utilizando múltiples métodos de pago.

**Estado**: ✅ IMPLEMENTADO Y LISTO PARA PRUEBAS  
**Fecha**: 16 de Noviembre, 2024  
**Pasarela**: Flow Chile (https://www.flow.cl)

---

## 🎯 Características Implementadas

### Métodos de Pago Soportados por Flow

- 💳 **Webpay**: Tarjetas de crédito y débito
- 🏦 **Servipag**: Pago en efectivo en puntos Servipag
- 💰 **Multicaja**: Billetera digital
- 🌐 **Transferencia bancaria**
- Y más opciones disponibles en Flow

### Funcionalidades

✅ **Creación de órdenes de pago**
- Generación automática de orden en Flow
- ID de comercio único por transacción
- Redirección segura a Flow

✅ **Confirmación de pagos**
- Webhook para confirmación automática
- Verificación de firma de Flow
- Actualización de estado de orden

✅ **Seguimiento de transacciones**
- Registro completo en base de datos
- Estados: pending, completed, rejected, cancelled
- Información de método de pago utilizado

✅ **Experiencia de usuario**
- Páginas de éxito y error personalizadas
- Mensajes claros y descriptivos
- Redirección automática

---

## 🏗️ Arquitectura

### Flujo de Pago Completo

```
1. Usuario en Checkout
   ↓
2. Completa datos de entrega
   ↓
3. Click "Proceder al Pago"
   ↓
4. Backend crea orden en BD
   ↓
5. Backend crea orden de pago en Flow
   ↓
6. Flow retorna URL de pago + token
   ↓
7. Usuario es redirigido a Flow
   ↓
8. Usuario completa pago en Flow
   ↓
9. Flow confirma pago (webhook)
   ↓
10. Backend actualiza transacción y orden
    ↓
11. Usuario redirigido a página de éxito
    ↓
12. Email de confirmación (futuro)
```

### Componentes del Sistema

#### Backend

1. **`server/flow.ts`** - Servicio de integración Flow
   - `createFlowPayment()` - Crea orden de pago
   - `getFlowPaymentStatus()` - Consulta estado
   - `verifyFlowSignature()` - Valida webhook
   - Funciones de mapeo de estados

2. **`server/db.ts`** - Funciones de base de datos
   - `createPaymentTransaction()` - Crea transacción
   - `getPaymentTransactionByToken()` - Busca por token
   - `updatePaymentTransaction()` - Actualiza transacción
   - `getOrderById()` - Obtiene orden completa

3. **`server/routers.ts`** - Endpoints tRPC
   - `payment.create` - Crea orden de pago
   - `payment.confirm` - Confirma pago (webhook)
   - `payment.status` - Consulta estado

#### Frontend

1. **`client/src/pages/Checkout.tsx`** - Página de checkout
   - Formulario de datos de entrega
   - Integración con pago
   - Redirección a Flow

2. **`client/src/pages/PaymentSuccess.tsx`** - Página de éxito
   - Confirmación visual
   - Detalles de transacción
   - Enlaces de navegación

3. **`client/src/pages/PaymentError.tsx`** - Página de error
   - Mensajes de error claros
   - Opciones de reintento
   - Información de ayuda

#### Base de Datos

Tabla `paymentTransactions`:
```sql
CREATE TABLE paymentTransactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  flowToken VARCHAR(255),
  commerceOrder VARCHAR(64) NOT NULL,
  flowOrder VARCHAR(64),
  amount INT NOT NULL,
  status ENUM('pending', 'completed', 'rejected', 'cancelled'),
  paymentMethod VARCHAR(50),
  paymentData TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);
```

---

## 🔧 Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# Flow - Sandbox (Pruebas)
FLOW_API_KEY=tu-api-key-sandbox
FLOW_SECRET_KEY=tu-secret-key-sandbox
FLOW_API_URL=https://sandbox.flow.cl/api
FLOW_RETURN_URL=http://localhost:5000/payment/success
FLOW_CANCEL_URL=http://localhost:5000/payment/error

# Flow - Producción
# FLOW_API_KEY=tu-api-key-produccion
# FLOW_SECRET_KEY=tu-secret-key-produccion
# FLOW_API_URL=https://www.flow.cl/api
# FLOW_RETURN_URL=https://tudominio.com/payment/success
# FLOW_CANCEL_URL=https://tudominio.com/payment/error
```

### Obtener Credenciales de Flow

1. **Registrarse en Flow**: https://www.flow.cl
2. **Acceder al panel de comercio**
3. **Obtener API Key y Secret Key**
4. **Configurar URLs de retorno**:
   - URL de éxito: `https://tudominio.com/payment/success`
   - URL de confirmación (webhook): `https://tudominio.com/api/trpc/payment.confirm`

### Aplicar Migración

```bash
# Ejecutar migración SQL
mysql -u usuario -p nombre_base_datos < drizzle/0003_add_payment_transactions.sql

# O usar Drizzle Kit
npm run db:push
```

---

## 🚀 Uso

### Para Desarrolladores

#### Crear Orden de Pago

```typescript
const paymentResult = await trpc.payment.create.mutate({
  orderId: 123,
  amount: 25000, // en centavos
  customerEmail: "cliente@ejemplo.com",
  subject: "Pedido Alma Dulces - ALMA-123",
});

// Redirigir al usuario
window.location.href = paymentResult.paymentUrl;
```

#### Confirmar Pago (Webhook)

```typescript
// Flow llamará automáticamente a este endpoint
const confirmation = await trpc.payment.confirm.mutate({
  token: "flow-token-here",
  s: "firma-flow",
});
```

#### Consultar Estado

```typescript
const status = await trpc.payment.status.useQuery({
  token: "flow-token-here",
});

console.log(status.transaction.status); // 'completed', 'pending', etc.
```

### Para Usuarios

1. **Agregar productos al carrito**
2. **Ir a checkout**
3. **Completar datos de entrega**
4. **Click "Proceder al Pago"**
5. **Seleccionar método de pago en Flow**
6. **Completar pago**
7. **Recibir confirmación**

---

## 🔒 Seguridad

### Implementaciones de Seguridad

✅ **Firma HMAC-SHA256**
- Todas las peticiones a Flow están firmadas
- Verificación de firma en webhooks
- Secret Key nunca expuesto en frontend

✅ **Validación de Datos**
- Zod schemas en todos los endpoints
- Validación de montos y emails
- Verificación de existencia de órdenes

✅ **Idempotencia**
- Prevención de procesamiento duplicado
- Verificación de estado antes de actualizar
- Logs de todas las transacciones

✅ **HTTPS Obligatorio en Producción**
- Comunicación encriptada
- Cookies seguras
- URLs de webhook protegidas

### Manejo de Errores

```typescript
try {
  // Intentar crear pago
} catch (error) {
  // Log del error
  console.error("[Flow] Error:", error);
  
  // Mensaje al usuario
  toast.error("Error al procesar el pago");
  
  // No exponer detalles internos
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Error al crear orden de pago",
  });
}
```

---

## 🧪 Testing

### Modo Sandbox

Flow proporciona un entorno de pruebas (sandbox) para testing:

```env
FLOW_API_URL=https://sandbox.flow.cl/api
```

#### Tarjetas de Prueba

Flow proporciona tarjetas de prueba para simular pagos:

- **Pago exitoso**: [Ver documentación de Flow]
- **Pago rechazado**: [Ver documentación de Flow]
- **Timeout**: [Ver documentación de Flow]

### Tests Manuales Recomendados

1. **Flujo completo exitoso**
   - Crear orden
   - Completar pago en sandbox
   - Verificar confirmación
   - Verificar estado en BD

2. **Pago cancelado**
   - Crear orden
   - Cancelar en Flow
   - Verificar redirección a error
   - Verificar estado en BD

3. **Timeout**
   - Crear orden
   - Dejar expirar
   - Verificar manejo

4. **Webhook duplicado**
   - Simular llamada duplicada
   - Verificar idempotencia

---

## 📊 Estados de Transacción

### Estados de Flow

Flow utiliza estados numéricos:

| Estado | Descripción | Acción |
|--------|-------------|--------|
| 1 | Pendiente | Esperando pago |
| 2 | Pagado | Confirmar orden |
| 3 | Rechazado | Cancelar orden |
| 4 | Anulado | Cancelar orden |

### Mapeo a Estados Internos

#### Transacción
- `pending` - Pago iniciado pero no completado
- `completed` - Pago exitoso
- `rejected` - Pago rechazado
- `cancelled` - Pago cancelado/anulado

#### Orden
- `pending` - Esperando pago
- `confirmed` - Pago confirmado
- `cancelled` - Pago rechazado/cancelado

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error "Credenciales de Flow no configuradas"

**Causa**: Variables de entorno faltantes  
**Solución**:
```bash
# Verificar .env
echo $FLOW_API_KEY
echo $FLOW_SECRET_KEY

# Agregar si faltan
FLOW_API_KEY=tu-api-key
FLOW_SECRET_KEY=tu-secret-key
```

#### 2. Error "Firma inválida"

**Causa**: Secret Key incorrecto o parámetros mal ordenados  
**Solución**:
- Verificar Secret Key en Flow dashboard
- Verificar que generateSignature ordena alfabéticamente
- Verificar que todos los parámetros están incluidos

#### 3. Webhook no se ejecuta

**Causa**: URL de confirmación no configurada en Flow  
**Solución**:
- Ir a Flow dashboard
- Configurar URL de webhook: `https://tudominio.com/api/trpc/payment.confirm`
- Verificar que sea accesible públicamente
- Revisar logs del servidor

#### 4. Pago exitoso pero orden no se actualiza

**Causa**: Error en webhook o código de confirmación  
**Solución**:
```bash
# Ver logs del servidor
tail -f logs/server.log | grep "\[Flow\]"

# Verificar transacción en BD
SELECT * FROM paymentTransactions WHERE flowToken = 'token';

# Manualmente actualizar si es necesario
UPDATE orders SET status = 'confirmed' WHERE id = X;
UPDATE paymentTransactions SET status = 'completed' WHERE id = Y;
```

#### 5. Redirección a página incorrecta

**Causa**: URLs de retorno mal configuradas  
**Solución**:
- Verificar FLOW_RETURN_URL en .env
- Verificar que las rutas existen en App.tsx
- Verificar que Flow tiene las URLs correctas

---

## 📈 Monitoreo

### Logs Importantes

```bash
# Ver todos los logs de Flow
grep "\[Flow\]" logs/server.log

# Ver órdenes de pago creadas
grep "Creando orden de pago" logs/server.log

# Ver confirmaciones de pago
grep "Confirmando pago" logs/server.log

# Ver errores
grep "Error" logs/server.log | grep "\[Flow\]"
```

### Métricas a Monitorear

- **Tasa de conversión**: Pedidos creados vs pagos completados
- **Tasa de abandono**: Pedidos sin pago
- **Tiempo promedio**: Desde orden hasta pago
- **Errores**: Frecuencia y tipos
- **Métodos de pago**: Distribución por tipo

---

## 🔄 Flujos Especiales

### Reintento de Pago

Si un pago falla, el usuario puede:

1. Volver a checkout (productos aún en carrito)
2. Completar datos nuevamente
3. Iniciar nuevo intento de pago

**Nota**: Cada intento crea una nueva orden y transacción.

### Cancelación de Pago

1. Usuario cancela en Flow
2. Flow redirige a `/payment/error`
3. Orden permanece en estado `pending`
4. Transacción marcada como `cancelled`

---

## 📚 Referencias

### Documentación Oficial

- **Flow API**: https://www.flow.cl/docs/api.html
- **Flow Dashboard**: https://www.flow.cl/app/
- **Soporte Flow**: soporte@flow.cl

### Documentación Interna

- `README.md` - Documentación general del proyecto
- `docs/ADMIN.md` - Guía del panel administrativo
- `docs/CLIENTE.md` - Guía para usuarios
- `SISTEMA_CLIENTES.md` - Sistema de clientes y pedidos

---

## ✨ Próximos Pasos

### Corto Plazo

- [ ] **Testing exhaustivo en sandbox**
  - Probar todos los métodos de pago
  - Verificar webhooks
  - Probar casos extremos

- [ ] **Configuración de producción**
  - Obtener credenciales de producción
  - Configurar URLs de producción
  - Verificar certificados SSL

- [ ] **Emails de confirmación**
  - Integrar con PHPMailer
  - Plantilla de email
  - Envío automático

### Mediano Plazo

- [ ] **Panel admin para transacciones**
  - Ver todas las transacciones
  - Filtrar por estado
  - Exportar reportes

- [ ] **Reintentos automáticos**
  - Webhook retry logic
  - Queue para confirmaciones

- [ ] **Notificaciones en tiempo real**
  - WebSocket para actualizaciones
  - Push notifications

### Largo Plazo

- [ ] **Análisis avanzado**
  - Dashboard de métricas
  - Gráficos de conversión
  - Reportes financieros

- [ ] **Optimizaciones**
  - Cache de estados
  - Batch processing
  - Performance tuning

---

## 🎓 Lecciones Aprendidas

### Técnicas

1. **Idempotencia es crucial**: Los webhooks pueden llamarse múltiples veces
2. **Logging extensivo**: Fundamental para debugging
3. **Validación de firma**: Seguridad no negociable
4. **Estados claros**: Mapeo explícito entre Flow y sistema interno

### Arquitectura

1. **Separación de concerns**: Servicio Flow independiente
2. **Type safety**: TypeScript ayuda a prevenir errores
3. **Manejo de errores robusto**: Múltiples capas de try-catch
4. **Transacciones atómicas**: Orden + Items + Transacción

---

## ✅ Conclusión

Sistema de pagos Flow completamente integrado y funcional:

- ✅ **Backend robusto** con todas las funcionalidades necesarias
- ✅ **Frontend intuitivo** con experiencia de usuario clara
- ✅ **Base de datos preparada** para almacenar transacciones
- ✅ **Seguridad implementada** con firmas y validaciones
- ✅ **Documentación completa** para desarrollo y operación
- ✅ **Listo para testing** en ambiente sandbox

### Próximo paso crítico

⚠️ **Antes de ir a producción:**

1. Testing exhaustivo en sandbox
2. Obtener credenciales de producción
3. Configurar webhook público
4. Implementar monitoreo
5. Preparar plan de rollback

---

**Implementado por**: GitHub Copilot  
**Fecha**: 16 de Noviembre, 2024  
**Estado**: ✅ LISTO PARA TESTING EN SANDBOX

---

*Alma - Dulces Caseros Artesanales*  
*Sistema de Pagos Online con Flow*  
*Hecho con ❤️ en Temuco, Chile* 🍰
