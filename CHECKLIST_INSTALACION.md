# ✅ Checklist de Instalación - Panel de Administración

## Paso a Paso para Poner en Producción

### 📋 Pre-requisitos
- [ ] Node.js 18+ instalado
- [ ] MySQL 8+ instalado y ejecutándose
- [ ] Base de datos `alma_dulces` creada
- [ ] Usuario MySQL con permisos configurado
- [ ] Archivo `.env` con `DATABASE_URL` configurado
- [ ] Al menos un usuario con rol `admin` en la BD

---

### 🗄️ Paso 1: Base de Datos

#### A. Verificar conexión a la base de datos
```bash
# Conéctate a MySQL y verifica la base de datos
mysql -u usuario -p

# En MySQL:
USE alma_dulces;
SHOW TABLES;
```

#### B. Generar y aplicar migraciones
```bash
npm run db:push
```

**Resultado esperado:**
```
✓ Generating...
✓ Migrating...
✓ Done!
```

#### C. Verificar que se crearon las tablas
```bash
# En MySQL:
SHOW TABLES LIKE 'dispatchSettings';
SHOW TABLES LIKE 'blockedDates';

DESCRIBE dispatchSettings;
DESCRIBE blockedDates;
```

**Deberías ver:**
- Tabla `dispatchSettings` con 7 columnas
- Tabla `blockedDates` con 3 columnas

---

### 🚀 Paso 2: Iniciar la Aplicación

#### A. Instalar dependencias (si no lo has hecho)
```bash
npm install
```

#### B. Verificar que el build funciona
```bash
npm run build
```

#### C. Iniciar en modo desarrollo
```bash
npm run dev
```

**Resultado esperado:**
```
Server running on http://localhost:5000
```

---

### 👤 Paso 3: Verificar Usuario Administrador

#### A. Verificar que existe un usuario admin
```bash
# Opción 1: Usar script de verificación
node check-users.mjs

# Opción 2: Consultar directamente en MySQL
# En MySQL:
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

#### B. Si no existe admin, crear uno
```bash
node create-admin.mjs
```

---

### 🧪 Paso 4: Pruebas Funcionales

#### A. Login como administrador
- [ ] Abrir navegador en `http://localhost:5000`
- [ ] Ir a `/login`
- [ ] Ingresar credenciales de admin
- [ ] Verificar que redirecciona correctamente

#### B. Acceder al panel de administración
- [ ] Navegar a `/admin`
- [ ] Verificar que se muestra el panel
- [ ] Verificar que hay 4 tabs visibles:
  - Productos
  - Reservas
  - Despachos
  - Fechas Bloqueadas

#### C. Probar tab de Reservas
- [ ] Clic en tab "Reservas"
- [ ] Verificar que se muestra la tabla (vacía o con datos)
- [ ] Probar filtro por estado
- [ ] Probar búsqueda
- [ ] Si hay reservas, cambiar el estado de una

#### D. Probar tab de Despachos
- [ ] Clic en tab "Despachos"
- [ ] Verificar que se muestra la configuración predeterminada:
  - Días: Lunes a Viernes
  - Horario: 09:00 - 18:00
  - Anticipación: 1 - 30 días
- [ ] Modificar días disponibles
- [ ] Modificar horarios
- [ ] Clic en "Guardar Configuración"
- [ ] Verificar mensaje de éxito

#### E. Probar tab de Fechas Bloqueadas
- [ ] Clic en tab "Fechas Bloqueadas"
- [ ] Clic en "Agregar Fecha"
- [ ] Seleccionar una fecha futura
- [ ] Ingresar razón (ej: "Feriado Nacional")
- [ ] Guardar
- [ ] Verificar que aparece en la tabla
- [ ] Eliminar la fecha de prueba
- [ ] Confirmar eliminación

#### F. Verificar seguridad
- [ ] Cerrar sesión
- [ ] Intentar acceder a `/admin` sin login
- [ ] Verificar que redirecciona a `/login`
- [ ] Login como usuario normal (no admin)
- [ ] Intentar acceder a `/admin`
- [ ] Verificar mensaje "Acceso Denegado"

---

### 📱 Paso 5: Pruebas Responsive

- [ ] Abrir panel en dispositivo móvil o usar DevTools responsive mode
- [ ] Verificar que los tabs se muestran correctamente
- [ ] Verificar que las tablas son scrolleables
- [ ] Verificar que los formularios son usables
- [ ] Verificar que los diálogos se adaptan al tamaño

---

### 🔒 Paso 6: Verificación de Seguridad

#### A. Endpoints protegidos
```bash
# Intentar acceder a endpoint admin sin autenticación
curl http://localhost:5000/api/trpc/admin.reservations.list

# Debería retornar error 401 Unauthorized
```

#### B. Validación de datos
- [ ] Intentar agregar fecha bloqueada con fecha vacía
- [ ] Verificar mensaje de error
- [ ] Intentar guardar configuración con horarios inválidos
- [ ] Verificar validación

---

### 📊 Paso 7: Verificación de Base de Datos

```sql
-- Verificar configuración inicial
SELECT * FROM dispatchSettings;
-- Debería haber 1 registro con la configuración predeterminada

-- Verificar fechas bloqueadas (si agregaste alguna)
SELECT * FROM blockedDates;

-- Verificar reservas (si existen)
SELECT * FROM reservations;
```

---

### ✅ Checklist Final

- [ ] Migraciones aplicadas correctamente
- [ ] Aplicación inicia sin errores
- [ ] Usuario admin puede acceder al panel
- [ ] Todas las tabs funcionan correctamente
- [ ] Filtros y búsquedas funcionan
- [ ] Se puede modificar configuración de despachos
- [ ] Se pueden agregar/eliminar fechas bloqueadas
- [ ] Usuarios no admin no pueden acceder
- [ ] Diseño responsive funciona en móvil
- [ ] Validaciones funcionan correctamente
- [ ] Base de datos se actualiza correctamente

---

### 🎉 ¡Instalación Completa!

Si todos los ítems están marcados, el panel de administración está listo para usar en producción.

---

### 🐛 Solución de Problemas

#### Error: "DATABASE_URL is required"
**Solución**: Copia `.env.example` a `.env` y configura la URL de la base de datos.

#### Error: "Access denied for user"
**Solución**: Verifica usuario y contraseña en `DATABASE_URL`.

#### Error: "Table doesn't exist"
**Solución**: Ejecuta `npm run db:push` para crear las tablas.

#### Error: "Forbidden" en panel admin
**Solución**: Verifica que tu usuario tenga `role = 'admin'` en la base de datos.

#### Tab de Reservas vacío
**Esto es normal**: Si no hay reservas en la base de datos, la tabla estará vacía.

---

### 📞 Soporte

Si encuentras problemas no listados aquí:
1. Revisa los archivos de documentación
2. Consulta los logs del servidor (`npm run dev`)
3. Contacta al equipo de desarrollo

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
