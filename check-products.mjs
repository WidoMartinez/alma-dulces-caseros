import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Verificando productos...");

try {
  const [categories] = await connection.query("SELECT * FROM categories");
  console.log("\n📂 Categorías:", categories.length);
  console.table(categories);

  const [products] = await connection.query("SELECT * FROM products");
  console.log("\n🍰 Productos:", products.length);
  console.table(products);
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await connection.end();
}
