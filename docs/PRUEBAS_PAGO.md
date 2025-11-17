# Guía de Pruebas - Sistema de Pagos Flow

## 🧪 Objetivo

Esta guía te ayudará a probar el sistema de pagos Flow en ambiente de desarrollo (sandbox).

---

## 📋 Prerrequisitos

### 1. Configuración de Entorno

Asegúrate de tener tu archivo `.env` configurado:

```env
# Flow Sandbox (Pruebas)
FLOW_API_KEY=tu-api-key-sandbox
FLOW_SECRET_KEY=tu-secret-key-sandbox
FLOW_API_URL=https://sandbox.flow.cl/api
FLOW_RETURN_URL=http://localhost:5000/payment/success
FLOW_CANCEL_URL=http://localhost:5000/payment/error

# Base de datos
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces

# JWT
JWT_SECRET=tu-secreto-jwt
```

### 2. Base de Datos

Ejecutar la migración de la tabla de transacciones de pago:

```bash
# Opción 1: Con Drizzle
npm run db:push

# Opción 2: Manual
mysql -u usuario -p alma_dulces < drizzle/0003_add_payment_transactions.sql
```

Verificar que la tabla fue creada:

```sql
USE alma_dulces;
SHOW TABLES LIKE 'paymentTransactions';
DESCRIBE paymentTransactions;
```

### 3. Servidor en Ejecución

```bash
# Instalar dependencias si es necesario
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor debería estar corriendo en `http://localhost:5000`

---

## 🔍 Pruebas Paso a Paso

### Test 1: Flujo Completo de Pago Exitoso

**Objetivo**: Verificar que un pago se complete correctamente desde inicio a fin.

#### Pasos:

1. **Navegar a la página principal**
   ```
   http://localhost:5000
   ```

2. **Agregar productos al carrito**
   - Hacer clic en cualquier producto
   - Hacer clic en "Agregar al Carrito"
   - Repetir con al menos 2 productos

3. **Ver el carrito**
   - Hacer clic en el ícono del carrito
   - Verificar que los productos estén listados
   - Verificar que el total sea correcto

4. **Ir a checkout**
   - Hacer clic en "Proceder al Pago"
   - Deberías ser redirigido a `/checkout`

5. **Completar formulario de entrega**
   ```
   Nombre: Test Usuario
   Email: test@ejemplo.com
   Teléfono: +56912345678
   Dirección: Calle Test 123, Temuco, Chile
   Fecha de entrega: (opcional)
   Notas: (opcional)
   ```

6. **Iniciar pago**
   - Hacer clic en "Proceder al Pago"
   - Esperar a ser redirigido a Flow

7. **Completar pago en Flow Sandbox**
   - Seleccionar método de pago (ej: Webpay)
   - Usar tarjeta de prueba (ver documentación de Flow)
   - Completar el proceso de pago

8. **Verificar redirección a página de éxito**
   - Deberías ser redirigido a `/payment/success`
   - Verificar que se muestre mensaje de éxito
   - Verificar que se muestren los detalles del pago

9. **Verificar en base de datos**
   ```sql
   -- Ver la orden creada
   SELECT * FROM orders ORDER BY id DESC LIMIT 1;
   
   -- Ver la transacción de pago
   SELECT * FROM paymentTransactions ORDER BY id DESC LIMIT 1;
   
   -- Verificar que status sea 'completed' y orden 'confirmed'
   ```

**Resultado esperado**: ✅ Pago completado, orden confirmada, transacción registrada.

---

### Test 2: Pago Cancelado

**Objetivo**: Verificar el manejo cuando el usuario cancela el pago.

#### Pasos:

1. Seguir pasos 1-6 del Test 1
2. En la página de Flow, hacer clic en "Cancelar" o cerrar la ventana
3. Verificar redirección a `/payment/error`
4. Verificar mensaje de error apropiado

**Resultado esperado**: ✅ Página de error mostrada, orden permanece pending.

---

### Test 3: Pago Rechazado

**Objetivo**: Verificar el manejo cuando el pago es rechazado.

#### Pasos:

1. Seguir pasos 1-6 del Test 1
2. En Flow, usar una tarjeta de prueba que simule rechazo
3. Verificar que Flow muestre error
4. Verificar redirección apropiada

**Resultado esperado**: ✅ Error manejado correctamente, transacción marcada como rejected.

---

### Test 4: Usuario Registrado vs Invitado

**Objetivo**: Verificar que el flujo funcione tanto para usuarios registrados como invitados.

#### Usuario Registrado:

1. Registrarse en `/register` o iniciar sesión en `/login`
2. Agregar productos al carrito
3. Ir a checkout
4. Verificar que los datos estén pre-llenados desde el perfil
5. Completar pago

**Resultado esperado**: ✅ Datos pre-llenados, pago vinculado a usuario.

#### Usuario Invitado:

1. NO iniciar sesión
2. Agregar productos al carrito
3. Ir a checkout
4. Completar todos los datos manualmente
5. Completar pago

**Resultado esperado**: ✅ Formulario vacío, pago sin userId (isGuest = 1).

