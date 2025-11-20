import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

async function createTable() {
  console.log("Conectando a la base de datos...");

  // Parsear DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL no está definida en .env");
  }

  // Formato: mysql://user:password@host:port/database
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error("Formato de DATABASE_URL inválido");
  }

  const [, user, password, host, port, database] = match;

  console.log(`Conectando a ${host}:${port}/${database}...`);

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
  });

  console.log("✓ Conectado");

  try {
    // Verificar si la tabla ya existe
    const [tables] = await connection.execute(
      'SHOW TABLES LIKE "blockedDates"'
    );

    if (tables.length > 0) {
      console.log("✓ La tabla blockedDates ya existe");
    } else {
      console.log("Creando tabla blockedDates...");

      await connection.execute(`
        CREATE TABLE blockedDates (
          id INT AUTO_INCREMENT NOT NULL,
          date TIMESTAMP NOT NULL,
          reason VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT blockedDates_id PRIMARY KEY(id)
        )
      `);

      console.log("✓ Tabla blockedDates creada exitosamente");
    }

    // Verificar si la tabla dispatchSettings existe
    const [dispatchTables] = await connection.execute(
      'SHOW TABLES LIKE "dispatchSettings"'
    );

    if (dispatchTables.length > 0) {
      console.log("✓ La tabla dispatchSettings ya existe");
    } else {
      console.log("Creando tabla dispatchSettings...");

      await connection.execute(`
        CREATE TABLE dispatchSettings (
          id INT AUTO_INCREMENT NOT NULL,
          availableDays TEXT NOT NULL,
          startTime VARCHAR(5) NOT NULL DEFAULT '09:00',
          endTime VARCHAR(5) NOT NULL DEFAULT '18:00',
          minAdvanceDays INT NOT NULL DEFAULT 1,
          maxAdvanceDays INT NOT NULL DEFAULT 30,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT dispatchSettings_id PRIMARY KEY(id)
        )
      `);

      console.log("✓ Tabla dispatchSettings creada exitosamente");
    }

    // Mostrar estructura de las tablas
    console.log("\n--- Estructura de blockedDates ---");
    const [structure1] = await connection.execute("DESCRIBE blockedDates");
    console.table(structure1);

    console.log("\n--- Estructura de dispatchSettings ---");
    const [structure2] = await connection.execute("DESCRIBE dispatchSettings");
    console.table(structure2);
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log("\n✓ Conexión cerrada");
  }
}

createTable().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
