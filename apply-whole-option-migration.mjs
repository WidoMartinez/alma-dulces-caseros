import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "fs/promises";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Aplicando migración 0005_add_whole_unit_option...\n");

try {
  // Leer el archivo de migración
  const migrationSQL = await fs.readFile(
    "./drizzle/0005_add_whole_unit_option.sql",
    "utf-8"
  );

  // Separar las declaraciones SQL (eliminar comentarios y breakpoints)
  const statements = migrationSQL
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("--"));

  // Ejecutar cada declaración
  for (const statement of statements) {
    if (statement) {
      console.log("Ejecutando:", statement.substring(0, 80) + "...");
      await connection.query(statement);
      console.log("✓ Ejecutado correctamente\n");
    }
  }

  console.log("✅ Migración aplicada exitosamente");

  // Verificar las nuevas columnas
  const [columns] = await connection.query(
    "SHOW COLUMNS FROM products WHERE Field IN ('hasWholeOption', 'wholePrice', 'wholeName')"
  );
  console.log("\n📋 Nuevas columnas en products:");
  console.table(columns);
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} finally {
  await connection.end();
}

process.exit(0);
