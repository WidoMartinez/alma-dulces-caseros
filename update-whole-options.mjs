import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Actualizando productos con opciones de unidad completa...\n");

try {
  // Actualizar Tarta de Frutos Rojos - tiene opción completa
  await connection.query(
    "UPDATE products SET hasWholeOption = ?, wholePrice = ?, wholeName = ? WHERE id = ?",
    [1, 25000, "Tarta Completa (8 porciones)", 1]
  );
  console.log("✓ Actualizada: Tarta de Frutos Rojos");

  // Actualizar Tarta de Chocolate - tiene opción completa
  await connection.query(
    "UPDATE products SET hasWholeOption = ?, wholePrice = ?, wholeName = ? WHERE id = ?",
    [1, 28000, "Tarta Completa (8 porciones)", 2]
  );
  console.log("✓ Actualizada: Tarta de Chocolate");

  // Actualizar Brownie de Chocolate Oscuro - tiene opción completa
  await connection.query(
    "UPDATE products SET hasWholeOption = ?, wholePrice = ?, wholeName = ? WHERE id = ?",
    [1, 12000, "Bandeja Completa (12 unidades)", 5]
  );
  console.log("✓ Actualizado: Brownie de Chocolate Oscuro");

  // Actualizar Brownie con Nueces - tiene opción completa
  await connection.query(
    "UPDATE products SET hasWholeOption = ?, wholePrice = ?, wholeName = ? WHERE id = ?",
    [1, 14000, "Bandeja Completa (12 unidades)", 6]
  );
  console.log("✓ Actualizado: Brownie con Nueces");

  // Verificar productos actualizados
  const [updatedProducts] = await connection.query(
    "SELECT * FROM products WHERE hasWholeOption = 1"
  );

  console.log("\n📦 Productos con opción de unidad completa:");
  updatedProducts.forEach(p => {
    console.log(
      `  - ${p.name}: ${p.wholeName} - $${(p.wholePrice / 100).toFixed(0)}`
    );
  });

  console.log("\n✅ Actualización completada exitosamente");
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} finally {
  await connection.end();
}

process.exit(0);
