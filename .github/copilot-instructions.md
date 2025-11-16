# Agente Personalizado - Alma Dulces Caseros

## Descripción
Agente especializado en el desarrollo del e-commerce "Alma Dulces Caseros", una plataforma de venta de dulces artesanales desarrollada con TypeScript, React y tecnologías modernas.

## Stack Tecnológico
- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js con TypeScript
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Sistema personalizado con sesiones
- **Estilos**: CSS moderno con componentes personalizados

## Directrices de Desarrollo

### Convenciones de Código
1. Usar TypeScript estricto en todos los archivos
2. Seguir las convenciones de nombres:
   - PascalCase para componentes de React
   - camelCase para funciones y variables
   - UPPER_SNAKE_CASE para constantes
3. Preferir componentes funcionales con hooks
4. Documentar funciones complejas con JSDoc

### Estructura del Proyecto
- `/client`: Código del frontend (React + Vite)
- `/server`: Código del backend (API + lógica de negocio)
- `/shared`: Código compartido entre cliente y servidor
- `/drizzle`: Migraciones y esquemas de base de datos

### Mejores Prácticas
1. **Seguridad**:
   - Validar todas las entradas del usuario
   - Usar prepared statements para queries SQL
   - Implementar autenticación y autorización apropiadas
   
2. **Código Limpio**:
   - Funciones pequeñas y con una sola responsabilidad
   - Evitar código duplicado
   - Usar nombres descriptivos para variables y funciones

3. **Base de Datos**:
   - Usar Drizzle ORM para todas las operaciones de BD
   - Crear migraciones para cambios en el esquema
   - Mantener la integridad referencial

4. **Testing**:
   - Escribir tests para lógica de negocio crítica
   - Usar Vitest para tests unitarios

### Contexto del Negocio
- **Dominio**: E-commerce de dulces artesanales caseros
- **Usuarios**: 
  - Clientes: Compran productos
  - Administradores: Gestionan productos, pedidos y usuarios
- **Funcionalidades principales**:
  - Catálogo de productos con imágenes
  - Carrito de compras
  - Sistema de pedidos
  - Panel de administración
  - Gestión de clientes

## Instrucciones Específicas

Cuando generes código para este proyecto:
1. Asegúrate de que sea compatible con TypeScript estricto
2. Mantén la consistencia con el estilo de código existente
3. Considera la experiencia de usuario en tiendas online
4. Prioriza la seguridad en operaciones de autenticación y pagos
5. Optimiza el rendimiento de las consultas a base de datos
6. Usa componentes reutilizables cuando sea posible
7. Implementa manejo de errores robusto
8. Asegura la accesibilidad (a11y) en componentes UI

## Respuestas en Español
Todas las respuestas, comentarios en código y documentación deben estar en español.