# Guía de Migración: De OAuth a Autenticación Local

Esta guía te ayudará a migrar de OAuth externo a autenticación local.

## ⚠️ Importante

Esta migración es necesaria si:
- Actualmente usas OAuth (Manus) para autenticación
- Quieres eliminar la dependencia de servicios externos
- Deseas tener control completo sobre la autenticación

## Pasos de Migración

### 1. Actualizar Variables de Entorno

Edita tu archivo `.env`:

**ELIMINAR (ya no se necesitan):**
```env
OWNER_OPEN_ID=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
VITE_APP_ID=...
```

**AGREGAR/VERIFICAR:**
```env
# Base de datos (debe estar configurada)
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces

# Secreto JWT (IMPORTANTE: genera uno seguro)
JWT_SECRET=tu-secreto-jwt-muy-seguro-aqui

# Opcional
PORT=3000
NODE_ENV=production
```

**Generar un JWT_SECRET seguro:**
```bash
# En Linux/Mac
openssl rand -base64 32

# O en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

Esto instalará las nuevas dependencias:
- `bcrypt` - Para hash de contraseñas
- `express-rate-limit` - Para protección contra fuerza bruta

### 3. Actualizar Base de Datos

**Opción A: Usando Drizzle (Recomendado)**
```bash
npm run db:push
```

**Opción B: Migración SQL Manual**

Si prefieres ejecutar la migración SQL directamente:

```bash
# Conecta a tu base de datos MySQL
mysql -u usuario -p alma_dulces

# Ejecuta el archivo de migración
source drizzle/migrations/0002_add_local_auth.sql;
```

O ejecuta manualmente estas consultas SQL:

```sql
ALTER TABLE `users` 
  ADD COLUMN `username` VARCHAR(64) NULL UNIQUE AFTER `id`,
  ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`,
  MODIFY COLUMN `openId` VARCHAR(64) NULL;

CREATE INDEX idx_users_username ON `users`(`username`);
CREATE INDEX idx_users_email ON `users`(`email`);
```

### 4. Crear Usuario Administrador

```bash
# Sintaxis
node create-admin.mjs <username> <email> <password> [nombre]

# Ejemplo
node create-admin.mjs admin admin@alma-dulces.cl MiPassword123 "Admin Principal"
```

**Importante:**
- Usa una contraseña segura (mínimo 8 caracteres)
- Anota las credenciales en un lugar seguro
- Puedes crear múltiples administradores ejecutando el script varias veces

### 5. Compilar y Ejecutar

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

### 6. Probar el Nuevo Sistema

1. Abre tu navegador en `http://localhost:3000/login` (o tu dominio)
2. Ingresa las credenciales del administrador creado
3. Verifica que seas redirigido a `/admin`
4. Prueba las funcionalidades del panel
5. Cierra sesión y vuelve a entrar para verificar

### 7. Verificar Seguridad

Prueba las protecciones de seguridad:

**Rate Limiting:**
```bash
# Intenta iniciar sesión 6 veces con contraseña incorrecta
# En el intento 6, deberías recibir mensaje de "Demasiados intentos"
```

**Sesión persistente:**
```bash
# Cierra el navegador
# Vuelve a abrir y navega a /admin
# Deberías seguir autenticado (sesión de 1 año)
```

## Migración de Usuarios Existentes (Opcional)

Si tienes usuarios existentes con OAuth que quieres migrar:

### Opción 1: Mantener ambos sistemas temporalmente

El sistema soporta tanto usuarios OAuth (con `openId`) como usuarios locales (con `username`/`password`). Puedes:

1. Mantener los usuarios OAuth existentes funcionando
2. Crear nuevos usuarios admin con autenticación local
3. Eventualmente, agregar passwords a usuarios OAuth existentes si es necesario

### Opción 2: Migrar usuarios OAuth a local

```sql
-- Ejemplo: Agregar username y password a usuario OAuth existente
UPDATE users 
SET 
  username = 'admin',
  password = '$2b$12$...' -- hash bcrypt generado
WHERE openId = 'id-oauth-antiguo';
```

**Nota:** Necesitarás generar el hash de la contraseña con bcrypt:

```javascript
// Script temporal para generar hash
import bcrypt from 'bcrypt';
const password = 'NuevaPassword123';
const hash = await bcrypt.hash(password, 12);
console.log(hash);
```

## Despliegue en Producción

### Hostinger (Archivos PHP)
Los archivos PHP en Hostinger no se ven afectados por estos cambios. El sistema de notificaciones por email sigue funcionando igual.

### Render.com (Backend Node.js)

1. **Actualizar variables de entorno en Render.com:**
   - Agregar `JWT_SECRET` (valor seguro)
   - Eliminar variables de OAuth si las tenías
   - Mantener `DATABASE_URL`

2. **Re-desplegar la aplicación**
   - Render detectará los cambios y re-desplegará automáticamente
   - O puedes hacer un deploy manual desde el dashboard

3. **Crear administrador en producción:**
   ```bash
   # Conecta por SSH a Render (si está disponible) o usa un script
   # Alternativamente, crea el usuario directamente en la BD de producción
   ```

## Rollback (Volver a OAuth)

Si necesitas revertir los cambios:

1. Restaura el código de la rama anterior
2. Ejecuta `npm install --legacy-peer-deps`
3. Restaura las variables de entorno de OAuth
4. Re-despliega

**Nota:** Los usuarios creados con autenticación local seguirán existiendo en la BD, pero no podrán iniciar sesión con el sistema OAuth.

## Soporte y Problemas

### Problema: No puedo iniciar sesión

**Solución:**
1. Verifica que `JWT_SECRET` esté configurado en `.env`
2. Verifica que la base de datos tenga las columnas `username` y `password`
3. Verifica que el usuario exista con: `SELECT * FROM users WHERE username='admin';`
4. Revisa los logs del servidor para más detalles

### Problema: "Database not available"

**Solución:**
1. Verifica que `DATABASE_URL` esté correcta en `.env`
2. Verifica que MySQL esté corriendo
3. Prueba la conexión: `mysql -h host -u user -p database`

### Problema: Error en rate limiting

**Solución:**
1. Espera 15 minutos
2. O reinicia el servidor para resetear el contador
3. Verifica que estés usando las credenciales correctas

## Beneficios del Nuevo Sistema

✅ **Sin dependencias externas**: Control total sobre autenticación
✅ **Más seguro**: Hash bcrypt + JWT + rate limiting
✅ **Más simple**: Sin configuración OAuth compleja
✅ **Más rápido**: Sin llamadas a APIs externas
✅ **Más económico**: Sin costos de servicios OAuth
✅ **Más privado**: Datos de usuarios en tu propia BD

## Checklist de Migración

- [ ] Variables de entorno actualizadas
- [ ] Dependencias instaladas
- [ ] Base de datos migrada
- [ ] Usuario admin creado
- [ ] Login probado localmente
- [ ] Panel admin accesible
- [ ] Rate limiting verificado
- [ ] Sesiones persistentes verificadas
- [ ] Despliegue en producción (si aplica)
- [ ] Login probado en producción

---

**Fecha de migración:** Noviembre 2024
**Versión:** 2.0.0
