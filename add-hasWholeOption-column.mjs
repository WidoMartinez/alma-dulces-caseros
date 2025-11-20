import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Agregando columna hasWholeOption...\n");

try {
  // Verificar si la columna ya existe
  const [existingColumns] = await connection.query(
    "SHOW COLUMNS FROM products WHERE Field = 'hasWholeOption'"
  );

  if (existingColumns.length > 0) {
    console.log("✓ La columna hasWholeOption ya existe");
  } else {
    // Agregar la columna
    await connection.query(
      "ALTER TABLE `products` ADD COLUMN `hasWholeOption` tinyint DEFAULT 0 NOT NULL"
    );
    console.log("✓ Columna hasWholeOption agregada exitosamente");
  }

  // Verificar todas las columnas relacionadas
  const [columns] = await connection.query(
    "SHOW COLUMNS FROM products WHERE Field IN ('hasWholeOption', 'wholePrice', 'wholeName')"
  );
  console.log("\n📋 Columnas de unidad completa en products:");
  console.table(columns);
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} finally {
  await connection.end();
}

process.exit(0);
