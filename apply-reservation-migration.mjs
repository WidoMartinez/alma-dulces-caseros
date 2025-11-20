import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL no está definida");
    process.exit(1);
  }

  console.log("Conectando a la base de datos...");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("Creando tabla reservationItems...");

    // Crear tabla reservationItems
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`reservationItems\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`reservationId\` int NOT NULL,
        \`productId\` int NOT NULL,
        \`quantity\` int NOT NULL,
        CONSTRAINT \`reservationItems_id\` PRIMARY KEY(\`id\`)
      );
    `);

    console.log("✅ Tabla reservationItems creada");

    // Migrar datos existentes si hay registros en reservations con productId
    console.log("Verificando si hay reservas existentes para migrar...");

    const [existingReservations] = await connection.execute(`
      SELECT id, productId, quantity 
      FROM reservations 
      WHERE productId IS NOT NULL
    `);

    if (
      Array.isArray(existingReservations) &&
      existingReservations.length > 0
    ) {
      console.log(
        `Migrando ${existingReservations.length} reservas existentes...`
      );

      for (const reservation of existingReservations) {
        await connection.execute(
          `
          INSERT INTO reservationItems (reservationId, productId, quantity)
          VALUES (?, ?, ?)
        `,
          [reservation.id, reservation.productId, reservation.quantity]
        );
      }

      console.log("✅ Datos migrados a reservationItems");
    } else {
      console.log("No hay reservas existentes para migrar");
    }

    // Eliminar columnas productId y quantity de reservations
    console.log("Eliminando columnas productId y quantity de reservations...");

    try {
      await connection.execute(
        `ALTER TABLE \`reservations\` DROP COLUMN \`productId\``
      );
      console.log("✅ Columna productId eliminada");
    } catch (error) {
      console.log("ℹ️ Columna productId ya fue eliminada o no existe");
    }

    try {
      await connection.execute(
        `ALTER TABLE \`reservations\` DROP COLUMN \`quantity\``
      );
      console.log("✅ Columna quantity eliminada");
    } catch (error) {
      console.log("ℹ️ Columna quantity ya fue eliminada o no existe");
    }

    console.log("\n✅ Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
