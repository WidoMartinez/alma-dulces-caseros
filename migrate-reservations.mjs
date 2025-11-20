import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
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
  const db = drizzle(connection);

  console.log("Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  await connection.end();
  console.log("✅ Migraciones aplicadas exitosamente");
}

main().catch((error) => {
  console.error("❌ Error al aplicar migraciones:", error);
  process.exit(1);
});
