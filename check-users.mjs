import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Verificando usuarios existentes...");

try {
  const [rows] = await connection.query("SHOW COLUMNS FROM users");
  console.log("\nColumnas actuales en la tabla users:");
  console.table(rows);

  const [users] = await connection.query("SELECT * FROM users");
  console.log("\nUsuarios existentes:", users.length);
  console.table(users);
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await connection.end();
}