---

### Test 5: Webhook de Confirmación

**Objetivo**: Verificar que el webhook de Flow actualice correctamente la orden.

#### Pasos:

1. Iniciar un pago (Test 1, pasos 1-6)
2. Completar pago en Flow
3. Observar logs del servidor:
   ```bash
   # Ver logs en tiempo real
   tail -f logs/app.log | grep "\[Flow\]"
   # o si no hay archivo de log
   # observar la consola donde corre npm run dev
   ```
4. Verificar que aparezcan logs de:
   - "Confirmando pago"
   - "Orden confirmada"

**Resultado esperado**: ✅ Webhook recibido, logs generados, orden actualizada.

---

### Test 6: Estados de Transacción

**Objetivo**: Verificar que los estados se mapeen correctamente.

#### Verificar en Base de Datos:

```sql
-- Ver todos los estados de transacciones
SELECT 
  id,
  orderId,
  commerceOrder,
  status,
  amount,
  paymentMethod,
  createdAt
FROM paymentTransactions
ORDER BY id DESC;

-- Ver órdenes con sus transacciones
SELECT 
  o.id as orderId,
  o.trackingNumber,
  o.status as orderStatus,
  o.totalPrice,
  pt.status as paymentStatus,
  pt.paymentMethod
FROM orders o
LEFT JOIN paymentTransactions pt ON pt.orderId = o.id
ORDER BY o.id DESC;
```

**Estados esperados**:
- Transacción: `pending` → `completed`
- Orden: `pending` → `confirmed`

---

## 🐛 Troubleshooting

### Problema: "Credenciales de Flow no configuradas"

**Causa**: Falta FLOW_API_KEY o FLOW_SECRET_KEY en .env  
**Solución**: Verificar y agregar credenciales

### Problema: No se crea la transacción en BD

**Causa**: Tabla no existe o error de conexión  
**Solución**:
```bash
# Verificar conexión
mysql -u usuario -p alma_dulces -e "SHOW TABLES;"

# Verificar tabla
mysql -u usuario -p alma_dulces -e "DESCRIBE paymentTransactions;"

# Recrear si es necesario
mysql -u usuario -p alma_dulces < drizzle/0003_add_payment_transactions.sql
```

### Problema: Webhook no se ejecuta

**Causa**: Flow no puede alcanzar localhost  
**Solución para desarrollo**:
```bash
# Usar ngrok para exponer localhost
ngrok http 5000

# Actualizar FLOW_RETURN_URL en .env con la URL de ngrok
# Actualizar URL de webhook en Flow dashboard
```

### Problema: Redirección incorrecta después del pago

**Causa**: URLs mal configuradas  
**Solución**: Verificar en .env:
```env
FLOW_RETURN_URL=http://localhost:5000/payment/success
FLOW_CANCEL_URL=http://localhost:5000/payment/error
```

---

## 📊 Checklist de Pruebas

Marcar con ✅ cada prueba completada:

- [ ] Test 1: Flujo completo de pago exitoso
- [ ] Test 2: Pago cancelado
- [ ] Test 3: Pago rechazado (si es posible en sandbox)
- [ ] Test 4a: Pago como usuario registrado
- [ ] Test 4b: Pago como invitado
- [ ] Test 5: Webhook de confirmación
- [ ] Test 6: Verificación de estados en BD
- [ ] Logs del servidor funcionando
- [ ] Página de éxito muestra información correcta
- [ ] Página de error muestra mensaje apropiado
- [ ] Email de confirmación (si está implementado)

---

## 📝 Notas Adicionales

### Tarjetas de Prueba Flow

Consultar documentación oficial de Flow para tarjetas de prueba en sandbox:
- https://www.flow.cl/docs/api.html

### Datos de Prueba Sugeridos

```
Nombre: Test Usuario
Email: test+flow@ejemplo.com
Teléfono: +56912345678
Dirección: Av. Alemania 0458, Temuco, Chile
```

### Montos de Prueba

Probar con diferentes montos para verificar cálculos:
- 1 producto: $8,000
- 2 productos: $16,500
- 3+ productos: Variado

### Verificación Post-Prueba

Después de completar todas las pruebas:

1. **Limpar datos de prueba**:
```sql
-- Eliminar transacciones de prueba
DELETE FROM paymentTransactions WHERE paymentData LIKE '%test%';

-- Eliminar órdenes de prueba
DELETE FROM orders WHERE customerEmail LIKE '%test%';
```

2. **Verificar logs** para errores no capturados

3. **Documentar problemas** encontrados

---

## ✅ Conclusión

Si todos los tests pasan correctamente:

✅ Sistema de pagos **FUNCIONAL**  
✅ Listo para **DESPLIEGUE EN SANDBOX**  
✅ Requiere **PRUEBAS EN PRODUCCIÓN** antes de go-live

---

**Última actualización**: 16 de Noviembre, 2024  
**Versión**: 1.0.0  
**Estado**: Listo para pruebas en sandbox

---

*Alma - Dulces Caseros Artesanales*  
*Sistema de Pagos Flow - Guía de Pruebas*
