import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Agregando columna username...");

try {
  // Agregar columna username
  await connection.query(`
    ALTER TABLE users 
    ADD COLUMN username VARCHAR(64) NULL UNIQUE AFTER id
  `);
  console.log("✓ Columna username agregada");

  // Crear índice para username
  await connection.query(`
    CREATE INDEX idx_users_username ON users(username)
  `);
  console.log("✓ Índice para username creado");

  // Crear índice para email si no existe
  try {
    await connection.query(`
      CREATE INDEX idx_users_email ON users(email)
    `);
    console.log("✓ Índice para email creado");
  } catch (e) {
    console.log("- Índice para email ya existe");
  }

  // Actualizar usuario existente con username basado en email
  await connection.query(`
    UPDATE users 
    SET username = SUBSTRING_INDEX(email, '@', 1)
    WHERE username IS NULL AND email IS NOT NULL
  `);
  console.log("✓ Usuarios actualizados con username");

  console.log("\n✅ Migración completada exitosamente");
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await connection.end();
}
