import mysql from "mysql2/promise";
import "dotenv/config";

console.log("Probando conexión a la base de datos...");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL?.replace(/:[^:@]*@/, ":***@")
);

try {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("✓ Conexión exitosa!");

  const [rows] = await connection.execute(
    "SELECT COUNT(*) as count FROM products"
  );
  console.log("✓ Productos en la base de datos:", rows[0].count);

  await connection.end();
} catch (error) {
  console.error("✗ Error de conexión:", error.message);
  console.log("\nUsando datos mock en su lugar...");
}
