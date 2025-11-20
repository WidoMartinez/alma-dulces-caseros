import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Probando autenticación...\n");

const testUsername = "admin";
const testPassword = "admin123";

try {
  // Buscar usuario
  const [users] = await connection.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [testUsername, testUsername]
  );

  if (users.length === 0) {
    console.log("❌ Usuario no encontrado:", testUsername);
    process.exit(1);
  }

  const user = users[0];
  console.log("✓ Usuario encontrado:");
  console.log("  - ID:", user.id);
  console.log("  - Username:", user.username);
  console.log("  - Email:", user.email);
  console.log("  - Role:", user.role);
  console.log(
    "  - Password hash:",
    user.password ? user.password.substring(0, 20) + "..." : "NO PASSWORD"
  );

  if (!user.password) {
    console.log("\n❌ El usuario no tiene contraseña configurada");
    process.exit(1);
  }

  // Verificar contraseña
  console.log("\n🔐 Probando contraseña:", testPassword);
  const isValid = await bcrypt.compare(testPassword, user.password);

  if (isValid) {
    console.log("✅ Contraseña correcta - Login debería funcionar");
  } else {
    console.log("❌ Contraseña incorrecta");
    console.log("\n💡 Regenerando contraseña...");

    // Generar nuevo hash
    const newHash = await bcrypt.hash(testPassword, 12);
    await connection.query("UPDATE users SET password = ? WHERE id = ?", [
      newHash,
      user.id,
    ]);

    console.log("✅ Contraseña actualizada para:", testUsername);
    console.log("   Usa estas credenciales:");
    console.log("   Username:", testUsername);
    console.log("   Password:", testPassword);
  }
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} finally {
  await connection.end();
}

process.exit(0);
