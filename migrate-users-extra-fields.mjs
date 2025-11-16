import mysql from "mysql2/promise";
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function columnExists(table, column) {
  const [rows] = await connection.query(
    "SHOW COLUMNS FROM `" + table + "` LIKE ?",
    [column]
  );
  return rows.length > 0;
}

try {
  console.log("Verificando columnas faltantes en `users`...");

  const needsDelivery = !(await columnExists('users', 'deliveryAddress'));
  const needsPhone = !(await columnExists('users', 'phone'));

  if (!needsDelivery && !needsPhone) {
    console.log("No hay cambios: columnas ya existen.");
    process.exit(0);
  }

  let alterParts = [];
  if (needsDelivery) alterParts.push("ADD COLUMN `deliveryAddress` TEXT NULL");
  if (needsPhone) alterParts.push("ADD COLUMN `phone` VARCHAR(20) NULL");

  const sql = `ALTER TABLE \`users\` ${alterParts.join(', ')}`;
  console.log("Ejecutando:", sql);
  await connection.query(sql);
  console.log("✓ Migración aplicada correctamente");

  const [cols] = await connection.query("SHOW COLUMNS FROM users");
  console.table(cols);
} catch (e) {
  console.error("❌ Error en migración:", e.message);
  process.exit(1);
} finally {
  await connection.end();
}
