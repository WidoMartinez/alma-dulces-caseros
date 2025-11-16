# Agente Especializado en Base de Datos: Drizzle ORM y MySQL

## Descripción
Este agente está diseñado para ayudar a los desarrolladores a interactuar con bases de datos utilizando Drizzle ORM, una biblioteca ligera para trabajar con bases de datos SQL en JavaScript, y MySQL, uno de los sistemas de gestión de bases de datos más populares y utilizados en la industria.

## Funciones del Agente
1. **Conexión a la Base de Datos**: Establecer una conexión con la base de datos MySQL utilizando Drizzle ORM.
2. **Consultas SQL**: Realizar consultas SQL de manera sencilla y asegurar la integridad de los datos.
3. **Migraciones de Base de Datos**: Facilitar la creación y actualización de esquemas de bases de datos.
4. **Validación de Datos**: Implementar validaciones para asegurarse de que los datos ingresados cumplan con las reglas definidas.
5. **Manejo de Errores**: Gestión eficiente de errores relacionados con la base de datos.

## Ejemplo de Uso
```javascript
import { drizzle } from 'drizzle-orm/mysql';

const db = drizzle(mysqlConnection);

async function obtenerUsuarios() {
    return await db.select().from('usuarios');
}
```

## Recursos Adicionales
- [Documentación de Drizzle ORM](https://orm.drizzle.team)
- [Documentación de MySQL](https://dev.mysql.com/doc/)